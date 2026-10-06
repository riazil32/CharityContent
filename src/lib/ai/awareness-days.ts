/**
 * UK-relevant awareness days with fixed or computable dates. Used to suggest
 * timely awareness posts. `keywords` match against the charity's causes;
 * an empty list means the day suits any charity.
 */
export interface AwarenessDay {
  name: string;
  month: number; // 1-12
  day: number | ((year: number) => number);
  keywords: string[];
}

function givingTuesday(year: number): number {
  // Tuesday after the fourth Thursday of November.
  const first = new Date(year, 10, 1).getDay();
  const firstThursday = 1 + ((4 - first + 7) % 7);
  return firstThursday + 21 + 5;
}

export const AWARENESS_DAYS: AwarenessDay[] = [
  { name: "International Women's Day", month: 3, day: 8, keywords: ["women", "girls", "gender", "equality"] },
  { name: "World Health Day", month: 4, day: 7, keywords: ["health", "wellbeing", "nhs"] },
  { name: "Volunteers' Week", month: 6, day: 1, keywords: [] },
  { name: "International Youth Day", month: 8, day: 12, keywords: ["young", "youth", "children", "teen"] },
  { name: "International Day of Charity", month: 9, day: 5, keywords: [] },
  { name: "World Mental Health Day", month: 10, day: 10, keywords: ["mental", "wellbeing", "loneliness", "isolation"] },
  { name: "World Homeless Day", month: 10, day: 10, keywords: ["homeless", "housing", "poverty"] },
  { name: "World Food Day", month: 10, day: 16, keywords: ["food", "hunger", "poverty", "families"] },
  { name: "International Day for the Eradication of Poverty", month: 10, day: 17, keywords: ["poverty", "families", "cost of living", "disadvantaged"] },
  { name: "World Kindness Day", month: 11, day: 13, keywords: [] },
  { name: "Universal Children's Day", month: 11, day: 20, keywords: ["children", "young", "families", "youth"] },
  { name: "Giving Tuesday", month: 11, day: givingTuesday, keywords: [] },
  { name: "International Volunteer Day", month: 12, day: 5, keywords: [] },
  { name: "Human Rights Day", month: 12, day: 10, keywords: ["rights", "refugee", "justice", "equality"] },
];

export interface DatedAwarenessDay {
  name: string;
  date: string; // YYYY-MM-DD
  relevant: boolean;
}

export function awarenessDaysInMonth(year: number, month: number, causes: string[]): DatedAwarenessDay[] {
  const haystack = causes.join(" ").toLowerCase();
  const out: DatedAwarenessDay[] = [];
  for (const d of AWARENESS_DAYS) {
    // Normalise through Date so computed days can roll into the next month
    // (Giving Tuesday sometimes lands in early December).
    const real = new Date(year, d.month - 1, typeof d.day === "number" ? d.day : d.day(year));
    const m = real.getMonth() + 1;
    const day = real.getDate();
    if (m !== month) continue;
    out.push({
      name: d.name,
      date: `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      relevant: d.keywords.length === 0 || d.keywords.some((k) => haystack.includes(k)),
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
