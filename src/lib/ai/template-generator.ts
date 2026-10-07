/**
 * Offline content generator.
 *
 * Used when no LLM API key is configured, so the product works fully on demo
 * data. It writes charity-specific copy from the organisation profile using
 * hand-written templates, then adapts it for the platform, tone and the
 * charity's AI preferences. When OPENAI_API_KEY is set, src/lib/ai/openai.ts
 * is used instead and this file only acts as a fallback.
 */
import type { Campaign, ContentDraft, ContentType, KeyDate, OrgContext, Platform, Refinement, Tone } from "../types";
import {
  createRng,
  displayWebsite,
  ensureSentence,
  formatLongDate,
  hashString,
  lowerFirst,
  pick,
  sentences,
  stripEmoji,
  stripTrailingPunctuation,
  toHashtag,
  upperFirst,
  type Rng,
} from "./text";

export interface GenerateInput {
  org: OrgContext;
  platform: Platform;
  contentType: ContentType;
  tone: Tone;
  campaign?: Campaign | null;
  keyDate?: KeyDate | null;
  /** Optional free-text steer from the user, e.g. "mention our new Leeds hub". */
  brief?: string;
  seed?: number;
  /** When planning a month, cycles through templates so posts don't repeat. */
  variant?: number;
}

interface Vars {
  org: string;
  what: string;
  audience: string;
  cause: string;
  causes: string[];
  campaign: Campaign | null;
  event: KeyDate | null;
  eventDate: string;
  site: string;
  link: string;
  brief: string;
  variant: number | undefined;
}

interface Parts {
  headline: string;
  body: string[];
  cta: string;
  imageIdea: string;
  emoji: string;
}

const TYPE_TAGS: Record<ContentType, string[]> = {
  social_post: ["#CommunityMatters", "#UKCharity"],
  event_promotion: ["#CommunityEvent", "#SaveTheDate"],
  fundraising_appeal: ["#DonateToday", "#UKCharity", "#EveryPoundCounts"],
  awareness_post: ["#RaiseAwareness", "#UKCharity"],
  volunteer_recruitment: ["#VolunteerUK", "#Volunteering", "#GiveYourTime"],
  success_story: ["#ImpactStory", "#CommunityMatters"],
  newsletter: ["#CharityNews"],
};

function buildVars(input: GenerateInput, rng: Rng): Vars {
  const { org } = input;
  const causes = org.causes.length ? org.causes : ["our local community"];
  const site = org.website ? displayWebsite(org.website) : "";
  const link =
    input.platform === "instagram" ? "the link in our bio" : site ? site : "our website";
  const event = input.keyDate ?? null;
  return {
    org: org.name || "our charity",
    what: stripTrailingPunctuation(org.description || "supporting people in our community"),
    audience: lowerFirst(stripTrailingPunctuation(org.audience || "people in our community")),
    cause: lowerFirst(pick(rng, causes)),
    causes,
    campaign: input.campaign ?? null,
    event,
    eventDate: event ? formatLongDate(event.date) : "",
    site,
    link,
    brief: input.brief?.trim() ?? "",
    variant: input.variant,
  };
}

function choose(v: Vars, rng: Rng, variants: Parts[]): Parts {
  return v.variant === undefined ? pick(rng, variants) : variants[v.variant % variants.length];
}

// ---------------------------------------------------------------------------
// Templates per content type
// ---------------------------------------------------------------------------

