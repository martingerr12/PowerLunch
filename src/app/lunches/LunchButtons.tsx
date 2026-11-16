"use client";

import { useState, useTransition } from "react";
import { acceptLunch, cancelLunch, declineLunch } from "./actions";

export function LunchButtons({ id, kind }: { id: number; kind: "incoming" | "upcoming" | "sent" }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {kind === "incoming" && (
        <>
          <button className="pill ghost" disabled={pending} onClick={() => start(() => declineLunch(id))}>Afwijzen</button>
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
