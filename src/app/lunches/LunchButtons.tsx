"use client";

import { useState, useTransition } from "react";
import SlotPicker from "@/components/SlotPicker";
import { acceptLunch, cancelLunch, counterLunch, declineLunch } from "./actions";

export function LunchButtons({ id, kind, options, mySlots }: {
  id: number; kind: "incoming" | "upcoming" | "sent"; options: string[]; mySlots: string[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [counter, setCounter] = useState(false);
  const [slot, setSlot] = useState("");

  if (counter) {
    return (
      <div className="alt-slot" style={{ width: "100%" }}>
        <SlotPicker value={slot} onChange={setSlot} options={options} preferred={mySlots} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="pill ghost" disabled={pending} onClick={() => setCounter(false)}>Terug</button>
          <button
            className="pill green"
            disabled={pending || !slot}
            onClick={() =>
              start(async () => {
                const res = await counterLunch(id, slot);
                if (res?.error) setError(res.error);
                else setCounter(false);
              })
            }
          >
            Nieuw moment voorstellen
          </button>
        </div>
        {error && <span className="err">{error}</span>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {kind === "incoming" && (
        <>
          <button className="pill ghost" disabled={pending} onClick={() => start(() => declineLunch(id))}>Afwijzen</button>
          <button className="pill ghost" disabled={pending} onClick={() => setCounter(true)}>Ander moment</button>
          <button
            className="pill green"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await acceptLunch(id);
                if (res?.error) setError(res.error);
              })
            }
          >
            Akkoord
          </button>
        </>
      )}
      {kind !== "incoming" && (
        <button className="pill ghost" disabled={pending} onClick={() => start(() => cancelLunch(id))}>Annuleren</button>
      )}
      {error && <span className="err">{error}</span>}
    </div>
  );
}
