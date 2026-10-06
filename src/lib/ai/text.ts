/** Small, dependency-free text helpers shared by the generators. */

export type Rng = () => number;

/** Deterministic PRNG (mulberry32) so demo content is stable for a given seed. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function stripTrailingPunctuation(text: string): string {
  return text.trim().replace(/[.!?;:,\s]+$/, "");
}

export function lowerFirst(text: string): string {
  if (!text) return text;
  // Keep acronyms (e.g. "UK", "NHS") intact.
  if (/^[A-Z]{2,}/.test(text)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function upperFirst(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function ensureSentence(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? upperFirst(t) : `${upperFirst(t)}.`;
}

export function toHashtag(phrase: string): string {
  const words = phrase
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "";
  return "#" + words.map((w) => (/^[A-Z0-9]+$/.test(w) ? w : upperFirst(w.toLowerCase()))).join("");
}

export function displayWebsite(url: string): string {
  return url.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;

export function stripEmoji(text: string): string {
  return text.replace(EMOJI_RE, "").replace(/[ \t]{2,}/g, " ").replace(/^ +| +$/gm, "");
}

export function sentences(text: string): string[] {
  return text.match(/[^.!?\n]+[.!?]+["')]*|[^.!?\n]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
}

export function formatLongDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
