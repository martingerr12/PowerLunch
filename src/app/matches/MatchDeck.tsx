"use client";

import { useState, useTransition } from "react";
import Avatar from "@/components/Avatar";
import SlotPicker from "@/components/SlotPicker";
import { PROMPTS } from "@/lib/config";
import { formatSlot } from "@/lib/time";
import type { Candidate } from "@/lib/types";
import { proposeLunch, skipProfile } from "./actions";

export default function MatchDeck({ deck, myTopics, mySector, mySlots, options }: {
  deck: Candidate[]; myTopics: string[]; mySector: string | null; mySlots: string[]; options: string[];
}) {
  const [idx, setIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [altOpen, setAltOpen] = useState(false);
  const [altSlot, setAltSlot] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const p = deck[idx];

  if (!p) {
    return (
      <div className="profile done">
        <h3 className="serif">Je hebt iedereen gezien.</h3>
        <p>Er komen regelmatig nieuwe profielen bij. Voeg intussen onderwerpen of lunchmomenten toe voor meer matches.</p>
      </div>
    );
  }

  // Gezamenlijk moment, of een zelf gekozen ander moment.
  const useAlt = altOpen || !p.slots.length;
  const chosen = useAlt ? altSlot || null : slot && p.slots.includes(slot) ? slot : p.slots[0];
  const prompts = [p.prompt_1, p.prompt_2];

  function advance() {
    setIdx(idx + 1);
    setSlot(null);
    setAltOpen(false);
    setAltSlot("");
  }
  function skip() {
    start(async () => {
      await skipProfile(p.id);
      advance();
    });
  }
  function propose(promptIndex: number | null) {
    if (!chosen) return;
    setMsg(null);
    start(async () => {
      const res = await proposeLunch(p.id, chosen, promptIndex);
      if (res?.error) return setMsg(res.error);
      const first = p.name.split(" ")[0];
      setMsg(
        p.slots.includes(chosen)
          ? `Voorstel verstuurd aan ${first} voor ${formatSlot(chosen)}. Zodra die akkoord is, kiezen we het restaurant.`
          : `Voorstel verstuurd aan ${first} voor ${formatSlot(chosen)}. Dit moment staat niet in diens agenda; ${first} kan akkoord gaan of een ander moment voorstellen.`,
      );
      advance();
    });
  }

  return (
    <>
      {msg && <div className="notice" style={{ marginBottom: 16 }}>{msg}</div>}
      <div className="profile">
        <div className="p-top">
          <Avatar name={p.name} src={p.linkedin_picture} size={76} />
          <div>
            <h3 className="serif">{p.name.split(" ")[0]}</h3>
            <div className="role">{p.role}{p.company ? ` · ${p.company}` : ""}</div>
            <div className="role" style={{ fontSize: 13 }}>
              {p.sector}
              {p.sector === mySector && " · zelfde branche"}
              {p.inTarget && <span style={{ color: "var(--green)", fontWeight: 600 }}> · ★ branche die je zoekt</span>}
            </div>
          </div>
          <div className="score"><b>{p.score}%</b><span>match</span></div>
        </div>
        <div className="p-body">
          <div className="pblock">
            <div className="pq">Wil netwerken over</div>
            <div className="tagrow">
              {p.topics.map((t) => (
                <span key={t} className={`tg ${myTopics.includes(t) ? "match" : ""}`}>{myTopics.includes(t) ? "✓ " : ""}{t}</span>
              ))}
            </div>
          </div>
          {prompts.map((a, i) =>
            a ? (
              <div className="pblock" key={i}>
                <div className="pq">{PROMPTS[i]}</div>
                <div className="pa">{a}</div>
                {chosen && (
                  <button className="like-mini" disabled={pending} onClick={() => propose(i)}>Reageer →</button>
                )}
              </div>
            ) : null,
          )}
          <div className="pblock">
            <div className="pq">Gezamenlijke lunchmomenten</div>
            <div className="overlap">
              {p.slots.length ? (
                p.slots.slice(0, 8).map((s) => (
                  <button key={s} className={`tg ${!useAlt && s === chosen ? "match" : ""}`} onClick={() => { setSlot(s); setAltOpen(false); }}>
                    {formatSlot(s, true)}
                  </button>
                ))
              ) : (
                <span className="tg">Nog geen overlap in jullie agenda&apos;s</span>
              )}
            </div>
            {useAlt ? (
              <div className="alt-slot">
                <p>Kies een ander moment. {p.name.split(" ")[0]} kan akkoord gaan of zelf een nieuw moment voorstellen.</p>
                <SlotPicker value={altSlot} onChange={setAltSlot} options={options} preferred={mySlots} />
                {p.slots.length > 0 && (
                  <button className="alt" style={{ marginTop: 0 }} onClick={() => setAltOpen(false)}>← Terug naar gezamenlijke momenten</button>
                )}
              </div>
            ) : (
              <button className="alt" onClick={() => setAltOpen(true)}>Ander moment voorstellen</button>
            )}
          </div>
        </div>
      </div>
      <div className="actions">
        <button className="pill ghost big" style={{ border: "1.5px solid var(--line)", background: "var(--paper)" }} disabled={pending} onClick={skip}>
          Overslaan
        </button>
        <button className="pill green big" disabled={pending || !chosen} onClick={() => propose(null)}>
          {chosen ? `Lunch voorstellen · ${formatSlot(chosen, true)}` : "Kies eerst een moment"}
        </button>
      </div>
    </>
  );
}
