import { LUNCH_TIMES, WEEKS_AHEAD } from "./config";

const TZ = "Europe/Amsterdam";
const DAY_ABBR = ["Ma", "Di", "Wo", "Do", "Vr"];
const DAY_FULL = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** Offset (ms) van Amsterdam t.o.v. UTC op een bepaald moment. */
function tzOffset(ts: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(ts));
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - ts;
}

/** Amsterdamse lokale tijd → ISO-string in UTC. */
export function amsterdamToIso(y: number, m: number, d: number, hhmm: string): string {
  const [h, min] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  return new Date(guess - tzOffset(guess)).toISOString();
}

export type Day = { iso: string; week: number; abbr: string; label: string; y: number; m: number; d: number };

/** Werkdagen van de komende WEEKS_AHEAD weken, beginnend bij de eerstvolgende maandag. */
export function upcomingDays(now = new Date()): Day[] {
  const local = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const dow = local.getDay(); // 0 = zondag
  const add = ((8 - dow) % 7) || 7;
  const monday = new Date(local.getFullYear(), local.getMonth(), local.getDate() + add);
  const days: Day[] = [];
  for (let w = 0; w < WEEKS_AHEAD; w++) {
    for (let i = 0; i < 5; i++) {
      const x = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + w * 7 + i);
      days.push({
        iso: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`,
        week: w, abbr: DAY_ABBR[i], label: `${x.getDate()} ${MONTHS[x.getMonth()]}`,
        y: x.getFullYear(), m: x.getMonth() + 1, d: x.getDate(),
      });
    }
  }
  return days;
}

export function slotIso(day: Day, time: string) {
  return amsterdamToIso(day.y, day.m, day.d, time);
}

export function allSlots(now = new Date()): string[] {
  return upcomingDays(now).flatMap((d) => LUNCH_TIMES.map((t) => slotIso(d, t)));
}

/** "donderdag 19 nov · 12:30" */
export function formatSlot(iso: string, short = false): string {
  const dt = new Date(iso);
  const parts = new Intl.DateTimeFormat("nl-NL", {
    timeZone: TZ, weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).formatToParts(dt);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const wd = get("weekday");
  const idx = DAY_FULL.indexOf(wd);
  const day = short && idx >= 0 && idx < 5 ? DAY_ABBR[idx].toLowerCase() : wd;
  return `${day} ${get("day")} ${get("month").replace(".", "")} · ${get("hour")}:${get("minute")}`;
}
