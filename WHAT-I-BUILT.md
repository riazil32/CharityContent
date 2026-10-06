# CharityContent MVP: what was built

## 1. What I built

A working Next.js SaaS prototype for small UK charities, with navigation between every part of the product:

- **Landing page** (`/`): hero with the headline "A month of charity content in minutes.", both CTAs, a live-looking product preview, How it works, Features, Example content (clickable examples for HopeBridge), Pricing, FAQ and a final CTA.
- **Pricing page** (`/pricing`): the three plans (Free, Starter £19, Growth £39) plus a comparison table.
- **Sign up, log in, log out** (`/signup`, `/login`), plus a one-click "Explore the HopeBridge demo account".
- **Onboarding** (`/onboarding`): four steps covering every field you listed (name, type, what you do, who you help, website, platforms, tone, causes, campaigns, key dates). It has a "Fill with example" button for fast demos.
- **Dashboard** (`/dashboard`): welcome message, organisation name, content this month, upcoming content, current campaigns, important dates (the charity's events plus relevant UK awareness days), quick actions and the main "Generate this month's content" button.
- **Content generator** (`/generate`): choose campaign, platform (Instagram, Facebook, LinkedIn, X), content type (all 7) and tone (all 5), with an optional "anything specific to include" box. Every result has a headline/hook, caption, CTA, hashtags and image idea, shown as a realistic post preview.
- **Rewrite buttons** everywhere a post is shown: make it more engaging, shorter, more professional, more emotional, and "Give me 3 alternatives".
- **Monthly calendar** (`/calendar`): month grid on desktop and tablet, agenda list on mobile, platform filters, month navigation, event and awareness-day markers. Click any post to view, edit, rewrite, favourite, copy or delete it.
- **Content library** (`/library`): search, filter by platform, filter by content type, favourites filter, sort, and edit, copy, delete and favourite on every card.
- **Settings** (`/settings`): organisation profile (including campaigns and dates), AI and tone of voice preferences (emoji level, hashtag count, British English, words to avoid), subscription, connected platforms ("Coming soon" for all four) and account (name, password, log out).

"Generate this month's content" plans a realistic rhythm (Monday, Wednesday, Friday, Sunday, plus a monthly newsletter), spreads posts across the charity's platforms, links them to its campaigns, adds reminders a week before and the day before each of the charity's events, and adds relevant UK awareness days (for example World Food Day for a food poverty charity).

## 2. How to run it

```bash
cd charitycontent
npm install
npm run dev
```

Open http://localhost:3000. To show a charity, click **Explore the demo** on the landing page: you're signed in as HopeBridge Community Trust with a full calendar. To show the new-user journey, click **Create your first month free** and sign up with any email.

You need Node.js 18.18 or newer (20+ recommended). `npm run build && npm start` runs the production build.

## 3. Environment variables

All are optional; see `.env.example`. Copy it to `.env.local`.

- **AI:** `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, default `gpt-4o-mini`).
- **Accounts and database:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (server only, for the Stripe webhook). Run `supabase/schema.sql` in the Supabase SQL editor first.
- **Payments:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, and `NEXT_PUBLIC_APP_URL`.

No keys or secrets are hard-coded anywhere.

## 4. What is fully functional

- Every page, navigation, and the full journey: landing, sign up, onboarding, dashboard, generate, calendar, library, settings, log out.
- Sign up, log in and log out (in-browser accounts in demo mode; real Supabase email/password auth once keys are set).
- Onboarding saves the organisation profile, and every setting can be edited later.
- Content generation for single posts, three alternatives and a whole month, all four rewrite buttons, saving to library, scheduling to the calendar, editing, copying to clipboard, deleting and favouriting.
- Plan limits: Free gets 5 generations a month, Starter 50, Growth unlimited. Rewrites are free. With Supabase on, the limit is enforced in the database so it can't be bypassed from the browser.
- With an OpenAI key, content is written by the LLM using a charity-specific prompt (British English, no invented statistics, dignity-first storytelling, platform rules). If the API fails, it falls back to the built-in writer instead of showing an error.
- The Supabase schema with row-level security (each charity sees only its own data), and Stripe Checkout plus a signature-verified webhook that updates the plan.
- Responsive on desktop, tablet and mobile. I tested it in a real browser at 1440px, 820px, 390px and 375px wide, with no console errors and no horizontal scrolling.

## 5. What is mocked or demo functionality

- **Without an OpenAI key**, content comes from a built-in template writer. It uses the charity's real profile (name, mission, audience, causes, campaigns, events, tone and preferences), so it reads well in a demo, but it is less varied than a real LLM. The UI labels these results "Built-in writer".
- **Without Supabase**, accounts and content are stored in the browser's localStorage. They don't sync between devices, and the password hashing there isn't real security.
- **Payments:** in demo mode, choosing a plan in Settings switches instantly with no payment, so you can show the upgrade flow. Real Stripe Checkout only runs once both Stripe and Supabase keys are set. There is no billing portal for cancelling yet.
- **Social publishing** is shown as "Coming soon"; users copy each post into their platform.
- Pricing-page limits other than generations (library size and number of platforms on Free, team members on Growth) are shown but not enforced yet.
- HopeBridge Community Trust, its campaigns, events, stories and figures are fictional. The quote on the login page is labelled as the kind of feedback we're aiming for, not a real testimonial.

## 6. What to build next for a real commercial product

1. **Switch on the real services:** a Supabase project, an OpenAI key and Stripe test-mode prices, then deploy (Vercel is the simplest fit for Next.js) on your own domain.
2. **Billing completeness:** a Stripe Customer Portal link for cancelling or changing plans, VAT handling, invoices with the charity's name, and a proper downgrade path.
3. **Legal and trust basics:** privacy policy, terms, cookie notice, a UK GDPR data processing statement (you'll hold charity data and send it to an AI provider), and account deletion and data export.
4. **Enforce the remaining plan limits** (library size, platforms, team seats) on the server.
5. **Team accounts on Growth:** invite colleagues, roles, and multiple organisations per account.
6. **Social publishing:** start with Meta (Facebook and Instagram) and LinkedIn scheduling. These need app review, so begin early. Or integrate a scheduler such as Buffer as a faster first step.
7. **Better AI:** let the charity paste past posts so the AI learns its voice, add image generation or Canva templates, store prompt versions, and track which posts users keep or edit to improve quality.
8. **Onboarding and retention:** a welcome email sequence, a monthly "your content is ready" email, and analytics (for example PostHog) to see where charities drop off.
9. **Customer discovery:** put this in front of five to ten small charities, watch them use it, and adjust pricing (many will ask about charity discounts or annual plans).
10. **Engineering hygiene:** a git repository, automated tests for the generator and month planner, error monitoring (for example Sentry), and rate limiting on `/api/generate`.
