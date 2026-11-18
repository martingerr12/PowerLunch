"use client";

import { formatSlot } from "@/lib/time";

/** Keuzelijst met alle lunchmomenten in de komende weken; eigen agenda bovenaan. */
export default function SlotPicker({
  value, onChange, options, preferred, preferredLabel = "In je agenda",
}: {
  value: string; onChange: (v: string) => void; options: string[]; preferred: string[]; preferredLabel?: string;
}) {
  const pref = options.filter((s) => preferred.includes(s));
  const rest = options.filter((s) => !preferred.includes(s));
  return (
    <select className="slot-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Kies een moment…</option>
      {pref.length > 0 && (
        <optgroup label={preferredLabel}>
          {pref.map((s) => <option key={s} value={s}>{formatSlot(s)}</option>)}
        </optgroup>
      )}
      <optgroup label={pref.length ? "Andere momenten" : "Alle momenten"}>
        {rest.map((s) => <option key={s} value={s}>{formatSlot(s)}</option>)}
      </optgroup>
    </select>
  );
}
