# MediDash — Frontend

Clinical dashboard for medical staff (doctors and nurses), built with Next.js 16 App Router, React 19, TanStack Query v5, Axios, and Tailwind CSS v4.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root path redirects automatically to `/login`.

## Available Scripts

```bash
npm run dev      # development server on localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Project Structure

```
app/
  (auth)/login        # unauthenticated login page
  (dashboard)/        # protected shell (Sidebar + TopBar layout)
    patients/         # patient list and detail (/patients/[id])
    drugs/            # drug interaction checker
    checklists/[id]/  # per-patient checklists
components/
  ui/                 # Button, Card, Input, Badge primitives
  layout/             # Sidebar, TopBar
  patients/           # patient-specific components
  drugs/              # drug-specific components
  checklists/         # checklist-specific components
context/
  AuthContext.tsx     # client-side auth state + login/logout helpers
  QueryProvider.tsx   # global TanStack Query client (staleTime: 2 min, retry: 1)
hooks/                # usePatients, useDrugs, useChecklists, useAuth
lib/
  api.ts              # pre-configured Axios instance (reads access_token cookie, redirects on 401)
middleware.ts         # guards non-static routes; redirects unauthenticated → /login
types/index.ts        # shared types: User, Patient, Drug, InteractionResult, Checklist, ChecklistItem
```

## Auth & Routing

Authentication is managed client-side. The `access_token` cookie is the source of truth for both `middleware.ts` and the Axios interceptor in `lib/api.ts`. User data is persisted in `localStorage` via `AuthContext`.

## Environment Variables

| Variable              | Description                        | Default                    |
|-----------------------|------------------------------------|----------------------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL                   | `http://localhost:8000`    |

Create a `.env.local` file at the project root to override defaults:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## UI

The app is dark-mode only. The `<html>` element carries `class="dark"` and the body uses `bg-gray-950`. Primary font is **DM Sans**; monospace font is **Geist Mono**.
