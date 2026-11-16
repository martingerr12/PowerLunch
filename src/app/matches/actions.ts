"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  // Controleer dat het tijdslot echt bij beide in de agenda staat.
  const iso = new Date(startsAt).toISOString();
  const { data: both } = await supabase
    .from("availability")
    .select("user_id")
    .eq("starts_at", iso)
    .in("user_id", [user.id, otherId]);
  if ((both ?? []).length < 2) return { error: "Dit moment is niet meer beschikbaar." };

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