function socialPost(v: Vars, rng: Rng): Parts {
  const variants: Parts[] = [
    {
      emoji: "🤝",
      headline: `A quick hello from ${v.org}`,
      body: [
        `If you're new here: we're ${v.org}. ${ensureSentence(v.what)}`,
        `Every week our team and volunteers work alongside ${v.audience}, and every week we're reminded how much a little practical support can change.`,
        `We'll be sharing more of that work here, the wins, the challenges and the people who make it happen.`,
      ],
      cta: `Follow along and say hello in the comments.`,
      imageIdea: `A warm, candid team photo outside your building or at a recent session, with people smiling naturally rather than posing.`,
    },
    {
      emoji: "🌱",
      headline: `What a week looks like at ${v.org}`,
      body: [
        `Behind every post you see from us there's a lot of quiet, steady work.`,
        `This week that meant phone calls, kettle-on conversations and practical help for ${v.audience}.`,
        `None of it would be possible without our volunteers, partners and supporters. Thank you.`,
      ],
      cta: `Want to get involved? Find out how at ${v.link}.`,
      imageIdea: `A simple behind-the-scenes shot: a volunteer packing supplies or a tidy welcome desk with your logo visible.`,
    },
    {
      emoji: "💬",
      headline: `Why we care about ${v.cause}`,
      body: [
        `People often ask us why we focus on ${v.cause}.`,
        `The honest answer is that we see its impact every day on ${v.audience}, and we know that local, practical support makes a real difference.`,
        `${ensureSentence(v.what)}`,
      ],
      cta: `Share this post to help more people find us.`,
      imageIdea: `A clean quote graphic in your brand colours with the line "Local support makes a real difference."`,
    },
  ];
  return choose(v, rng, variants);
}

function eventPromotion(v: Vars, rng: Rng): Parts {
  const name = v.event?.name ?? (v.campaign ? `our ${v.campaign.name} event` : "our next community event");
  const when = v.eventDate ? ` on ${v.eventDate}` : " soon";
  const detail = v.event?.description ? ensureSentence(v.event.description) : "";
  const variants: Parts[] = [
    {
      emoji: "📅",
      headline: `Save the date: ${upperFirst(name)}`,
      body: [
        `Join us for ${name}${when}.`,
        detail || `It's a chance to meet the team, find out more about our work and support ${v.audience}.`,
        `Everyone is welcome, and bringing a friend is very much encouraged.`,
      ],
      cta: `Register or find out more at ${v.link}.`,
      imageIdea: `A bold, simple event graphic with the date and name in large type over a photo from last year's event.`,
    },
    {
      emoji: "🎉",
      headline: `${upperFirst(name)} is coming up`,
      body: [
        `Mark your calendars: ${name} takes place${when}.`,
        detail || `Every person who comes along helps us support ${v.audience}.`,
        `We'd love to see you there.`,
      ],
      cta: `Tap ${v.link} to sign up. Spaces are limited.`,
      imageIdea: `Volunteers setting up for the event: bunting, a welcome table and a hand-written "Welcome" sign.`,
    },
  ];
  return choose(v, rng, variants);
}

function fundraisingAppeal(v: Vars, rng: Rng): Parts {
  const c = v.campaign;
  const campaignLine = c
    ? `Our ${c.name} ${c.goal ? `aims to ${lowerFirst(stripTrailingPunctuation(c.goal))}` : "is underway"}.`
    : `We're raising funds to keep our services running through the months ahead.`;
  const variants: Parts[] = [
    {
      emoji: "💛",
      headline: c ? `Help us reach our ${c.name} target` : `Your gift keeps our doors open`,
      body: [
        campaignLine,
        c?.description ? ensureSentence(c.description) : `${ensureSentence(v.what)}`,
        `£10 might not feel like much, but for the people we support it can mean a hot meal, a warm coat or a safe place to talk.`,
      ],
      cta: `Please donate today at ${v.link}. Every pound counts.`,
      imageIdea: `A close-up of hands passing a care package or a warm drink. Avoid showing faces of the people you support without consent.`,
    },
    {
      emoji: "🙏",
      headline: `We can't do this without you`,
      body: [
        `Demand for our support has grown this year, and ${v.audience} are feeling the pressure more than ever.`,
        campaignLine,
        `If you're able to give, even a small amount, it goes straight to where it's needed most.`,
      ],
      cta: `Give what you can at ${v.link}.`,
      imageIdea: `A progress thermometer graphic showing how close you are to your target, in your brand colours.`,
    },
    {
      emoji: "🧡",
      headline: `What your donation actually does`,
      body: [
        `People often ask where their money goes. Here's the honest answer.`,
        `Every gift to ${v.org} pays for practical, local support for ${v.audience}: the essentials, the time and the follow-up that make change stick.`,
        c ? `Right now, ${c.name} is our priority. ${c.description ? ensureSentence(c.description) : ""}`.trim() : campaignLine,
      ],
      cta: `Make a one-off or monthly gift at ${v.link}.`,
      imageIdea: `A simple "Your £10 / £25 / £50 could…" graphic with one concrete example per amount.`,
    },
  ];
  return choose(v, rng, variants);
}

