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

MediDash is a clinical dashboard for medical staff (doctors/nurses). It uses **Next.js 16** with the App Router, **React 19**, **TanStack Query v5**, **Axios**, **React Hook Form**, **Zod**, and **Tailwind CSS v4**.

### Route groups

- `app/(auth)/login` — unauthenticated login page
- `app/(dashboard)/` — protected shell with `Sidebar`-only layout (no TopBar)
  - `/patients` — patient list with search and modal admit form (doctors only)
  - `/patients/[id]` — patient detail: clinical stats + inline surgical checklists
  - `/drugs` — drug interaction checker
  - `/checklists/[id]` — standalone checklist page (also embedded in patient detail)

`app/page.tsx` immediately redirects to `/login`.

### Auth & routing

Auth state is managed client-side in `context/AuthContext.tsx`. Uses `js-cookie` to manage the `access_token` cookie. The `User` object is persisted in `localStorage`.

- `proxy.ts` (untracked, replaces deleted `middleware.ts`) guards every non-static route: redirects unauthenticated users to `/login` and authenticated users away from `/login`.
- `lib/api.ts` is a pre-configured Axios instance that reads the cookie on each request and redirects to `/login` on a 401.
- `context/AuthContext.tsx` exposes `user`, `token`, `login`, `logout`, `isAuthenticated`. Also exports `useAuth` directly (no separate `hooks/useAuth.ts` needed).

### Role-based access

`user.role` is `"doctor"` or `"nurse"`. Doctors see the "Admit patient" button on `/patients` and the "New checklist" button on patient detail. Nurses can toggle checklist items but cannot admit patients or create checklists.

### Data fetching

All server communication goes through `lib/api.ts`. Feature-specific hooks in `hooks/` wrap TanStack Query:

- `usePatients` — list; `usePatient(id)` — single; `useDeletePatient` — delete
- `usePatientConsultations(patientId)`, `useCreateConsultation`, `useAddDiagnosis`, `useAddPrescription` (POST `/consultations/{id}/treatments`), `useUpdateTreatment` (PATCH `/consultations/{id}/treatments/{treatmentId}`)
- `usePatientChecklists(patientId)`, `useCreateChecklist`, `useToggleChecklistItem`
- `useDrugs`, `useAuth`

`context/QueryProvider.tsx` configures the global `QueryClient` with `staleTime: 2 min` and `retry: 1`.

### Form validation

`PatientForm` uses **React Hook Form** + **Zod** via `@hookform/resolvers/zod`. The schema lives in `lib/schemas/patient.schema.ts` and exports `patientSchema` and `PatientFormData`. Fields: `full_name`, `age`, `gender` (`M`/`F`/`X`), `weight_kg`, `height_cm`, `glasgow_score`.

### UI

Custom primitives live in `components/ui/` (Button, Card, Input, Badge). Feature components under `components/patients/`, `components/drugs/`, `components/checklists/`, and `components/layout/` consume them. The app is dark-only (`html` has `class="dark"`, body has `bg-gray-950`).

`lib/utils.ts` provides: `cn` (class concatenation), `getBMIColor(category)`, `getGlasgowColor(score)`.

### Types

`types/index.ts` is the single source of truth for shared types: `Role`, `User`, `AuthTokens`, `Patient`, `Drug`, `InteractionResult`, `Checklist`, `ChecklistItem`, `RouteOfAdministration`, `Diagnosis`, `Prescription`, `Treatment`, `Consultation`.

`Patient` includes server-computed fields: `bmi`, `bmi_category`, `glasgow_interpretation`, `created_at`.

Prescription model: prescriptions belong to a `Treatment` (not directly to a consultation). Each consultation has `treatments: Treatment[]`; only one treatment has `is_active: true` at a time. `ConsultationCard` renders the active treatment and a collapsed history of previous ones. Doctors can add a new treatment or edit the active one via `AddPrescriptionForm` (mode toggled via `rxFormMode` state: `null | "new" | "edit"`).

### Environment

`NEXT_PUBLIC_API_URL` — backend base URL (defaults to `http://localhost:8000`).
