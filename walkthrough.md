# GradAtlas — University Application Tracker
## Build Walkthrough & Feature Guide

---

## What Was Built

**GradAtlas** is a full-stack, responsive web application for tracking, managing, comparing, and backing up university application data. It runs locally with zero external dependencies (SQLite + Guest Login) and deploys to Vercel with a single command.

### Architecture & System Design
![Architecture & System Design](Screenshot 2026-05-26 194931.png)

---

## Project Structure

```
College Applications/
├── app/
│   ├── api/
│   │   ├── applications/route.ts   ← CRUD REST API (GET, POST, DELETE)
│   │   └── auth/[...nextauth]/     ← NextAuth handler
│   ├── dashboard/
│   │   ├── page.tsx                ← Main tracking dashboard
│   │   └── comparison/page.tsx     ← Side-by-side comparison view
│   ├── globals.css                 ← Obsidian dark theme + glassmorphic styles
│   ├── layout.tsx                  ← Root layout with SessionProvider
│   └── page.tsx                    ← Landing / sign-in page
├── components/
│   └── providers.tsx               ← NextAuth SessionProvider wrapper
├── lib/
│   ├── auth.ts                     ← NextAuth config (Google + Demo)
│   ├── currency.ts                 ← Live exchange rate utility
│   └── db.ts                       ← Singleton Prisma client
├── prisma/
│   └── schema.prisma               ← Database schema (SQLite → PostgreSQL)
├── .env                            ← Local environment variables
├── .env.example                    ← Production deployment template
└── package.json
```

---

## How to Run Locally

### Prerequisites
Node.js is installed at `C:\Program Files\nodejs`. You need to add it to PATH in any new terminal:

```powershell
$env:Path += ";C:\Program Files\nodejs"
```

### Start the dev server
```powershell
npm run dev
```
Open **http://localhost:3000** in your browser.

### Guest Login (No Google setup required)
Click **"Instant Guest Access"** on the landing page. A demo user is auto-created in the local SQLite database (`prisma/dev.db`) and you are immediately taken to the dashboard.

---

## Features Built

### ✅ Landing Page (`/`)
- Gradient animated hero section with purple/indigo branding
- Feature highlight cards (Live Forex, Compare Tool, Backups)
- **Google OAuth** sign-in button
- **Instant Guest Access** — one-click demo login, no credentials needed

### ✅ Dashboard (`/dashboard`)
- **KPI Cards**: Total applications, status breakdown (Offers/Pending/Drafts), total INR outlay, nearest upcoming deadline
- **Search & Filters**: Free-text search + Status filter + Country filter
- **Application Cards**: Country badge, status pill, world rank, tuition (INR), deadline summary
- **Compare Checkboxes**: Select 2+ cards → floating comparison bar appears at bottom
- **JSON & CSV Export**: Download full backup at any time
- **Add / Edit Modal** with 5 tabbed sections:

  | Tab | Fields |
  |-----|--------|
  | General | University, Course, Country, Rankings, Duration, Address, Website |
  | Academics & Exams | GPA, IELTS, GRE, Transcripts, Resume, SOP, Letters of Rec |
  | Experience | Work Exp, Research Exp, Applied Before |
  | Finance & Deadlines | Opening/Priority/Final dates, App Fee + Tuition with live INR conversion |
  | Interest & Custom Fields | Status (including Shortlisted/Not Shortlisted), Interest rating (1–10), unlimited dynamic key-value fields |

### ✅ Comparison Dashboard (`/dashboard/comparison`)
- Side-by-side table comparing all selected programs
- **Auto-highlights**: 🟢 Cheapest Tuition, 🏆 Top World Rank, ⭐ Highest Interest
- Compares all 25 tracked fields including custom dynamic attributes
- Shows original currency + INR equivalent for all fees

### ✅ Currency Conversion
- Uses `https://open.er-api.com/v6/latest/USD` (free, no API key)
- Rates cached for 4 hours server-side
- Instant client-side preview while typing fees in the form
- INR values saved to database via server-side calculation on save

### ✅ Authentication
- **Google OAuth**: Production-ready, requires Google Cloud Console credentials
- **Demo / Guest**: Works immediately without any OAuth config; creates a persistent demo user in SQLite

### ✅ Data Storage
- **Local**: SQLite (`prisma/dev.db`) — zero setup, auto-created
- **Production**: Switch to PostgreSQL by changing `DATABASE_URL` in `.env`

### ✅ Extensibility
- Add unlimited custom key-value fields per university via the "Dynamic Metadata Attributes" section
- No database migration needed — stored as JSON in `additionalFields` column
- Custom fields automatically appear in the comparison dashboard

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial GradAtlas build"
git remote add origin https://github.com/yourusername/college-applications.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
2. Vercel auto-detects Next.js — no build config changes needed

### 3. Set Environment Variables in Vercel Dashboard
| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your PostgreSQL connection string (from Supabase/PlanetScale) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | A random 32+ char string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

### 4. Run Database Migration on Production
After first deploy, run from local with production `DATABASE_URL`:
```bash
npx prisma db push
```

### 5. Configure Google OAuth Redirect
In [Google Cloud Console](https://console.cloud.google.com) → Your OAuth App → **Authorized redirect URIs**, add:
```
https://your-app.vercel.app/api/auth/callback/google
```

---

## Google OAuth Setup (Quick Reference)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app.vercel.app/api/auth/callback/google`
5. Copy the Client ID and Secret → paste into `.env` / Vercel env vars

---

## Switching from SQLite → PostgreSQL

Only one change needed in `.env`:

```diff
-DATABASE_URL="file:./dev.db"
+DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

Then run:
```bash
npx prisma db push
```

Prisma handles the rest — no code changes required.

---

## Adding New Fields in the Future

To add a new tracked attribute that doesn't need its own dedicated column:

1. Open the **"Add College"** form → **Interest & Custom Fields** tab
2. Click **"Add Parameter"**
3. Enter a label (e.g. `Scholarship Available`) and a value (e.g. `Yes, 50% waiver`)
4. Save — the field appears in the comparison dashboard automatically

To add a **dedicated database column** (for filtering/querying):
1. Edit `prisma/schema.prisma` — add the new field
2. Run `npx prisma db push`
3. Update the API in `app/api/applications/route.ts`
4. Add the input field to the appropriate tab in `app/dashboard/page.tsx`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [layout.tsx](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/app/layout.tsx) | Root layout, SEO metadata, session provider |
| [page.tsx](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/app/page.tsx) | Landing page with auth buttons |
| [dashboard/page.tsx](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/app/dashboard/page.tsx) | Main dashboard with all 25 tracked fields |
| [comparison/page.tsx](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/app/dashboard/comparison/page.tsx) | Side-by-side university comparison |
| [applications/route.ts](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/app/api/applications/route.ts) | REST API for CRUD operations |
| [auth.ts](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/lib/auth.ts) | NextAuth config (Google + Guest) |
| [currency.ts](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/lib/currency.ts) | Live INR currency converter |
| [schema.prisma](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/prisma/schema.prisma) | Database schema |
| [.env.example](file:///c:/Users/Admin/Desktop/Projects/College%20Applications/.env.example) | Production environment template |