function awarenessPost(v: Vars, rng: Rng): Parts {
  const dayName = v.event?.name;
  const variants: Parts[] = [
    {
      emoji: "💡",
      headline: dayName ? `Today is ${dayName}` : `Let's talk about ${v.cause}`,
      body: [
        dayName
          ? `Today is ${dayName}, a moment to shine a light on ${v.cause}.`
          : `When it comes to ${v.cause}, the reality in the UK is tougher than many of us realise.`,
        `At ${v.org}, we see what it means day to day for ${v.audience}: the tough choices, the stress and the resilience.`,
        `Understanding the issue is the first step to changing it.`,
      ],
      cta: `Share this post to help raise awareness.`,
      imageIdea: `A clear, accessible infographic with one key statistic about ${v.cause}, large and easy to read on a phone.`,
    },
    {
      emoji: "📣",
      headline: `3 things you might not know about ${v.cause}`,
      body: [
        `1. It can affect anyone, often through no fault of their own.`,
        `2. Early, local support makes a huge difference to how quickly people get back on their feet.`,
        `3. Charities like ${v.org} are often the first place people turn to.`,
        `${ensureSentence(v.what)}`,
      ],
      cta: `Learn more about our work at ${v.link}.`,
      imageIdea: `A carousel with one fact per slide, plain background, large type and your logo in the corner.`,
    },
    {
      emoji: "🔎",
      headline: `${upperFirst(v.cause)}: the bit people don't see`,
      body: [
        `It's not always visible. Often it looks like someone quietly going without so others don't have to.`,
        `That's why ${v.org} works the way we do: friendly, local and without judgement, alongside ${v.audience}.`,
        `If this is something you or someone you know is facing, you don't have to face it alone.`,
      ],
      cta: `Find support or learn more at ${v.link}.`,
      imageIdea: `A calm, empty kitchen table or front door in soft morning light: suggestive, not sensational.`,
    },
  ];
  return choose(v, rng, variants);
}

function volunteerRecruitment(v: Vars, rng: Rng): Parts {
  const c = v.campaign;
  const variants: Parts[] = [
    {
      emoji: "🙌",
      headline: `We're looking for volunteers`,
      body: [
        c
          ? `Our ${c.name} needs kind, reliable people to help.`
          : `Could you spare a couple of hours a week?`,
        `As a volunteer with ${v.org}, you'll make a direct difference to ${v.audience}, meet brilliant people and learn new skills along the way.`,
        `No experience needed. We provide full training and support.`,
      ],
      cta: `Apply or ask a question at ${v.link}.`,
      imageIdea: `A smiling volunteer in a branded T-shirt mid-task, with a simple overlay: "Volunteers wanted".`,
    },
    {
      emoji: "✨",
      headline: `Got a few hours to spare?`,
      body: [
        `Volunteering with ${v.org} is flexible, friendly and genuinely rewarding.`,
        `Whether you can help once a month or every week, there's a role for you, from welcoming visitors to helping behind the scenes.`,
        c?.description ? ensureSentence(c.description) : `Together we can do more for ${v.audience}.`,
      ],
      cta: `Find out about volunteer roles at ${v.link}.`,
      imageIdea: `A short "day in the life" video or photo series following one of your volunteers.`,
    },
    {
      emoji: "💬",
      headline: `"I get more out of it than I give"`,
      body: [
        `That's what our volunteers tell us again and again.`,
        `${c ? `Through ${c.name}, you` : "You"} could help ${v.audience} while meeting new people and building skills that look great on a CV.`,
        `Roles are flexible and we'll support you every step of the way.`,
      ],
      cta: `Start your volunteering journey at ${v.link}.`,
      imageIdea: `A portrait of a current volunteer with their own quote overlaid (with their permission).`,
    },
  ];
  return choose(v, rng, variants);
}

