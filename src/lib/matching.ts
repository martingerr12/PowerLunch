import type { Candidate, PublicProfile, Restaurant } from "./types";

/**
 * Score 12–98 op basis van gedeelde onderwerpen, overlappende lunchmomenten,
 * doelbranche en gedeelde doelen. Zelfde logica als het prototype.
 */
export function scoreCandidate(
  me: { topics: string[]; goals: string[]; target_sectors: string[] },
  mySlots: Set<string>,
  p: PublicProfile,
  theirSlots: string[],
): Candidate {
  const shared = p.topics.filter((t) => me.topics.includes(t));
  const slots = theirSlots.filter((s) => mySlots.has(s)).sort();
  const goals = p.goals.filter((g) => me.goals.includes(g));
  const inTarget = !!p.sector && me.target_sectors.includes(p.sector);
  let s = 34 + shared.length * 14 + (inTarget ? 12 : 0) + Math.min(slots.length, 2) * 8 + goals.length * 5;
  if (!slots.length) s -= 25;
  return { ...p, shared, slots, inTarget, score: Math.max(12, Math.min(98, s)) };
}

const STRICT_DIETS = ["Veganistisch", "Vegetarisch", "Halal", "Pescotarisch", "Koosjer", "Glutenvrij"];

/**
 * Kies het best passende restaurant voor twee mensen.
 * Harde dieetwensen wegen zwaar, daarna overlap met de gespreksonderwerpen.
 */
export function pickRestaurant(
  restaurants: Restaurant[],
  topics: string[],
  diets: string[],
): Restaurant | null {
  if (!restaurants.length) return null;
  const strict = STRICT_DIETS.filter((d) => diets.includes(d));
  const ranked = restaurants
    .map((r) => ({
      r,
      s: r.topics.filter((t) => topics.includes(t)).length + strict.filter((d) => r.diet_tags.includes(d)).length * 3,
    }))
    .sort((a, b) => b.s - a.s);
  return ranked[0].r;
}
