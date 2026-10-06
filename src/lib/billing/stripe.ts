import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PLANS } from "../plans";
import type { PlanId } from "../types";

/**
 * Minimal Stripe client using the REST API (no SDK dependency).
 * Active only when STRIPE_SECRET_KEY is set.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function priceIdFor(plan: PlanId): string | undefined {
  const env = PLANS.find((p) => p.id === plan)?.stripePriceEnv;
  return env ? process.env[env] : undefined;
}

export function planForPrice(priceId: string): PlanId | null {
  for (const p of PLANS) if (p.stripePriceEnv && process.env[p.stripePriceEnv] === priceId) return p.id;
  return null;
}

export async function stripeRequest<T>(path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `Stripe error ${res.status}`);
  return json as T;
}

/** Verifies the Stripe-Signature header (v1 scheme, 5 minute tolerance). */
export function verifyStripeSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const timestamp = parts.t;
  const signatures = header
    .split(",")
    .filter((kv) => kv.startsWith("v1="))
    .map((kv) => kv.slice(3));
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return signatures.some((sig) => {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
