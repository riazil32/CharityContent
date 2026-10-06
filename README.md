# CharityContent

The AI marketing assistant for small UK charities. A charity describes itself once and gets a month of social posts, appeals and newsletters, planned into a calendar and written in its own voice.

Built with Next.js 15 (App Router), TypeScript and Tailwind CSS 4. Supabase, OpenAI and Stripe are optional. With no keys set, the whole app runs in **demo mode**.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

- **Explore the demo:** click "Explore the demo" on the landing page, or "Explore the HopeBridge demo account" on the login page. This signs you in as HopeBridge Community Trust (a fictional charity), with campaigns, events and a full calendar already filled in.
- **Try the new-charity journey:** sign up with any email and go through onboarding. There's a "Fill with example" button if you want to move quickly.

Production build: `npm run build && npm start`. Type check: `npm run typecheck`.

## Environment variables

Copy `.env.example` to `.env.local`. Every variable is optional.

| Variable | What it switches on |
| --- | --- |
| `OPENAI_API_KEY` | Real AI writing through OpenAI. Without it, the built-in template writer is used. |
| `OPENAI_MODEL` | Optional model override (default `gpt-4o-mini`). |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real accounts (email and password) and a Postgres database. Without them, accounts and content are stored in the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Lets the Stripe webhook update a charity's plan. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe Checkout for upgrades, and the webhook that keeps plans in sync. |
| `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH` | Stripe Price IDs for the £19 and £39 monthly plans. |
| `NEXT_PUBLIC_APP_URL` | Public URL, used for Stripe redirect links. |

### Setting up Supabase

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql`. It creates the tables, row-level security, and a `consume_generation()` function that enforces plan limits on the server.
3. Add the URL and anon key to `.env.local` and restart. In Authentication > URL configuration, add your site URL so confirmation emails link back correctly.

### Setting up Stripe

1. Create two recurring monthly prices in Stripe (Starter £19, Growth £39) and put their IDs in the env vars.
2. Add a webhook endpoint pointing to `https://<your-domain>/api/stripe/webhook` with the events `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`.
3. Stripe needs Supabase to be configured too, because plans are stored on the organisation row.

## How it is organised

```
src/
  app/
    (marketing)/        Landing page and pricing
    (auth)/             Log in and sign up
    onboarding/         4-step organisation setup
    (app)/              Signed-in product: dashboard, generate, calendar, library, settings
    api/generate/       Content generation endpoint (single post, alternatives, month, rewrites)
    api/stripe/         Checkout session and webhook
  components/           UI kit, app shell, editor, previews, pricing cards
  lib/
    ai/                 OpenAI client, offline template writer, month planner, UK awareness days
    data/               Backend interface with demo (localStorage) and Supabase implementations
    billing/            Minimal Stripe REST client and signature verification
    plans.ts            Plan definitions and limits (single source of truth)
    demo-data.ts        HopeBridge Community Trust demo data
supabase/schema.sql     Database schema, RLS policies, usage function
```

The UI never talks to Supabase or OpenAI directly. It uses `useApp()` (`src/components/app-provider.tsx`), which picks the demo or Supabase backend from the env vars and calls `/api/generate` for AI. That keeps switching from demo to production a configuration change.

## Usage limits

Generating a single post, three alternatives, or a whole month uses one generation. Rewrites ("make it shorter" etc.) are free. With Supabase on, limits are enforced in the database; in demo mode they are tracked in the browser. In demo mode you can switch plans instantly from Settings > Subscription with no payment.
