"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ACTIVE_CITIES, DIETS, GOALS, LUNCH_TIMES, MAX_TOPICS, PROMPTS, SECTORS, SECTOR_SUGGESTIONS, TOPIC_SUGGESTIONS, TOPICS,
} from "@/lib/config";
import { slotIso, upcomingDays } from "@/lib/time";
import type { OwnProfile } from "@/lib/types";
import { saveOnboarding } from "./actions";

const STEPS = 7;
const WEEK_LABELS = ["Volgende week", "Over 2 weken", "Over 3 weken"];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

type Prefill = { name: string; company: string; picture: string | null };

export default function OnboardingForm({ prefill, profile, slots: initialSlots }: { prefill: Prefill; profile: OwnProfile | null; slots: string[] }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(prefill.name);
  const [role, setRole] = useState(profile?.role ?? "");
  const [company, setCompany] = useState(prefill.company);
  const [sector, setSector] = useState(profile?.sector ?? "");
  const [city, setCity] = useState<string>(profile?.city ?? ACTIVE_CITIES[0]);
  const [targets, setTargets] = useState<string[]>(profile?.target_sectors ?? []);
  const [extraSectors, setExtraSectors] = useState<string[]>(
    (profile?.target_sectors ?? []).filter((s) => !SECTORS.includes(s)),
  );
  const [suggestedFor, setSuggestedFor] = useState<string | null>(profile?.target_sectors?.length ? profile.sector : null);
  const [newSector, setNewSector] = useState("");
  const [topics, setTopics] = useState<string[]>(profile?.topics ?? []);
  const [topicsFor, setTopicsFor] = useState<string | null>(profile?.topics?.length ? profile.sector : null);
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? []);
  const [slots, setSlots] = useState<string[]>(initialSlots);
  const [week, setWeek] = useState(0);
  const [diet, setDiet] = useState<string[]>(profile?.diet?.length ? profile.diet : ["Geen wensen"]);
  const [dietNote, setDietNote] = useState(profile?.diet_note ?? "");
  const [consent, setConsent] = useState(profile?.diet_note_consent ?? false);
  const [p1, setP1] = useState(profile?.prompt_1 ?? "");
  const [p2, setP2] = useState(profile?.prompt_2 ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const days = useMemo(() => upcomingDays(), []);
  const suggested = SECTOR_SUGGESTIONS[sector] ?? [];
  // Onderwerpsuggesties: eerst je eigen branche, aangevuld met de branches die je zoekt.
  const suggestedTopics = [...new Set([
    ...(TOPIC_SUGGESTIONS[sector] ?? []),
    ...targets.flatMap((t) => (TOPIC_SUGGESTIONS[t] ?? []).slice(0, 1)),
  ])].slice(0, 6);

  const valid = [
    !!name.trim() && !!role.trim() && !!sector,
    targets.length > 0,
    topics.length > 0,
    goals.length > 0,
    slots.length > 0,
    !dietNote.trim() || consent,
    true,
  ][step];

  function next() {
    if (step === 0 && sector && suggestedFor !== sector) {
      setTargets(SECTOR_SUGGESTIONS[sector] ?? []);
      setSuggestedFor(sector);
    }
    if (step === 1 && topicsFor !== sector) {
      setTopics(suggestedTopics.slice(0, 3));
      setTopicsFor(sector);
    }
    if (step < STEPS - 1) return setStep(step + 1);
    setError(null);
    startTransition(async () => {
      const res = await saveOnboarding({
        name, role, company, sector, city, targetSectors: targets, topics, goals, slots,
        diet, dietNote, dietNoteConsent: consent, prompt1: p1, prompt2: p2,
      });
      if (res?.error) setError(res.error);
    });
  }

  function addSector() {
    const v = newSector.trim();
    if (!v) return;
    const all = [...SECTORS, ...extraSectors];
    const existing = all.find((x) => x.toLowerCase() === v.toLowerCase());
    const label = existing ?? v.charAt(0).toUpperCase() + v.slice(1);
    if (!existing) setExtraSectors([...extraSectors, label]);
    if (!targets.includes(label)) setTargets([...targets, label]);
    setNewSector("");
  }

  function copyWeek() {
    const weekDays = days.filter((d) => d.week === week);
    const pattern = weekDays.flatMap((d) =>
      LUNCH_TIMES.filter((t) => slots.includes(slotIso(d, t))).map((t) => `${d.abbr}|${t}`),
    );
    if (!pattern.length) return;
    const keep = slots.filter((s) => weekDays.some((d) => LUNCH_TIMES.some((t) => slotIso(d, t) === s)));
    const extra = days
      .filter((d) => d.week !== week)
      .flatMap((d) => LUNCH_TIMES.filter((t) => pattern.includes(`${d.abbr}|${t}`)).map((t) => slotIso(d, t)));
    setSlots([...keep, ...extra]);
  }

  return (
    <div className="onb view-wrap">
      <div className="progress"><i style={{ width: `${((step + 1) / STEPS) * 100}%` }} /></div>

      {step === 0 && (
        <div className="q active">
          <div className="kicker">Stap 1 van {STEPS}</div>
          <h2 className="serif">Wie schuift er aan tafel?</h2>
          <p className="sub">
            {prefill.name ? "Je naam en foto komen uit LinkedIn. " : ""}Vul je functie en branche aan; dit zien je matches als eerste.
          </p>
          {prefill.picture && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={prefill.picture} alt="" className="avimg" style={{ width: 64, height: 64, marginBottom: 16 }} />
          )}
          <div className="row2">
            <div className="field"><label>Naam</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label>Functie</label><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="bijv. Founder" /></div>
          </div>
          <div className="field"><label>Bedrijf</label><input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div className="row2">
            <div className="field">
              <label>In welke branche zit je?</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)}>
                <option value="">Kies je branche…</option>
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Stad waar je wilt lunchen</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {ACTIVE_CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="q active">
          <div className="kicker">Stap 2 van {STEPS}</div>
          <h2 className="serif">Met welke branches wil je in gesprek?</h2>
          <p className="sub">Voorgesteld op basis van je branche ({sector}). Pas gerust aan.</p>
          <div className="chips">
            {[...SECTORS, ...extraSectors].map((s) => (
              <button key={s} className={`chip ${targets.includes(s) ? "on" : ""}`} onClick={() => setTargets(toggle(targets, s))}>
                {s}{suggested.includes(s) && <span className="sug">✦ suggestie</span>}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <input
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSector()}
              placeholder="+ Eigen branche toevoegen, bijv. Zorg"
              style={{ flex: 1, padding: "11px 16px", borderRadius: 999, border: "1.5px dashed var(--line)", outline: "none" }}
            />
            <button className="pill solid" onClick={addSector}>Toevoegen</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="q active">
          <div className="kicker">Stap 3 van {STEPS}</div>
          <h2 className="serif">Waarover wil je netwerken?</h2>
          <p className="sub">
            We hebben er alvast een paar gekozen op basis van je branche{sector ? ` (${sector})` : ""}. Kies 1 tot {MAX_TOPICS}.
          </p>
          <div className="chips">
            {[...suggestedTopics, ...TOPICS.filter((t) => !suggestedTopics.includes(t))].map((t) => (
              <button
                key={t}
                className={`chip ${topics.includes(t) ? "on" : ""}`}
                onClick={() => (topics.includes(t) || topics.length < MAX_TOPICS) && setTopics(toggle(topics, t))}
              >
                {t}{suggestedTopics.includes(t) && <span className="sug">✦ suggestie</span>}
              </button>
            ))}
          </div>
          <div className="counter">{topics.length} / {MAX_TOPICS} gekozen</div>
        </div>
      )}

      {step === 3 && (
        <div className="q active">
          <div className="kicker">Stap 4 van {STEPS}</div>
          <h2 className="serif">Wat zoek je in een gesprek?</h2>
          <p className="sub">Dit bepaalt met wie we je matchen.</p>
          <div className="chips">
            {GOALS.map((g) => (
              <button key={g} className={`chip ${goals.includes(g) ? "on" : ""}`} onClick={() => setGoals(toggle(goals, g))}>{g}</button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="q active">
          <div className="kicker">Stap 5 van {STEPS}</div>
          <h2 className="serif">Wanneer kun je lunchen?</h2>
          <p className="sub">Je agenda staat 3 weken open. Tik alle momenten aan die werken.</p>
          <div className="weektabs">
            {[0, 1, 2].map((w) => {
              const ds = days.filter((d) => d.week === w);
              const n = slots.filter((s) => ds.some((d) => LUNCH_TIMES.some((t) => slotIso(d, t) === s))).length;
              return (
                <button key={w} className={`weektab ${w === week ? "on" : ""}`} onClick={() => setWeek(w)}>
                  <b>{WEEK_LABELS[w]}</b>
                  <small>{ds[0].label} – {ds[4].label}{n ? ` · ${n} gekozen` : ""}</small>
                </button>
              );
            })}
          </div>
          <div className="grid-av">
            <div />
            {days.filter((d) => d.week === week).map((d) => (
              <div key={d.iso} className="h">{d.abbr}<small>{d.label}</small></div>
            ))}
            {LUNCH_TIMES.map((t) => (
              <Row key={t} t={t} days={days.filter((d) => d.week === week)} slots={slots} setSlots={setSlots} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, flexWrap: "wrap", gap: 8 }}>
            <span className="counter" style={{ margin: 0 }}>{slots.length} momenten gekozen</span>
            <button className="alt" style={{ margin: 0 }} onClick={copyWeek}>Deze week kopiëren naar alle 3 weken</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="q active">
          <div className="kicker">Stap 6 van {STEPS}</div>
          <h2 className="serif">Dieetwensen voor de lunch?</h2>
          <p className="sub">We houden er rekening mee bij de restaurantkeuze.</p>
          <div className="chips">
            {DIETS.map((d) => (
              <button
                key={d}
                className={`chip ${diet.includes(d) ? "on" : ""}`}
                onClick={() => {
                  if (d === "Geen wensen") return setDiet(["Geen wensen"]);
                  const nextDiet = toggle(diet.filter((x) => x !== "Geen wensen"), d);
                  setDiet(nextDiet.length ? nextDiet : ["Geen wensen"]);
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="field" style={{ marginTop: 18 }}>
            <label>Allergieën (optioneel)</label>
            <input value={dietNote} onChange={(e) => setDietNote(e.target.value)} placeholder="bijv. ernstige pinda-allergie" />
          </div>
          {dietNote.trim() && (
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              Ik geef toestemming om deze informatie te bewaren en alleen met het restaurant te delen.
              Je lunchpartner ziet dit niet.
            </label>
          )}
        </div>
      )}

      {step === 6 && (
        <div className="q active">
          <div className="kicker">Stap 7 van {STEPS}</div>
          <h2 className="serif">Geef ze iets om op te reageren.</h2>
          <p className="sub">Een concreet antwoord maakt het makkelijker om het gesprek te openen.</p>
          <div className="prompt-card"><div className="pq">{PROMPTS[0]}</div><input value={p1} onChange={(e) => setP1(e.target.value)} placeholder="bijv. B2B-sales en mediadeals sluiten" /></div>
          <div className="prompt-card"><div className="pq">{PROMPTS[1]}</div><input value={p2} onChange={(e) => setP2(e.target.value)} placeholder="bijv. al eens een collectief heeft opgeschaald" /></div>
        </div>
      )}

      {error && <p className="err">{error}</p>}
      <div className="onb-nav">
        <button className="pill ghost" style={{ visibility: step === 0 ? "hidden" : "visible" }} onClick={() => setStep(step - 1)}>← Terug</button>
        <button className="pill green big" disabled={!valid || pending} onClick={next}>
          {step === STEPS - 1 ? (pending ? "Opslaan…" : "Toon mijn matches →") : "Volgende"}
        </button>
      </div>
    </div>
  );
}

function Row({ t, days, slots, setSlots }: {
  t: string; days: ReturnType<typeof upcomingDays>; slots: string[]; setSlots: (s: string[]) => void;
}) {
  return (
    <>
      <div className="rl">{t}</div>
      {days.map((d) => {
        const k = slotIso(d, t);
        const on = slots.includes(k);
        return (
          <button key={k} className={`slot ${on ? "on" : ""}`} onClick={() => setSlots(on ? slots.filter((s) => s !== k) : [...slots, k])} />
        );
      })}
    </>
  );
}
