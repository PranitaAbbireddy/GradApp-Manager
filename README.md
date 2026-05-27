# GradAtlas

A full-stack university application tracking platform built with Next.js, Prisma, NextAuth, and SQLite/PostgreSQL. GradAtlas helps students organize, compare, manage, and back up their university applications through a modern and responsive dashboard.

---

## Overview

GradAtlas provides a centralized system for managing graduate and undergraduate university applications. The platform supports application tracking, side-by-side university comparisons, live currency conversion, authentication, backup exports, and extensible metadata support.

The application is designed to work locally with zero external database setup using SQLite, while also supporting seamless deployment to production environments using PostgreSQL and Vercel.

---

## Features

### Application Management
- Create, edit, and delete university applications
- Track application status, deadlines, rankings, tuition fees, and requirements
- Search and filter applications by keyword, status, and country
- Track up to 25 structured fields per application

### Comparison Dashboard
- Compare multiple universities side-by-side
- Automatic highlighting for:
  - Lowest tuition
  - Highest ranking
  - Highest interest rating
- Supports dynamic custom fields in comparison tables

### Authentication
- Google OAuth authentication using NextAuth
- Instant guest login without OAuth configuration
- Persistent demo user support for local development

### Currency Conversion
- Live exchange rate conversion to INR
- Server-side caching for reduced API usage
- Real-time fee preview while entering application data

### Backup & Export
- Export application data as:
  - JSON
  - CSV

### Extensibility
- Add unlimited custom metadata fields without database migrations
- Dynamic attributes stored as JSON
- Automatically integrated into comparison views

### Deployment Ready
- SQLite support for local development
- PostgreSQL support for production
- One-click deployment with Vercel

---

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Next.js API Routes |
| Authentication | NextAuth |
| Database ORM | Prisma |
| Databases | SQLite, PostgreSQL |
| Styling | CSS, Glassmorphism UI |
| Deployment | Vercel |

---

## Project Structure

```bash
College Applications/
├── app/
│   ├── api/
│   │   ├── applications/route.ts
│   │   └── auth/[...nextauth]/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── comparison/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── providers.tsx
├── lib/
│   ├── auth.ts
│   ├── currency.ts
│   └── db.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
└── package.json
```

---

## Screenshots

### Architecture & System Design

> Add architecture image here:  
> `Architecture Diagram.png`

---

## Local Development Setup

### Prerequisites

- Node.js
- npm
- Git

---

### Clone the Repository

```bash
git clone https://github.com/yourusername/gradatlas.git
cd gradatlas
```

---

### Install Dependencies

```bash
npm install
```

---

### Configure Environment Variables

Create a `.env` file in the root directory using the guidelines in .env.example.

---

### Initialize Prisma

```bash
npx prisma db push
```

---

### Start Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Guest Login

GradAtlas supports instant guest access without requiring Google OAuth setup.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Database connection string |
| `NEXTAUTH_URL` | Base application URL |
| `NEXTAUTH_SECRET` | Secret used by NextAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |

---

## Deployment

### Deploy to Vercel

1. Push the repository to GitHub
2. Import the repository into Vercel
3. Add environment variables
4. Deploy

---

### Production Database Migration

```bash
npx prisma db push
```

---

## Vercel Deployment Link

```txt
Add deployed Vercel URL here
```

---

## Google OAuth Setup

1. Open Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs

### Local Redirect URI

```txt
http://localhost:3000/api/auth/callback/google
```

---

## Switching to PostgreSQL

Update the `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

Then run:

```bash
npx prisma db push
```

---

## Dynamic Custom Fields

GradAtlas supports unlimited dynamic metadata fields for universities.

Examples:
- Scholarship Information
- Faculty Rating
- Housing Availability
- Visa Notes
- Interview Status

Custom fields are automatically stored and rendered in the comparison dashboard.

---

## API Overview

### Applications API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/applications` | Fetch applications |
| POST | `/api/applications` | Create or update application |
| DELETE | `/api/applications` | Delete application |

---

## Key Files

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout and session provider |
| `app/page.tsx` | Landing page |
| `app/dashboard/page.tsx` | Main dashboard |
| `app/dashboard/comparison/page.tsx` | Comparison view |
| `app/api/applications/route.ts` | CRUD API routes |
| `lib/auth.ts` | Authentication configuration |
| `lib/currency.ts` | Currency conversion utility |
| `prisma/schema.prisma` | Database schema |
| `.env.example` | Environment variable template |

---

## Future Improvements

- Email reminders for deadlines
- University recommendation engine
- Scholarship tracking
- Mobile app support
- Analytics dashboard
- Document upload system

---

## License

This project is licensed under the MIT License. 