function successStory(v: Vars, rng: Rng): Parts {
  const variants: Parts[] = [
    {
      emoji: "🌱",
      headline: `A small win that meant a lot`,
      body: [
        `When one family first came to us, they were struggling to keep up with bills and didn't know where to turn.`,
        `With practical help from our team and a lot of courage on their part, things are starting to feel more manageable.`,
        `Stories like this are why ${v.org} exists. (Shared with permission, with names changed.)`,
      ],
      cta: `Help us support more people like them at ${v.link}.`,
      imageIdea: `A photo that tells the story without showing faces: a child's drawing, a full fridge, or a hand-written thank-you card.`,
    },
    {
      emoji: "💚",
      headline: `"I didn't think anyone would listen"`,
      body: [
        `That's what one young person told us when they first walked through our door.`,
        `Months later, they're more confident, back in education and now helping others who are where they once were.`,
        `This is the kind of change your support makes possible.`,
      ],
      cta: `Read more stories of impact at ${v.link}.`,
      imageIdea: `A simple quote card with the opening line in large serif type on a soft background.`,
    },
    {
      emoji: "🌟",
      headline: `This is what progress looks like`,
      body: [
        `Progress isn't always dramatic. Sometimes it's a first full night's sleep, a paid bill or a smile that wasn't there before.`,
        `This month our team saw plenty of those moments with ${v.audience}.`,
        `Thank you to everyone who made them possible.`,
      ],
      cta: `Be part of the next success story at ${v.link}.`,
      imageIdea: `A collage of small, everyday wins: a packed school bag, a thank-you note, a shared meal.`,
    },
  ];
  return choose(v, rng, variants);
}

function newsletter(v: Vars, rng: Rng): Parts {
  const c = v.campaign;
  const month = new Date().toLocaleDateString("en-GB", { month: "long" });
  return {
    emoji: "✉️",
    headline: pick(rng, [
      `Your ${month} update from ${v.org}`,
      `What your support made possible this month`,
      `News, thanks and what's coming up at ${v.org}`,
    ]),
    body: [
      `Dear friend,`,
      `Thank you for being part of the ${v.org} community. Here's a quick look at what's been happening.`,
      `This month: our team and volunteers have kept going for ${v.audience}, and none of it would be possible without people like you.`,
      c
        ? `${c.name}: ${c.description ? ensureSentence(c.description) : "This campaign is well underway."}${c.goal ? ` Our goal is to ${lowerFirst(stripTrailingPunctuation(c.goal))}.` : ""}`
        : `Looking ahead: we're planning new ways to reach more people who need us.`,
      v.event
        ? `Coming up: ${v.event.name} on ${v.eventDate}. We'd love to see you there.`
        : `Get involved: we're always looking for volunteers, fundraisers and friends to spread the word.`,
      `With warm thanks,\nThe ${v.org} team`,
    ],
    cta: `Read the full update and get involved at ${v.site || "our website"}.`,
    imageIdea: `A header image from a recent activity, plus one photo per section. Keep it light so it loads well on mobile.`,
  };
}

const TEMPLATES: Record<ContentType, (v: Vars, rng: Rng) => Parts> = {
  social_post: socialPost,
  event_promotion: eventPromotion,
  fundraising_appeal: fundraisingAppeal,
  awareness_post: awarenessPost,
  volunteer_recruitment: volunteerRecruitment,
  success_story: successStory,
  newsletter,
};

// ---------------------------------------------------------------------------
// Tone and platform shaping
// ---------------------------------------------------------------------------

const TONE_OPENERS: Record<Tone, string[]> = {
  professional: [""],
  friendly: ["Hi everyone!", "Hello lovely people!", ""],
  inspiring: ["Change starts with community.", "Together, we can do remarkable things.", ""],
  urgent: ["We need your help.", "Right now, this matters more than ever.", ""],
  educational: ["Did you know?", "Here's something worth knowing.", ""],
};

