export type PublicProfile = {
  id: string;
  name: string;
  role: string;
  company: string;
  linkedin_picture: string | null;
  sector: string | null;
  city: string | null;
  target_sectors: string[];
  topics: string[];
  goals: string[];
  prompt_1: string | null;
  prompt_2: string | null;
};

export type OwnProfile = PublicProfile & {
  diet: string[];
  diet_note: string | null;
  diet_note_consent: boolean;
  onboarded: boolean;
};

export type Restaurant = {
  id: number;
  city: string;
  name: string;
  area: string;
  icon: string;
  topics: string[];
  diet_tags: string[];
};

export type LunchStatus = "voorgesteld" | "geaccepteerd" | "gereserveerd" | "afgewezen" | "geannuleerd";

export type Candidate = PublicProfile & {
  shared: string[];
  slots: string[];
  inTarget: boolean;
  score: number;
};
