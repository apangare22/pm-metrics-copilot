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

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once created, go to **Settings > API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql` to create the `analyses` table with Row Level Security enabled.
4. In **Authentication > Settings**, configure your site URL (e.g. `http://localhost:5173` for local dev, and your Vercel URL for production).

### 4. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key and paste it as `VITE_ANTHROPIC_API_KEY`

> **Note**: This app calls the Anthropic API directly from the browser using `dangerouslyAllowBrowser: true`. This is acceptable for personal/demo use but for production, consider proxying through a backend to keep your API key secret.

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

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
3. Add environment variables in Vercel's project settings (same three vars from `.env`)
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