const TONE_CLOSERS: Record<Tone, string[]> = {
  professional: ["Thank you for your continued support."],
  friendly: ["Thanks for being part of our community!", "You lot are brilliant. Thank you!"],
  inspiring: ["Small acts, multiplied by many people, change lives.", "Thank you for believing in what's possible."],
  urgent: ["Please act today if you can.", "Every day counts. Thank you for stepping up."],
  educational: ["Knowledge is where change begins.", "Thanks for taking the time to learn more."],
};

function buildHashtags(v: Vars, input: GenerateInput, rng: Rng): string[] {
  const { platform, contentType, org } = input;
  const tags = new Set<string>();
  const causeTags = v.causes.map(toHashtag).filter(Boolean);
  const orgTag = toHashtag(v.org);
  const candidates = [
    ...causeTags,
    ...(v.campaign ? [toHashtag(v.campaign.name)] : []),
    ...TYPE_TAGS[contentType],
    orgTag,
    "#Charity",
    "#Community",
  ];
  for (const t of candidates) if (t && t.length <= 30) tags.add(t);

  const preferred = org.aiPreferences?.hashtagCount ?? 5;
  const platformMax: Record<Platform, number> = { instagram: 10, facebook: 3, linkedin: 4, x: 2 };
  const count = Math.max(1, Math.min(preferred, platformMax[platform]));
  const all = [...tags];
  // Keep the first cause tag and campaign tag, vary the rest.
  const head = all.slice(0, 2);
  const tail = all.slice(2).sort(() => rng() - 0.5);
  return [...head, ...tail].slice(0, count);
}

function applyEmoji(parts: Parts, level: OrgContext["aiPreferences"]["emojiLevel"], platform: Platform): Parts {
  if (level === "none" || platform === "linkedin") return parts;
  const body = [...parts.body];
  if (level === "moderate" && body.length > 1 && !body[0].startsWith("Dear")) {
    body[body.length - 1] = `${body[body.length - 1]} ${parts.emoji}`;
  }
  return { ...parts, headline: `${parts.emoji} ${parts.headline}`, body };
}

function fitForX(caption: string, cta: string, hashtags: string[]): string {
  const budget = 280 - cta.length - hashtags.join(" ").length - 4;
  let out = "";
  for (const s of sentences(caption)) {
    if ((out + " " + s).trim().length > budget) break;
    out = (out + " " + s).trim();
  }
  return out || caption.slice(0, Math.max(40, budget - 1)).trim() + "…";
}

function assemble(parts: Parts, v: Vars, input: GenerateInput, rng: Rng): ContentDraft {
  const { platform, tone, contentType, org } = input;
  const hashtags = buildHashtags(v, input, rng);
  const shaped = applyEmoji(parts, org.aiPreferences?.emojiLevel ?? "light", platform);

  let body = [...shaped.body];
  if (contentType !== "newsletter") {
    const opener = pick(rng, TONE_OPENERS[tone]);
    // An opener would break a first line that points back at the headline ("That's what one young person told us...").
    if (opener && !refersToHeadline(body[0])) body = [opener, ...body];
    if (platform !== "x") body.push(pick(rng, TONE_CLOSERS[tone]));
  }
  if (v.brief) body.splice(Math.min(2, body.length), 0, ensureSentence(v.brief));

  let caption = body.join(platform === "x" ? " " : "\n\n");
  let cta = parts.cta;
  if (org.aiPreferences?.alwaysIncludeWebsite && v.site && !cta.includes(v.site) && platform !== "instagram") {
    cta = `${cta} ${v.site}`;
  }
  if (platform === "x") caption = fitForX(caption, cta, hashtags);

  const draft: ContentDraft = {
    headline: shaped.headline,
    caption,
    cta,
    hashtags,
    imageIdea: parts.imageIdea,
  };
  return org.aiPreferences?.emojiLevel === "none" ? removeEmoji(draft) : draft;
}

function removeEmoji(d: ContentDraft): ContentDraft {
  return { ...d, headline: stripEmoji(d.headline).trim(), caption: stripEmoji(d.caption), cta: stripEmoji(d.cta) };
}

