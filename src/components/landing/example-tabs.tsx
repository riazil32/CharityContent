"use client";

import clsx from "clsx";
import { useState } from "react";
import type { ContentDraft, ContentType, Platform } from "@/lib/types";
import { PostPreview } from "../post-preview";

interface Example {
  label: string;
  platform: Platform;
  contentType: ContentType;
  draft: ContentDraft;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    label: "Fundraising appeal",
    platform: "facebook",
    contentType: "fundraising_appeal",
    note: "Written from your campaign goal, with a clear ask and no guilt-tripping.",
    draft: {
      headline: "£25 keeps a family warm for a week",
      caption:
        "This winter, one in four of the families we support told us they'd have to choose between heating and eating.\n\nOur Warm Winter Appeal provides emergency energy top-ups, warm packs and hot meals at our hub.\n\nWe're 62% of the way to our £15,000 target. With your help, no family in our community spends this winter in the cold.",
      cta: "Donate to the Warm Winter Appeal at hopebridgetrust.org.uk/winter",
      hashtags: ["#WarmWinterAppeal", "#CostOfLiving", "#ChildPoverty"],
      imageIdea: "A volunteer's hands packing a warm pack: a folded blanket, a knitted hat and a flask, shot from above.",
    },
  },
  {
    label: "Volunteer recruitment",
    platform: "instagram",
    contentType: "volunteer_recruitment",
    note: "Flexible, friendly and specific about what volunteers actually do.",
    draft: {
      headline: "🙌 Got one hour a week?",
      caption:
        "That's all it takes to become a HopeBridge mentor.\n\nYou'll meet a young person aged 11 to 18 for a chat, a walk or help with homework. No experience needed: we provide full training, a DBS check and ongoing support.\n\nWe're looking for 25 new mentors this term. Could one of them be you?",
      cta: "Tap the link in our bio to apply.",
      hashtags: ["#MentorAYoungPerson", "#VolunteerUK", "#YouthMentoring", "#Leeds", "#GiveYourTime"],
      imageIdea: "A mentor and young person walking side by side in a park, taken from behind with consent.",
    },
  },
  {
    label: "Success story",
    platform: "instagram",
    contentType: "success_story",
    note: "Real impact, told with dignity and a reminder about consent.",
    draft: {
      headline: "“She was the first person who asked what I wanted to do.”",
      caption:
        "When Jay* was matched with their mentor, Priya, they hadn't been to school for six weeks.\n\nThey met every Tuesday at the library. Eight months on, Jay is back in the classroom and has just started a Level 2 course in motor mechanics.\n\nOne hour a week. That's all it took for someone to feel seen.\n\n*Name changed. Shared with permission.",
      cta: "Could you be someone's Priya? Link in bio.",
      hashtags: ["#YouthMentoring", "#ImpactStory", "#HopeBridge"],
      imageIdea: "Two mugs on a library table next to an open notebook. No faces needed.",
    },
  },
  {
    label: "LinkedIn update",
    platform: "linkedin",
    contentType: "awareness_post",
    note: "Professional tone for funders, partners and corporate volunteers.",
    draft: {
      headline: "Child poverty isn't inevitable. Local action works.",
      caption:
        "Today is the International Day for the Eradication of Poverty.\n\nAt HopeBridge Community Trust we see every week how rising costs affect families on low incomes: missed meals, cold homes and young people who stop believing things can change.\n\nWe also see what works. Practical help, delivered locally and without judgement, gives families room to breathe.\n\nWe're grateful to every partner and funder who makes that possible.",
      cta: "Explore partnership opportunities at hopebridgetrust.org.uk",
      hashtags: ["#EndPoverty", "#ChildPoverty", "#CommunityImpact"],
      imageIdea: "A clean data card in brand colours: '1,240 families supported this year'.",
    },
  },
];

export function ExampleTabs() {
  const [active, setActive] = useState(0);
  const ex = EXAMPLES[active];
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      <div className="space-y-2">
        {EXAMPLES.map((e, i) => (
          <button
            key={e.label}
            onClick={() => setActive(i)}
            className={clsx(
              "w-full rounded-2xl border px-5 py-4 text-left transition-all",
              i === active ? "border-brand-600 bg-white shadow-card" : "border-transparent hover:bg-white/60",
            )}
          >
            <p className={clsx("font-semibold", i === active ? "text-brand-800" : "text-ink")}>{e.label}</p>
            <p className="mt-0.5 text-sm text-muted">{e.note}</p>
          </button>
        ))}
        <p className="px-5 pt-3 text-xs text-muted">Examples written for HopeBridge Community Trust, a fictional charity.</p>
      </div>
      <PostPreview
        key={active}
        className="animate-fade-up shadow-lift"
        draft={ex.draft}
        platform={ex.platform}
        contentType={ex.contentType}
        orgName="HopeBridge Community Trust"
      />
    </div>
  );
}
