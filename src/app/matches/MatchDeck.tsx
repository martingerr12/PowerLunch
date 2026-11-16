"use client";

import { useState, useTransition } from "react";
import Avatar from "@/components/Avatar";
import { PROMPTS } from "@/lib/config";
import { formatSlot } from "@/lib/time";
import type { Candidate } from "@/lib/types";
import { proposeLunch, skipProfile } from "./actions";

export default function MatchDeck({ deck, myTopics, mySector }: { deck: Candidate[]; myTopics: string[]; mySector: string | null }) {
  const [idx, setIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
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

  const chosen = slot && p.slots.includes(slot) ? slot : p.slots[0];
  const prompts = [p.prompt_1, p.prompt_2];

  function advance() {
    setIdx(idx + 1);
    setSlot(null);
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
      setMsg(`Voorstel verstuurd aan ${p.name.split(" ")[0]} voor ${formatSlot(chosen)}. Zodra die akkoord is, kiezen we het restaurant.`);
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
                  <button key={s} className={`tg ${s === chosen ? "match" : ""}`} onClick={() => setSlot(s)}>
                    {formatSlot(s, true)}
                  </button>
                ))
              ) : (
                <span className="tg">Nog geen overlap in jullie agenda&apos;s</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="actions">
        <button className="pill ghost big" style={{ border: "1.5px solid var(--line)", background: "var(--paper)" }} disabled={pending} onClick={skip}>
          Overslaan
        </button>
        <button className="pill green big" disabled={pending || !chosen} onClick={() => propose(null)}>
          {chosen ? `Lunch voorstellen · ${formatSlot(chosen, true)}` : "Geen gezamenlijk moment"}
        </button>
      </div>
    </>
  );
}
