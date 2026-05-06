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
  - `/triage` — AI-assisted Manchester Triage System (MTS) multi-step form (nurses)

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
- `usePatientConsultations(patientId)`, `useCreateConsultation`, `useAddDiagnosis`, `useAddPrescription` (POST `/consultations/{id}/treatments`), `useUpdateTreatment` (PATCH `/consultations/{id}/treatments/{treatmentId}/prescriptions/{prescriptionId}` — patches a single prescription), `usePrescriptionHistory(consultationId, treatmentId, prescriptionId, enabled)` (GET `/consultations/{id}/treatments/{treatmentId}/prescriptions/{prescriptionId}/history`)
- `usePatientChecklists(patientId)`, `useCreateChecklist`, `useToggleChecklistItem`
- `useDrugs`, `useAuth`

Triage state is managed by **Zustand** (`store/triageStore.ts`) with `persist` middleware (localStorage key `medidash-triage-session`). No TanStack Query hooks — triage is a stateful multi-step form that submits once via `POST /triage`.

`context/QueryProvider.tsx` configures the global `QueryClient` with `staleTime: 2 min` and `retry: 1`.

### Form validation

`PatientForm` uses **React Hook Form** + **Zod** via `@hookform/resolvers/zod`. The schema lives in `lib/schemas/patient.schema.ts` and exports `patientSchema` and `PatientFormData`. Fields: `full_name`, `age`, `gender` (`M`/`F`/`X`), `weight_kg`, `height_cm`, `glasgow_score`.

### UI

Custom primitives live in `components/ui/` (Button, Card, Input, Badge). Feature components under `components/patients/`, `components/drugs/`, `components/checklists/`, and `components/layout/` consume them. The app is dark-only (`html` has `class="dark"`, body has `bg-gray-950`).

`lib/utils.ts` provides: `cn` (class concatenation), `getBMIColor(category)`, `getGlasgowColor(score)`.

### Triage module

The triage feature lives in `app/(dashboard)/triage/`, `components/triage/`, and `store/`. It implements the **Manchester Triage System (MTS)** as a 5-step guided form:

| Step | Section | Key data |
|------|---------|----------|
| 1 | Patient | `fullName`, `birthDate`, `biologicalSex`, `arrivalTime` (auto) |
| 2 | Chief complaint | free text + `MTSCategory` (AI-suggested, nurse-confirmed) |
| 3 | Vitals | HR, RR, BP, temp, SpO₂, pain scale, Glasgow (ocular/verbal/motor) |
| 4 | AI Assessment | MTS discriminators → `TriageColor` (AI recommended, nurse final) |
| 5 | Outcome | `destination` (`waiting_room` / `census`), notes, badge |

**State** — `store/triageStore.ts` (Zustand + `persist`). Selectors exported: `selectPatient`, `selectComplaint`, `selectVitals`, `selectAssessment`, `selectOutcome`, `selectCurrentStep`, `selectSubmit`.

**Validation** — `store/triageSchemas.ts` (Zod schemas per step, `STEP_SCHEMAS[i]`). `store/triageValidators.ts` exposes `isStepValid(step, data)` and `areAllPreviousStepsValid(upToStep, data)`.

**Types** — `types/TriageTypes.ts`: `TriageColor`, `MTS_COLOR_META`, `MTSCategory`, `MTS_CATEGORY_LABELS`, `BiologicalSex`, `PatientInfo`, `ChiefComplaint`, `Vitals`, `VITAL_RANGES`, `getVitalStatus`, `MTSDiscriminator`, `Assessment`, `Outcome`, `TriageFormData`, `INITIAL_FORM_DATA`, `AITriageSuggestRequest/Response`, `TriageSubmitRequest/Response`.

**Components** — `components/triage/`:
- `TriageStepper` — visual progress bar + step nodes (click to jump to reachable steps)
- `StepNavigation` — Back / Continue / Submit with disabled state
- `ElapsedTimer` — live HH:MM:SS since `arrivalTime`; color shifts amber at 10 min, red + pulse at 30 min
- `SavedSessionModal` — shown on mount when localStorage has a partial session
- `SubmitSuccessTriage` — post-submit success screen with triage ID

Step content components (`StepPatientInfo`, `StepChiefComplaint`, etc.) are not yet built; their import stubs are commented out in `page.tsx`.

### Types

`types/index.ts` is the single source of truth for shared types: `Role`, `User`, `AuthTokens`, `Patient`, `Drug`, `InteractionResult`, `Checklist`, `ChecklistItem`, `RouteOfAdministration`, `Diagnosis`, `Prescription`, `Treatment`, `Consultation`.

`Patient` includes server-computed fields: `bmi`, `bmi_category`, `glasgow_interpretation`, `created_at`.

Prescription model: prescriptions belong to a `Treatment` (not directly to a consultation). Each consultation has `treatments: Treatment[]`; only one treatment has `is_active: true` at a time. `ConsultationCard` renders the active treatment and a collapsed history of previous ones (toggled via `showHistory` state). Doctors can add a new treatment or edit the active one via `AddPrescriptionForm` (mode toggled via `rxFormMode` state: `null | "new" | "edit"`).

`Prescription` includes versioning fields: `is_active`, `superseded_at`, `superseded_by`, `original_id`. When `original_id !== null` the prescription has been edited; `PrescriptionItem` renders a "View edits" button that fetches and displays the previous versions inline using `usePrescriptionHistory`. Each prescription in the active treatment is rendered via `PrescriptionItem` (`components/consultations/PrescriptionItem.tsx`).

### Environment

`NEXT_PUBLIC_API_URL` — backend base URL (defaults to `http://localhost:8000`).
