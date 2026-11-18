import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import { PROMPTS } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { allSlots, formatSlot } from "@/lib/time";
import type { LunchStatus, PublicProfile, Restaurant } from "@/lib/types";
import { LunchButtons } from "./LunchButtons";

type Lunch = {
  id: number;
  from_user: string;
  to_user: string;
  starts_at: string;
  status: LunchStatus;
  prompt_index: number | null;
  restaurant_id: number | null;
};

const STATUS_LABEL: Record<LunchStatus, string> = {
  voorgesteld: "Wacht op reactie",
  geaccepteerd: "Akkoord · tafel wordt gereserveerd",
  gereserveerd: "Tafel bevestigd",
  afgewezen: "Afgewezen",
  geannuleerd: "Geannuleerd",
};

export default async function LunchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lunches } = await supabase
    .from("lunches")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");
  const list = (lunches ?? []) as Lunch[];
  const { data: myAvail } = await supabase
    .from("availability")
    .select("starts_at")
    .eq("user_id", user.id)
    .gte("starts_at", new Date().toISOString());
  const mySlots = (myAvail ?? []).map((a) => new Date(a.starts_at).toISOString());
  const options = allSlots();

  const otherIds = [...new Set(list.map((l) => (l.from_user === user.id ? l.to_user : l.from_user)))];
  const restoIds = [...new Set(list.map((l) => l.restaurant_id).filter(Boolean))] as number[];
  const [{ data: people }, { data: restos }] = await Promise.all([
    otherIds.length ? supabase.from("public_profiles").select("*").in("id", otherIds) : Promise.resolve({ data: [] }),
    restoIds.length ? supabase.from("restaurants").select("*").in("id", restoIds) : Promise.resolve({ data: [] }),
  ]);
  const person = new Map(((people ?? []) as PublicProfile[]).map((p) => [p.id, p]));
  const resto = new Map(((restos ?? []) as Restaurant[]).map((r) => [r.id, r]));

  const incoming = list.filter((l) => l.to_user === user.id && l.status === "voorgesteld");
  const upcoming = list.filter((l) => l.status === "geaccepteerd" || l.status === "gereserveerd");
  const sent = list.filter((l) => l.from_user === user.id && l.status === "voorgesteld");

  function Card({ l, kind }: { l: Lunch; kind: "incoming" | "upcoming" | "sent" }) {
    const other = person.get(l.from_user === user!.id ? l.to_user : l.from_user);
    const r = l.restaurant_id ? resto.get(l.restaurant_id) : null;
    return (
      <div className="lunch-card">
        <Avatar name={other?.name ?? "?"} src={other?.linkedin_picture} />
        <div className="meta">
          <b>{other?.name ?? "Onbekend"}</b>
          <small>{other?.role}{other?.company ? ` · ${other.company}` : ""}</small>
          <div style={{ fontSize: 14, marginTop: 6 }}>
            {formatSlot(l.starts_at)}
            {r ? ` · ${r.name}, ${r.area}` : ""}
          </div>
          {kind === "incoming" && !mySlots.includes(new Date(l.starts_at).toISOString()) && (
            <span className="warn">Staat niet in je agenda — ga akkoord of stel een ander moment voor</span>
          )}
          {kind === "incoming" && l.prompt_index != null && (
            <small>Reageerde op jouw antwoord bij “{PROMPTS[l.prompt_index]}”</small>
          )}
        </div>
        <span className={`status ${l.status === "gereserveerd" ? "ok" : ""}`}>{STATUS_LABEL[l.status]}</span>
        <LunchButtons id={l.id} kind={kind} options={options} mySlots={mySlots} />
      </div>
    );
  }

  return (
    <div className="view-wrap" style={{ maxWidth: 760, margin: "0 auto 80px" }}>
      <h2 className="serif" style={{ fontSize: 36 }}>Mijn lunches</h2>

      <div className="section-title">Voorstellen voor jou</div>
      {incoming.length ? incoming.map((l) => <Card key={l.id} l={l} kind="incoming" />) : <p className="empty">Geen openstaande voorstellen.</p>}

      <div className="section-title">Gepland</div>
      {upcoming.length ? upcoming.map((l) => <Card key={l.id} l={l} kind="upcoming" />) : <p className="empty">Nog geen geplande lunches.</p>}

      <div className="section-title">Verstuurd</div>
      {sent.length ? sent.map((l) => <Card key={l.id} l={l} kind="sent" />) : <p className="empty">Geen openstaande voorstellen verstuurd.</p>}
    </div>
  );
}
