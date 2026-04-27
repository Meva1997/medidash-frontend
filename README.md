# MediDash

> Clinical dashboard for doctors and nurses — manage patients, record consultations, check drug interactions, and track surgical checklists in one place.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

**Live Demo:** [medidash.vercel.app](https://medidash.vercel.app) · **API Docs:** [medidash-api.onrender.com/docs](https://medidash-api.onrender.com/docs)

---

## Overview

MediDash is a full-stack medical dashboard built for clinical staff. It enforces role-based access control between doctors and nurses, computes patient risk scores in real time, flags dangerous drug combinations before they reach a patient, and keeps a full consultation history — including diagnoses and prescriptions — per patient.

The project was designed to reflect real clinical workflows — not a generic CRUD app with a medical theme.

---

## Features

### Authentication & Roles
- JWT-based auth with `doctor` and `nurse` roles assigned server-side
- Cookie-based token storage via `js-cookie`; user object (including `full_name`) persisted in `localStorage`
- Route guarding via `proxy.ts`: unauthenticated users redirected to `/login`, authenticated users away from it
- Sidebar footer displays the logged-in user's full name and email
- Doctors have full patient management, consultation creation, and checklist creation; nurses can toggle checklist items only

### Patient Management
- Patient list with live search, role-gated "Admit patient" button, and delete with confirmation dialog
- Admit/edit form built with **React Hook Form + Zod** (`lib/schemas/patient.schema.ts`): validates `full_name`, `age`, `gender` (`M`/`F`/`X`), `weight_kg`, `height_cm`, `glasgow_score`
- Doctors can edit existing patient records via an "Edit patient" modal on the patient detail page (`PUT /patients/{id}`)
- `PatientProfile` component: server-computed BMI (with color-coded category) and Glasgow Coma Scale interpretation inline on the detail page

### Consultations
- Full consultation history per patient, embedded on the patient detail page
- Doctors can open a new consultation with a chief complaint and optional clinical notes
- Each consultation supports expandable cards showing active **diagnoses** and **prescriptions**
- Doctors can add diagnoses and prescriptions directly from the consultation card
- Prescription fields: medication name, dose, frequency, duration, route of administration (oral, IV, IM, subcutaneous, topical, inhalation, sublingual, rectal, ophthalmic, otic), and optional instructions
- Nurses have read-only access to consultation history

### Drug Interaction Checker
- Search across the full drug catalog
- Pairwise interaction detection across any combination of drugs
- Severity-level alerts with clinical descriptions
- Deduplication of symmetric drug pairs (A→B checked once)

### Surgical Checklists
- Doctor-initiated checklists pre-populated with 10 WHO surgical safety steps
- Item-level completion tracking with timestamps
- Per-patient checklist history embedded on patient detail

---

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | TailwindCSS v4 |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form v7 + Zod v4 |
| HTTP | Axios |
| Auth State | React Context + js-cookie (SSR-safe via `useEffect`) |

### Backend
| | |
|---|---|
| Framework | FastAPI |
| Language | Python 3.11 |
| ORM | SQLAlchemy (sync) |
| Migrations | Alembic |
| Auth | JWT (python-jose) + bcrypt |
| Database | PostgreSQL |

### Infrastructure
| | |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Render PostgreSQL |

---

## API Overview

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/auth/register` | — | — |
| POST | `/auth/login` | — | — |
| GET | `/patients/` | JWT | any |
| POST | `/patients/` | JWT | doctor |
| PUT | `/patients/{id}` | JWT | doctor / nurse* |
| DELETE | `/patients/{id}` | JWT | doctor |
| GET | `/patients/{id}/consultations` | JWT | any |
| POST | `/patients/{id}/consultations` | JWT | doctor |
| POST | `/{consultation_id}/diagnoses` | JWT | doctor |
| POST | `/{consultation_id}/prescriptions` | JWT | doctor |
| GET | `/drugs/` | JWT | any |
| POST | `/drugs/interactions` | JWT | any |
| POST | `/checklists/` | JWT | doctor |
| PATCH | `/checklists/{id}/items/{item_id}` | JWT | any |

*Nurses restricted to weight, height, and Glasgow score fields.

Full interactive docs available at the API URL above.

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL

### Frontend

```bash
git clone https://github.com/Meva1997/medidash-frontend
cd medidash-frontend
npm install
cp .env.example .env.local
npm run dev
```

**.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend

```bash
git clone https://github.com/Meva1997/medidash-backend
cd medidash-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

**.env**
```
DATABASE_URL=postgresql://user@localhost:5432/medidash
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Project Structure

```
medidash-frontend/
├── app/
│   ├── (auth)/login/          # Login page (JWT form, role assigned server-side)
│   └── (dashboard)/           # Protected layout (Sidebar only)
│       ├── patients/          # Patient census + admit modal
│       ├── patients/[id]/     # Patient detail: stats + consultations + checklists
│       └── drugs/             # Drug interaction checker
├── components/
│   ├── ui/                    # Button, Badge, Card, Input, ConfirmDialog
│   ├── layout/                # Sidebar (role-aware nav, full name display, logout)
│   ├── patients/              # PatientTable, PatientForm, PatientProfile
│   ├── consultations/         # ConsultationsPanel (new consultation, diagnoses, prescriptions)
│   ├── drugs/                 # InteractionChecker
│   └── checklists/            # ChecklistPanel (embedded in PatientProfile)
├── hooks/                     # TanStack Query hooks
│   ├── usePatients.ts         # usePatients, usePatient, useDeletePatient
│   ├── useConsultations.ts    # usePatientConsultations, useCreateConsultation, useAddDiagnosis, useAddPrescription
│   ├── useChecklists.ts       # usePatientChecklists, useCreateChecklist, useToggleChecklistItem
│   └── useDrugs.ts            # useDrugs
├── lib/
│   ├── api.ts                 # Axios instance (auto-redirect on 401)
│   ├── schemas/               # Zod schemas (patient.schema.ts)
│   └── utils.ts               # cn, getBMIColor, getGlasgowColor
├── context/                   # AuthContext, QueryProvider
├── proxy.ts                   # Route guard (replaces middleware.ts)
└── types/                     # Shared TypeScript interfaces (User, Patient, Consultation, Diagnosis, Prescription…)
```

---

## Author

**Alex** — Junior Full Stack Developer  
[GitHub](https://github.com/Meva1997) · [LinkedIn](https://www.linkedin.com/in/alex-fullstack-developer/)

---

## License

MIT
