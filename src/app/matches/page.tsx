import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { scoreCandidate } from "@/lib/matching";
import type { OwnProfile, PublicProfile } from "@/lib/types";
import MatchDeck from "./MatchDeck";

export default async function MatchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single<OwnProfile>();
  if (!me?.onboarded) redirect("/onboarding");

  const now = new Date().toISOString();
  const [{ data: people }, { data: avail }, { data: skips }, { data: lunches }] = await Promise.all([
    supabase.from("public_profiles").select("*").eq("city", me.city).neq("id", user.id),
    supabase.from("availability").select("user_id, starts_at").gte("starts_at", now),
    supabase.from("skips").select("skipped_user").eq("user_id", user.id),
    supabase.from("lunches").select("from_user, to_user, status").in("status", ["voorgesteld", "geaccepteerd", "gereserveerd"]),
  ]);

  const byUser = new Map<string, string[]>();
  for (const a of avail ?? []) {
    const iso = new Date(a.starts_at).toISOString();
    byUser.set(a.user_id, [...(byUser.get(a.user_id) ?? []), iso]);
  }
  const mySlots = new Set(byUser.get(user.id) ?? []);
  const exclude = new Set<string>([
    ...(skips ?? []).map((s) => s.skipped_user),
    ...(lunches ?? []).map((l) => (l.from_user === user.id ? l.to_user : l.from_user)),
  ]);

  const deck = ((people ?? []) as PublicProfile[])
    .filter((p) => !exclude.has(p.id))
    .map((p) => scoreCandidate(me, mySlots, p, byUser.get(p.id) ?? []))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="disc view-wrap">
      <div>
        <div className="disc-head">
          <div>
            <h2 className="serif">Jouw matches in {me.city}</h2>
            <p>Gesorteerd op gedeelde onderwerpen, branche en overlappende lunchmomenten.</p>
          </div>
        </div>
        <MatchDeck deck={deck} myTopics={me.topics} mySector={me.sector} />
      </div>
      <aside className="side">
        <div className="panel">
          <h4>Jouw profiel</h4>
          <div className="me-mini">
            <b>{me.name}</b>
            {me.role}{me.company ? ` · ${me.company}` : ""}
            <br />
            <span style={{ color: "var(--muted)", fontSize: 13 }}>{me.sector}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>Zoekt: {me.target_sectors.join(", ")}</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{mySlots.size} lunchmomenten · {me.city}</p>
          <Link className="alt" href="/onboarding">Aanpassen</Link>
        </div>
        <div className="panel">
          <h4>Mijn lunches</h4>
          <Link className="alt" style={{ marginTop: 0 }} href="/lunches">Bekijk voorstellen en afspraken →</Link>
        </div>
      </aside>
    </div>
  );
}
