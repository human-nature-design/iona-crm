# Iona CRM

A generic CRM boilerplate for vibe coding on top of. 

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) (`npm install -g supabase`)

## Local setup

### 1. Start Supabase locally

```bash
npx supabase start
```

This spins up the full Supabase stack via Docker (Postgres with pgvector, Auth, REST API, Studio, email testing). All migrations in `supabase/migrations/` are applied automatically.

The output will print your local URLs and keys — you'll need these for the next step.

Useful local URLs:
| Service | URL |
|---------|-----|
| Supabase Studio | http://127.0.0.1:54323 |
| Inbucket (email testing) | http://127.0.0.1:54324 |
| REST API | http://127.0.0.1:54321 |

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the keys from the `supabase start` output:
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` → the `anon key`
- `SUPABASE_SECRET_KEY` → the `service_role key`

Generate an auth secret:
```bash
openssl rand -hex 32
```

Add your own API keys:
- `OPENAI_API_KEY` — required for embeddings and AI features
- `ANTHROPIC_API_KEY` — required for Anthropic model support
- `STRIPE_SECRET_KEY` — required for billing (or leave as placeholder to skip)

### 3. Install dependencies

```bash
pnpm install
```

### 4. Seed the database

```bash
pnpm db:seed
```

Creates a test user: `test@test.com` / `admin123`

### 5. Start the dev server

```bash
pnpm dev
```

Open http://localhost:3000.

## Stopping Supabase

```bash
npx supabase stop           # Keeps data for next start
npx supabase stop --no-backup  # Wipes all local data
```

## Features

### Companies and contacts

### Content library

### AI Chat

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL with pgvector
- **Auth**: Supabase Auth with Row Level Security
- **Payments**: Stripe
- **AI/ML**: OpenAI embeddings, Vercel AI SDK for streaming chat
- **UI**: shadcn/ui with Tailwind CSS

## Stripe (optional)

Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run the webhook listener for local development:

```bash
stripe login
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## Testing

```bash
pnpm test          # Unit tests (Jest)
pnpm test:e2e      # E2E tests (Playwright)
```

See `__tests__/README.md` for detailed test documentation.

## Using a hosted Supabase instance

If you prefer a hosted Supabase project instead of running locally, see the commented-out section in `.env.example` for connection string formats. Push migrations with:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

## Environment Variables

See `.env.example` for the full list with descriptions.
