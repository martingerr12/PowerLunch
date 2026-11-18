"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickRestaurant } from "@/lib/matching";
import type { Restaurant } from "@/lib/types";
import { allSlots } from "@/lib/time";

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Ontvanger gaat akkoord: we kiezen het restaurant op basis van beide profielen. */
export async function acceptLunch(lunchId: number) {
  const { user } = await currentUser();
  if (!user) return { error: "Log opnieuw in." };
  const admin = createAdminClient();

  const { data: lunch } = await admin.from("lunches").select("*").eq("id", lunchId).single();
  if (!lunch || lunch.to_user !== user.id || lunch.status !== "voorgesteld") return { error: "Dit voorstel is niet meer open." };

  const { data: people } = await admin
    .from("profiles")
    .select("id, city, topics, diet")
    .in("id", [lunch.from_user, lunch.to_user]);
  if (!people || people.length !== 2) return { error: "Profiel niet gevonden." };
  const [a, b] = people;
  const sharedTopics = a.topics.filter((t: string) => b.topics.includes(t));
  const diets = [...new Set([...a.diet, ...b.diet])];

  const { data: restaurants } = await admin.from("restaurants").select("*").eq("city", a.city).eq("active", true);
  const restaurant = pickRestaurant((restaurants ?? []) as Restaurant[], sharedTopics.length ? sharedTopics : [...a.topics, ...b.topics], diets);

  const { error } = await admin
    .from("lunches")
    .update({ status: "geaccepteerd", restaurant_id: restaurant?.id ?? null, updated_at: new Date().toISOString() })
    .eq("id", lunchId);
  if (error) return { error: "Accepteren mislukt." };

  // TODO fase 2: reservering automatisch maken via Zenchef/Formitable (zie README).
  // Tot die tijd ziet de beheerder deze lunch als 'geaccepteerd' en reserveert handmatig.
  revalidatePath("/lunches");
  return { ok: true };
}

export async function declineLunch(lunchId: number) {
  const { supabase, user } = await currentUser();
  if (!user) return;
  await supabase.from("lunches").update({ status: "afgewezen", updated_at: new Date().toISOString() }).eq("id", lunchId).eq("to_user", user.id);
  revalidatePath("/lunches");
}

export async function cancelLunch(lunchId: number) {
  const { supabase, user } = await currentUser();
  if (!user) return;
  await supabase.from("lunches").update({ status: "geannuleerd", updated_at: new Date().toISOString() }).eq("id", lunchId);
  revalidatePath("/lunches");
}

/**
 * Ontvanger stelt een ander moment voor. De rollen draaien om:
 * nu moet de oorspronkelijke afzender akkoord gaan.
 */
export async function counterLunch(lunchId: number, startsAt: string) {
  const { user } = await currentUser();
  if (!user) return { error: "Log opnieuw in." };
  const iso = new Date(startsAt).toISOString();
  if (!allSlots().includes(iso)) return { error: "Kies een lunchmoment in de komende drie weken." };

  const admin = createAdminClient();
  const { data: lunch } = await admin.from("lunches").select("*").eq("id", lunchId).single();
  if (!lunch || lunch.to_user !== user.id || lunch.status !== "voorgesteld") return { error: "Dit voorstel is niet meer open." };
  if (new Date(lunch.starts_at).toISOString() === iso) return { error: "Kies een ander moment dan het huidige voorstel." };

  const { error } = await admin
    .from("lunches")
    .update({
      from_user: user.id,
      to_user: lunch.from_user,
      starts_at: iso,
      prompt_index: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lunchId);
  if (error) return { error: "Nieuw moment voorstellen mislukt." };
  revalidatePath("/lunches");
  return { ok: true };
}
