import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { PricingCards } from "@/components/pricing-cards";

export const metadata: Metadata = { title: "Pricing" };

const ROWS: [string, string | boolean, string | boolean, string | boolean][] = [
  ["AI generations per month", "5", "50", "Unlimited"],
  ["Content library", "Up to 50 posts", "Unlimited", "Unlimited"],
  ["Monthly content calendar", "Basic", true, true],
  ["Platforms", "Up to 2", "All 4", "All 4"],
  ["One-click rewrites", true, true, true],
  ["Campaign planning", false, false, true],
  ["Advanced content generation", false, false, true],
  ["Team members", "1", "1", "Up to 5"],
  ["Support", "Email", "Email", "Priority"],
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-brand-600">Pricing</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">Fair pricing for the charity sector</h1>
        <p className="mt-4 text-lg text-muted">Start free with your first month of content. Upgrade or cancel at any time.</p>
      </div>

      <div className="mt-14">
        <PricingCards />
      </div>

      <div className="mt-20">
        <h2 className="text-center font-display text-2xl font-medium">Compare plans</h2>
        <div className="mt-8 overflow-x-auto rounded-3xl border border-sand bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand">
                <th className="px-6 py-4 font-medium text-muted">Feature</th>
                {["Free", "Starter", "Growth"].map((h) => (
                  <th key={h} className="px-6 py-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, ...vals]) => (
                <tr key={label} className="border-b border-sand last:border-0">
                  <td className="px-6 py-3.5 font-medium">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="px-6 py-3.5 text-muted">
                      {v === true ? <Check className="size-4.5 text-brand-600" /> : v === false ? <X className="size-4.5 text-sand-dark" /> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Prices exclude VAT. Registered charities may be eligible for VAT relief. Need something bigger?{" "}
          <a className="font-medium text-brand-700 underline underline-offset-4" href="mailto:hello@charitycontent.co.uk">
            Talk to us
          </a>
          .
        </p>
      </div>
    </div>
  );
}