export function generateWithTemplates(input: GenerateInput): ContentDraft {
  const seed =
    input.seed ??
    hashString(`${input.org.name}|${input.platform}|${input.contentType}|${input.tone}|${Date.now()}|${Math.random()}`);
  const rng = createRng(seed);
  const v = buildVars(input, rng);
  const parts = TEMPLATES[input.contentType](v, rng);
  return assemble(parts, v, input, rng);
}

// ---------------------------------------------------------------------------
// Refinement
// ---------------------------------------------------------------------------

const EMOTIONAL_OPENERS = [
  "Behind every statistic is a real person with a name, a family and a story.",
  "Imagine not knowing where to turn. For too many people, that's everyday life.",
  "Some moments stay with you. This is one of them.",
];
const EMOTIONAL_CLOSERS = [
  "Your kindness reaches further than you'll ever know.",
  "It's not just help. It's hope.",
];
const ENGAGING_QUESTIONS = [
  "What does community mean to you? Tell us in the comments.",
  "Have you ever been helped by a local charity? We'd love to hear your story below.",
  "Tag someone who'd want to see this.",
];

const ALL_TONE_OPENERS = Object.values(TONE_OPENERS).flat().filter(Boolean);

// "What a week..." and "Why we care..." are not questions: a question word only counts when a verb follows it.
const QUESTION_START =
  /^((why|how|what|who|where|when) (is|are|was|were|does|do|did|would|will|can|could|should|has|have|makes?)|did you|have you|could you|got (a|an|some))\b/i;

function refersToHeadline(line: string | undefined): boolean {
  return /^(that's|that is|this is|these are)\b/i.test(stripEmoji(line ?? "").trim());
}

export function refineWithTemplates(draft: ContentDraft, refinement: Refinement, platform: Platform, seed = Date.now()): ContentDraft {
  const rng = createRng(seed);
  const paragraphs = draft.caption.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  switch (refinement) {
    case "shorter": {
      const all = sentences(draft.caption);
      const keep = platform === "x" ? 1 : Math.max(2, Math.ceil(all.length / 2.5));
      return {
        ...draft,
        caption: all.slice(0, keep).join(" "),
        cta: sentences(draft.cta)[0] ?? draft.cta,
        hashtags: draft.hashtags.slice(0, 3),
      };
    }
    case "professional": {
      const clean = (s: string) =>
        stripEmoji(s)
          .replace(/!+/g, ".")
          .replace(/\b(Hi everyone|Hello lovely people)\.?\s*/gi, "")
          .replace(/You lot are brilliant\.?\s*/gi, "")
          .replace(/\blovely\b/gi, "valued")
          .replace(/\.{2,}/g, ".")
          .trim();
      return {
        ...draft,
        headline: clean(draft.headline).replace(/\.$/, ""),
        caption: paragraphs.map(clean).filter(Boolean).join("\n\n"),
        cta: clean(draft.cta),
        hashtags: draft.hashtags.slice(0, 4),
      };
    }
    case "emotional": {
      const opener = pick(rng, EMOTIONAL_OPENERS);
      const closer = pick(rng, EMOTIONAL_CLOSERS);
      // Swap any existing tone opener ("Hello lovely people!") for the emotional one.
      const rest = paragraphs.filter((p) => !EMOTIONAL_OPENERS.includes(p) && !ALL_TONE_OPENERS.includes(p));
      const body = rest.length && refersToHeadline(rest[0]) ? [rest[0], opener, ...rest.slice(1)] : [opener, ...rest];
      if (!body.includes(closer)) body.push(closer);
      return {
        ...draft,
        caption: body.join(platform === "x" ? " " : "\n\n"),
      };
    }
    case "engaging": {
      const question = pick(rng, ENGAGING_QUESTIONS);
      const hook = draft.headline.endsWith("?") ? draft.headline : `${stripTrailingPunctuation(draft.headline)}?`;
      const body = [...paragraphs];
      if (!body.some((p) => ENGAGING_QUESTIONS.includes(p))) body.push(question);
      return {
        ...draft,
        headline: QUESTION_START.test(stripEmoji(draft.headline).trim())
          ? hook
          : `${stripTrailingPunctuation(draft.headline)}: here's how you can help`,
        caption: body.join(platform === "x" ? " " : "\n\n"),
      };
    }
  }
}
