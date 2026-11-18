"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { allSlots } from "@/lib/time";

export async function skipProfile(otherId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("skips").upsert({ user_id: user.id, skipped_user: otherId });
  revalidatePath("/matches");
}

export async function proposeLunch(otherId: string, startsAt: string, promptIndex: number | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Log opnieuw in." };

  // Elk lunchmoment in de komende weken mag; staat het niet in de agenda van de ander,
  // dan kan die akkoord gaan of een ander moment voorstellen.
  const iso = new Date(startsAt).toISOString();
  if (!allSlots().includes(iso)) return { error: "Kies een lunchmoment in de komende drie weken." };

  // Geen dubbele openstaande voorstellen tussen dezelfde twee mensen.
  const { data: open } = await supabase
    .from("lunches")
    .select("id")
    .or(`and(from_user.eq.${user.id},to_user.eq.${otherId}),and(from_user.eq.${otherId},to_user.eq.${user.id})`)
    .in("status", ["voorgesteld", "geaccepteerd", "gereserveerd"]);
  if (open?.length) return { error: "Er loopt al een lunch tussen jullie." };

  const { error } = await supabase.from("lunches").insert({
    from_user: user.id,
    to_user: otherId,
    starts_at: iso,
    prompt_index: promptIndex,
  });
  if (error) return { error: "Voorstel versturen mislukt." };
  revalidatePath("/matches");
  revalidatePath("/lunches");
  return { ok: true };
}
