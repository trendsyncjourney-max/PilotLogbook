# Pilot AI Logbook

AI-powered pilot logbook. Pilots take photos of cockpit documents and screens — the app extracts all the relevant data using Claude Vision AI and populates a structured flight logbook automatically.

## How it works

A 6-step wizard guides the pilot through each photo:

| Step | Photo | AI Extracts |
|------|-------|-------------|
| 1 | Aircraft fuselage / tail | Registration / call sign |
| 2 | General Declaration | Both pilot names, date, route |
| 3 | — (manual selection) | Who is Pilot Flying vs Monitoring |
| 4 | MCDU / FMS screen | Departure & arrival ICAO codes |
| 5 | ACARS screen | Off-block, takeoff, landing, on-block times |
| 6 | Review | Confirm everything → save to logbook |

All fields are editable before saving in case the AI misreads anything.

## Tech stack

- **Frontend / API**: Next.js 16 (App Router, TypeScript)
- **AI Image Analysis**: Claude Vision API (claude-opus-4-7)
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Local development

### Prerequisites
- Node.js 20+
- Docker (for local Supabase)
- Supabase CLI

### 1. Install dependencies

```bash
npm install
```

### 2. Start local Supabase

```bash
npx supabase start
```

This starts a local PostgreSQL + Auth stack. Copy the output credentials into `.env.local`.

### 3. Run the database schema

```bash
npx supabase db reset
```

Or paste the contents of `supabase/schema.sql` into the Supabase Studio SQL editor at `http://localhost:54323`.

### 4. Set environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start output>
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cloud deployment (Vercel)

1. Create a [Supabase](https://supabase.com) project and run `supabase/schema.sql` in the SQL editor
2. Import this repo at [vercel.com](https://vercel.com)
3. Add the three environment variables from `.env.local.example`
4. Deploy

## Database schema

See `supabase/schema.sql`. Row Level Security is enabled — each pilot can only access their own logbook entries.

## Logbook fields recorded

- Date
- Aircraft call sign
- Departure airport (ICAO)
- Arrival airport (ICAO)
- Pilot Flying (PF)
- Pilot Monitoring (PM)
- Off-block time (UTC)
- Takeoff time (UTC)
- Landing time (UTC)
- On-block time (UTC)
- Total block time
