// Centrale instellingen. Nieuwe stad live zetten = toevoegen aan ACTIVE_CITIES.
export const ACTIVE_CITIES = ["Amsterdam"] as const;
export const ALL_CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Utrecht",
  "Den Haag",
  "Eindhoven",
  "'s-Hertogenbosch",
] as const;

export const SECTORS = [
  "Financiële dienstverlening",
  "Tech & SaaS",
  "Media & marketing",
  "Retail & e-commerce",
  "Vastgoed & bouw",
  "Energie & duurzaamheid",
  "Industrie & logistiek",
  "Zakelijke dienstverlening",
  "Overheid & non-profit",
];

// Voorgestelde doelbranches op basis van de eigen branche.
export const SECTOR_SUGGESTIONS: Record<string, string[]> = {
  "Media & marketing": ["Financiële dienstverlening", "Tech & SaaS", "Retail & e-commerce", "Zakelijke dienstverlening"],
  "Financiële dienstverlening": ["Tech & SaaS", "Vastgoed & bouw", "Zakelijke dienstverlening"],
  "Tech & SaaS": ["Financiële dienstverlening", "Zakelijke dienstverlening", "Industrie & logistiek"],
  "Retail & e-commerce": ["Media & marketing", "Tech & SaaS", "Industrie & logistiek"],
  "Vastgoed & bouw": ["Financiële dienstverlening", "Energie & duurzaamheid", "Overheid & non-profit"],
  "Energie & duurzaamheid": ["Overheid & non-profit", "Industrie & logistiek", "Vastgoed & bouw"],
  "Industrie & logistiek": ["Tech & SaaS", "Energie & duurzaamheid", "Retail & e-commerce"],
  "Zakelijke dienstverlening": ["Financiële dienstverlening", "Tech & SaaS", "Overheid & non-profit"],
  "Overheid & non-profit": ["Energie & duurzaamheid", "Zakelijke dienstverlening", "Tech & SaaS"],
};

export const TOPICS = [
  "Fundraising", "Bootstrappen", "B2B-sales", "Marketing & brand", "Podcasts & media",
  "AI in de praktijk", "Hiring & cultuur", "Internationaal opschalen", "Exit & overname",
  "Partnerships", "E-commerce", "Duurzaamheid", "Leiderschap", "Fintech", "Vastgoed",
  "Overheid & aanbesteding",
];
export const MAX_TOPICS = 5;

export const GOALS = [
  "Sparren met een peer", "Een mentor vinden", "Klanten of partners",
  "Investeerders ontmoeten", "Talent / co-founder", "Gewoon nieuwsgierig",
];

export const DIETS = [
  "Geen wensen", "Vegetarisch", "Veganistisch", "Pescotarisch", "Halal",
  "Koosjer", "Glutenvrij", "Lactosevrij", "Geen alcohol",
];

export const LUNCH_TIMES = ["12:00", "12:30", "13:00"];
export const WEEKS_AHEAD = 3;
export const LUNCH_MINUTES = 60;

export const PROMPTS = ["Je kunt me om advies vragen over…", "Ik zoek iemand die…"];
