import {
  ArrowRight,
  CalendarDays,
  Check,
  FolderHeart,
  HeartHandshake,
  ListChecks,
  PenLine,
  Sparkles,
  Wand2,
} from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { HeroPreview } from "@/components/landing/hero-preview";
import { ExampleTabs } from "@/components/landing/example-tabs";
import { PricingCards } from "@/components/pricing-cards";

const STEPS = [
  {
    icon: HeartHandshake,
    title: "Tell us about your charity",
    body: "Your mission, who you help, your tone of voice, campaigns and upcoming events. It takes about five minutes, once.",
  },
  {
    icon: Sparkles,
    title: "Generate your month",
    body: "CharityContent plans a realistic posting rhythm and writes every post for your platforms, campaigns and key dates.",
  },
  {
    icon: PenLine,
    title: "Review, tweak and post",
    body: "Edit anything, rewrite in one click, then copy each post straight into Instagram, Facebook, LinkedIn or X.",
  },
];

const FEATURES = [
  {
    icon: Wand2,
    title: "Written for your charity, not anyone's",
    body: "Every post draws on your mission, the people you support and your live campaigns, in your tone of voice and in British English.",
  },
  {
    icon: CalendarDays,
    title: "A month planned in one click",
    body: "A sustainable posting rhythm across your platforms, with reminders before your events and timely UK awareness days.",
  },
  {
    icon: ListChecks,
    title: "Everything you need to post",
    body: "Each piece comes with a hook, caption, call to action, hashtags and an image idea you can shoot on a phone.",
  },
  {
    icon: Sparkles,
    title: "One-click rewrites",
    body: "Make it shorter, more engaging, more professional or more emotional. Or ask for three fresh alternatives.",
  },
  {
    icon: FolderHeart,
    title: "A library that remembers",
    body: "Save, favourite, filter and reuse your best content. Your appeal that worked last winter is one click away.",
  },
  {
    icon: HeartHandshake,
    title: "Built with dignity in mind",
    body: "No invented statistics, no pity-led copy. Prompts follow good practice for ethical charity storytelling.",
  },
];

const FAQS = [
  {
    q: "Do I need any marketing experience?",
    a: "Not at all. CharityContent is designed for trustees, coordinators and volunteers who look after social media alongside everything else. If you can describe your charity, you can use it.",
  },
  {
    q: "Will the content sound like a robot wrote it?",
    a: "We write from your own profile: what you do, who you help, your campaigns and your tone of voice. You can edit everything, and one-click rewrites let you adjust the feel without starting again.",
  },
  {
    q: "Does it post to social media for me?",
    a: "Not yet. For now you copy each post into your platform of choice. Direct scheduling to Instagram, Facebook, LinkedIn and X is coming soon.",
  },
  {
    q: "What counts as an AI generation?",
    a: "Generating a single post (or three alternatives), or generating a whole month's plan, each uses one generation. Rewrites such as 'make it shorter' are free.",
  },
  {
    q: "Is our information kept private?",
    a: "Your organisation profile and content are only visible to your account. We never sell your data, and if you ever want your account deleted, just email us and we will remove everything.",
  },
  {
    q: "Can we cancel at any time?",
    a: "Yes. Paid plans are monthly with no contract. You can drop back to the free plan whenever you like and keep your content library.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top_left,var(--color-brand-100),transparent_60%)] opacity-70" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 pt-14 pb-24 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-24 lg:pb-32">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-[13px] font-medium text-brand-800">
              <span className="size-1.5 rounded-full bg-coral-500" />
              Built for small UK charities
            </p>
            <h1 className="mt-6 font-display text-[42px] leading-[1.05] font-medium tracking-tight text-ink sm:text-[56px] lg:text-[64px]">
              A month of charity content <span className="text-brand-700 italic">in minutes.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              CharityContent helps small charities create social posts, campaign ideas and email content using AI, written
              in your voice and planned into a simple monthly calendar.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup" size="lg">
                Create your first month free <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/#how-it-works" size="lg" variant="outline">
                See how it works
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {["No card needed", "5 free generations a month", "Cancel anytime"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-brand-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-y border-sand bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
          <p className="text-sm font-medium text-muted">Made for organisations without a marketing team:</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {["Registered charities", "CIOs & CICs", "Community groups", "Food banks", "Youth clubs", "Faith groups"].map((t) => (
              <li key={t} className="rounded-full bg-cream px-3 py-1.5 text-[13px] font-medium text-ink/80 ring-1 ring-sand">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading eyebrow="How it works" title="From a blank page to a full month, in three steps" />
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl border border-sand bg-white p-7 shadow-card">
                <span className="absolute top-7 right-7 font-display text-5xl leading-none text-sand-dark">{i + 1}</span>
                <div className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <s.icon className="size-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 bg-brand-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading
            dark
            eyebrow="Features"
            title="Everything a small charity needs to show up consistently"
            body="CharityContent takes care of the weekly 'what should we post?' so you can get back to the work that matters."
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-brand-950 p-7 transition-colors hover:bg-brand-900">
                <f.icon className="size-5 text-coral-400" />
                <h3 className="mt-5 text-[17px] font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-white/65">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading
            eyebrow="Example content"
            title="Posts that sound like you on a good day"
            body="Here's what CharityContent wrote for HopeBridge Community Trust, a family and youth charity."
          />
          <div className="mt-14">
            <ExampleTabs />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-sand bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading eyebrow="Pricing" title="Simple pricing that respects charity budgets" body="Start free. Upgrade when you're posting every week." />
          <div className="mt-14">
            <PricingCards />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
          <SectionHeading eyebrow="FAQ" title="Questions charities ask us" />
          <div className="mt-12 divide-y divide-sand rounded-3xl border border-sand bg-white">
            {FAQS.map((f) => (
              <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cream text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand-800 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight font-medium tracking-tight sm:text-[44px]">
            Spend less time on posts, and more time on your cause.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-white/75">Set up your charity in five minutes and get your first month of content free.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/signup" size="lg" variant="accent">
              Create your first month free <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/login?demo=1" size="lg" className="bg-white/10 text-white shadow-none ring-1 ring-white/25 hover:bg-white/15">
              Explore the demo
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, body, dark }: { eyebrow: string; title: string; body?: string; dark?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={dark ? "text-sm font-semibold text-coral-400" : "text-sm font-semibold text-brand-600"}>{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl leading-tight font-medium tracking-tight sm:text-[40px]">{title}</h2>
      {body && <p className={dark ? "mt-4 text-lg text-white/65" : "mt-4 text-lg text-muted"}>{body}</p>}
    </div>
  );
}
