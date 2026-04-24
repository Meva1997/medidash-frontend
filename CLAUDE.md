# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

MediDash is a clinical dashboard for medical staff (doctors/nurses). It uses **Next.js 16** with the App Router, **React 19**, **TanStack Query v5**, **Axios**, and **Tailwind CSS v4**.

### Route groups

- `app/(auth)/login` — unauthenticated login page
- `app/(dashboard)/` — protected shell with `Sidebar` + `TopBar` layout
  - `/patients` — patient list; `/patients/[id]` — patient detail
  - `/drugs` — drug interaction checker
  - `/checklists/[id]` — per-patient checklist

`app/page.tsx` immediately redirects to `/login`.

### Auth & routing

Auth state is managed client-side in `context/AuthContext.tsx`. The `access_token` cookie is the source of truth for both the middleware and the axios interceptor:

- `middleware.ts` guards every non-static route: redirects unauthenticated users to `/login` and authenticated users away from `/login`.
- `lib/api.ts` is a pre-configured Axios instance that reads the cookie on each request and redirects to `/login` on a 401.
- `context/AuthContext.tsx` additionally stores the `User` object in `localStorage` and exposes `login` / `logout` helpers.

### Data fetching

All server communication goes through `lib/api.ts`. Feature-specific hooks in `hooks/` wrap TanStack Query (`usePatients`, `useDrugs`, `useChecklists`, `useAuth`). `context/QueryProvider.tsx` configures the global `QueryClient` with `staleTime: 2 min` and `retry: 1`.

### UI

Custom primitives live in `components/ui/` (Button, Card, Input, Badge). Feature components under `components/patients/`, `components/drugs/`, `components/checklists/`, and `components/layout/` consume them. The app is dark-only (`html` has `class="dark"`, body has `bg-gray-950`).

### Types

`types/index.ts` is the single source of truth for shared types: `User`, `Patient`, `Drug`, `InteractionResult`, `Checklist`, `ChecklistItem`.

### Environment

`NEXT_PUBLIC_API_URL` — backend base URL (defaults to `http://localhost:8000`).
