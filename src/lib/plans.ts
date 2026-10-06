import type { PlanId } from "./types";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // GBP per month
  tagline: string;
  generationsPerMonth: number | null; // null = unlimited
  features: string[];
  highlighted?: boolean;
  /** Env var holding the Stripe Price ID for this plan (paid plans only). */
  stripePriceEnv?: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Try it with your first month of content.",
    generationsPerMonth: 5,
    features: ["5 AI generations / month", "Basic content calendar", "Content library"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 19,
    tagline: "For charities posting every week.",
    generationsPerMonth: 50,
    features: [
      "50 AI generations / month",
      "Unlimited content library",
      "Monthly content calendar",
      "Multiple platforms",
    ],
    highlighted: true,
    stripePriceEnv: "STRIPE_PRICE_STARTER",
  },
  {
    id: "growth",
    name: "Growth",
    price: 39,
    tagline: "For busy teams running several campaigns.",
    generationsPerMonth: null,
    features: [
      "Unlimited AI generations",
      "Advanced content generation",
      "Campaign planning",
      "Multiple organisation / team users",
      "Priority support",
    ],
    stripePriceEnv: "STRIPE_PRICE_GROWTH",
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Generations left this month, or null when unlimited. */
export function generationsRemaining(plan: PlanId, period: string, used: number): number | null {
  const limit = getPlan(plan).generationsPerMonth;
  if (limit === null) return null;
  const effectiveUsed = period === currentPeriod() ? used : 0;
  return Math.max(0, limit - effectiveUsed);
}
