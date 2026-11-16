"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_CITIES, DIETS, GOALS, MAX_TOPICS, SECTORS, TOPICS } from "@/lib/config";
import { allSlots } from "@/lib/time";

export type OnboardingInput = {
  name: string;
  role: string;
  company: string;
  sector: string;
  city: string;
  targetSectors: string[];
  topics: string[];
  goals: string[];
  slots: string[];
  diet: string[];
  dietNote: string;
  dietNoteConsent: boolean;
  prompt1: string;
  prompt2: string;
};

const clean = (s: string, max = 200) => s.trim().slice(0, max);

export async function saveOnboarding(input: OnboardingInput): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Validatie: nooit vertrouwen op wat de browser stuurt.
  if (!clean(input.name) || !clean(input.role)) return { error: "Vul je naam en functie in." };
  if (!SECTORS.includes(input.sector)) return { error: "Kies je branche." };
  if (!(ACTIVE_CITIES as readonly string[]).includes(input.city)) return { error: "Kies een stad." };
  const topics = input.topics.filter((t) => TOPICS.includes(t)).slice(0, MAX_TOPICS);
  if (!topics.length) return { error: "Kies minstens één onderwerp." };
  const goals = input.goals.filter((g) => GOALS.includes(g));
  if (!goals.length) return { error: "Kies wat je zoekt in een gesprek." };
  const valid = new Set(allSlots());
  const slots = input.slots.map((s) => new Date(s).toISOString()).filter((s) => valid.has(s));
  if (!slots.length) return { error: "Kies minstens één lunchmoment." };
  const targetSectors = input.targetSectors.map((s) => clean(s, 60)).filter(Boolean).slice(0, 15);
  if (!targetSectors.length) return { error: "Kies minstens één branche om mee in gesprek te gaan." };
  const diet = input.diet.filter((d) => DIETS.includes(d));
  const note = clean(input.dietNote, 300);

  const { error } = await supabase
    .from("profiles")
    .update({
      name: clean(input.name, 80),
      role: clean(input.role, 80),
      company: clean(input.company, 120),
      sector: input.sector,
      city: input.city,
      target_sectors: targetSectors,
      topics,
      goals,
      diet: diet.length ? diet : ["Geen wensen"],
      // Allergie-notitie alleen bewaren met expliciete toestemming.
      diet_note: input.dietNoteConsent && note ? note : null,
      diet_note_consent: input.dietNoteConsent && !!note,
      prompt_1: clean(input.prompt1, 160) || null,
      prompt_2: clean(input.prompt2, 160) || null,
      onboarded: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: "Opslaan mislukt. Probeer het opnieuw." };

  // Toekomstige beschikbaarheid vervangen.
  await supabase.from("availability").delete().eq("user_id", user.id).gte("starts_at", new Date().toISOString());
  const { error: avErr } = await supabase
    .from("availability")
    .insert(slots.map((starts_at) => ({ user_id: user.id, starts_at })));
  if (avErr) return { error: "Beschikbaarheid opslaan mislukt." };

  redirect("/matches");
}
