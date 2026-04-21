# PM Metrics Copilot

An AI-powered product metrics analysis tool that helps product managers identify churn signals, A/B test opportunities, funnel drop-offs, and leading/lagging indicators — all powered by Claude.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS (via Vite)
- **Backend/Auth**: Supabase
- **AI**: Anthropic Claude (claude-sonnet-4-6)
- **Deployment**: Vercel

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd "PM Metrics Copilot"
npm install
```

### 2. Create Environment File

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` using **both** blocks in `.env.example`:

- **`VITE_*`**: used by the React app (Supabase client only).
- **`SUPABASE_*` and `ANTHROPIC_API_KEY`**: used **only** by the Vercel serverless route `api/analyze.ts`. Claude is **not** called from the browser, so your Anthropic key never ships to users.

Never put `ANTHROPIC_API_KEY` behind a `VITE_` prefix — Vite would embed it in client JavaScript.

### 3. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once created, go to **Settings > API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql` to create the `analyses` table with Row Level Security enabled.
4. In **Authentication > Settings**, configure your site URL (e.g. `http://localhost:5173` for local dev, and your Vercel URL for production).

### 4. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key and set **`ANTHROPIC_API_KEY`** in `.env` (and in Vercel project settings for deploys).

### 5. Run Locally

**Full stack (recommended)** — serves the Vite app and `/api/analyze`:

```bash
npx vercel dev
```

Open the URL printed in the terminal (often [http://localhost:3000](http://localhost:3000) for `vercel dev`).

**Frontend only** — quick UI work without AI:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). **Analyze** will not work until you use `vercel dev` or a deployed preview, because `/api/analyze` runs on Vercel.

### 6. API keys and privacy

| Variable | Where it runs | Safe to expose? |
|----------|----------------|-----------------|
| `VITE_SUPABASE_*` | Browser | The anon key is public by design; RLS must protect `analyses`. |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY` | Vercel server only | **No** — keep in `.env` (gitignored) and Vercel env settings only. |

Keep the repo private, never commit `.env`, and do not grant Vercel or Supabase dashboard access to people you do not trust.

---

## Usage

1. **Sign up / Sign in** via email + password or magic link
2. **Enter metrics** manually (label + value rows) or **upload a CSV** and map columns
3. Optionally select a **product context** (SaaS, Fintech, etc.) and **time period**
4. Click **"Analyze with AI"** — Claude will generate insights across 4 panels:
   - Churn & Retention Signals
   - A/B Test Recommendations
   - Funnel Drop-off Diagnosis
   - Leading vs Lagging Breakdown
5. **Save** the analysis with a name to persist it for later
6. Access past analyses from the **History sidebar**

---

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel's project settings — same names as in `.env.example` (`VITE_SUPABASE_*` for the build, plus `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY` for `api/analyze`)
4. Deploy — Vercel will auto-detect the Vite config

The `vercel.json` file already handles SPA routing (all paths redirect to `index.html`).

---

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login, Signup, MagicLink
│   ├── input/         # ContextSelector, MetricForm, CSVUpload
│   ├── output/        # InsightCard, AnalysisPanel, PanelTabs
│   └── layout/        # Header, Sidebar, HistoryList
├── lib/
│   ├── supabase.ts    # Supabase client
│   ├── claude.ts      # Claude API integration
│   └── csv.ts         # CSV parsing utility
├── types/
│   └── index.ts       # TypeScript types
└── App.tsx            # Main app with routing + state
supabase/
└── schema.sql         # Database schema
```
