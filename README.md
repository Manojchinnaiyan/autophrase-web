# Autophrase — Web

Cloudflare-hosted web companion to the Autophrase Chrome extension.

- **Frontend**: Vite + React + TypeScript + Tailwind
- **Backend**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (users, sessions, subscriptions, trial usage)
- **Payments**: Razorpay (stubbed when keys are missing)
- **AI**: BYOK — users plug their own Anthropic / OpenAI / Google keys; keys live in their browser only

## Architecture

```
Browser
  ├── React SPA (served from Workers /assets binding)
  ├── localStorage  ← API keys (BYOK, never sent to us)
  └── direct calls to Anthropic/OpenAI/Google APIs

Workers (Hono)
  ├── /api/auth/{signup,signin,signout}
  ├── /api/me                 ← account + trial state
  ├── /api/usage/record       ← trial-gate counter (no AI proxying)
  ├── /api/billing/{plans, create-order, verify}
  └── *  → static SPA fallback

D1
  ├── users (email, password_hash, trial_ends_at)
  ├── sessions (cookie-backed)
  ├── subscriptions (razorpay refs, status, period)
  └── trial_usage (request counter)
```

We never proxy AI calls. Users BYOK and call providers directly, so the only thing the server tracks is **auth, subscription, and trial usage**.

## Local setup

```bash
cd autophrase-web
npm install
cp .dev.vars.example .dev.vars     # edit if testing real Razorpay locally
```

Create the D1 database and update `wrangler.toml` with the returned `database_id`:

```bash
npx wrangler d1 create autophrase-db
# paste the id into wrangler.toml > [[d1_databases]] > database_id
npm run db:migrate:local
```

Run dev (two terminals):

```bash
npm run dev:worker     # wrangler dev — Worker + D1 at :8787
npm run dev            # Vite SPA at :5173, proxies /api to :8787
```

Open http://localhost:5173.

> Without Razorpay keys the `/api/billing/create-order` returns a stub order and `openCheckout` simulates a successful payment so the upgrade flow is exercisable end-to-end.

## Deploy to Cloudflare

```bash
# One time
npx wrangler login
npx wrangler d1 migrations apply autophrase-db --remote
npx wrangler secret put SESSION_SECRET
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET

# Every release
npm run deploy   # builds SPA, deploys Worker + assets
```

The Worker serves both `/api/*` and the static React build (single-origin, no CORS in production). The `[assets]` block in `wrangler.toml` is configured for SPA fallback.

## Razorpay integration

The Worker creates orders via `POST https://api.razorpay.com/v1/orders` using HTTP Basic auth (`RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET`). The frontend opens Razorpay Checkout with that order id; on success the SDK returns `razorpay_payment_id` + `razorpay_signature`, which the Worker verifies via HMAC-SHA256 of `<order_id>|<payment_id>` and only then marks the subscription `active`.

To go live:
1. Create live keys in the Razorpay dashboard
2. `wrangler secret put RAZORPAY_KEY_ID` (live key)
3. `wrangler secret put RAZORPAY_KEY_SECRET`
4. Configure webhook (optional, for refunds / disputes) → `POST /api/billing/webhook` (not yet implemented)

## Adding Claude as a managed premium tier (future)

The current model is BYOK only. If you later want to offer a managed Claude tier:
1. Add a `managed_provider` column to `subscriptions`
2. Add `/api/ai/chat` that streams from Anthropic using a server-side key
3. Gate it on `subscriptionActive && plan === 'pro_plus'`
4. Track per-user token usage in a new `usage_tokens` table

The provider abstraction in `src/providers` is the same shape on both sides — the Chat page can fork between "direct call" (BYOK) and "via /api/ai/chat" (managed) based on the active plan.

## File layout

```
autophrase-web/
├── migrations/0001_init.sql      D1 schema
├── worker/
│   ├── index.ts                  Hono routes
│   ├── crypto.ts                 PBKDF2 password hashing
│   ├── db.ts                     D1 queries
│   └── types.ts                  Env + row types
├── src/
│   ├── main.tsx                  Entry
│   ├── App.tsx                   Router
│   ├── components/               Layout, RequireAuth, TrialBanner, Logo
│   ├── lib/                      auth ctx, api client, keys (localStorage), razorpay, theme
│   ├── pages/                    Landing, SignIn, SignUp, Pricing, Dashboard, Chat, Settings
│   └── providers/                Anthropic / OpenAI / Google (browser-direct, BYOK)
├── wrangler.toml
└── vite.config.ts                Vite dev proxy → wrangler dev
```
# autophrase-web
