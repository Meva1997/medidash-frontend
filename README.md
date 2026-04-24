# MediDash

> Clinical dashboard for doctors and nurses — manage patients, check drug interactions, and track surgical checklists in one place.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

**Live Demo:** [medidash.vercel.app](https://medidash.vercel.app) · **API Docs:** [medidash-api.onrender.com/docs](https://medidash-api.onrender.com/docs)

---

## Overview

MediDash is a full-stack medical dashboard built for clinical staff. It enforces role-based access control between doctors and nurses, computes patient risk scores in real time, and flags dangerous drug combinations before they reach a patient.

The project was designed to reflect real clinical workflows — not a generic CRUD app with a medical theme.

---

## Features

### Authentication & Roles
- JWT-based auth with `doctor` and `nurse` roles
- Nurses are restricted to vitals-only updates (weight, height, Glasgow score)
- Doctors have full patient management access
- Protected routes enforced at both middleware and API level

### Patient Management
- Full patient CRUD with clinical range validation (age, weight, height, GCS)
- Real-time BMI calculation and categorization
- Glasgow Coma Scale interpretation on every patient profile
- Name sanitization supporting Spanish characters

### Drug Interaction Checker
- Search across the full drug catalog
- Pairwise interaction detection across any combination of drugs
- Severity-level alerts with clinical descriptions
- Deduplication of symmetric drug pairs (A→B checked once)

### Surgical Checklists
- Doctor-initiated checklists pre-populated with 10 WHO surgical safety steps
- Item-level completion tracking with timestamps
- Per-patient checklist history

---

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Data Fetching | TanStack Query |
| Auth State | React Context + js-cookie |

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
git clone https://github.com/your-username/medidash-frontend
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
git clone https://github.com/your-username/medidash-backend
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
│   ├── (auth)/login/          # Login page
│   └── (dashboard)/           # Protected layout with sidebar
│       ├── patients/          # Patient census + individual profiles
│       ├── drugs/             # Drug interaction checker
│       └── checklists/[id]/   # Surgical checklist view
├── components/
│   ├── ui/                    # Base components (Button, Badge, Card, Input)
│   ├── layout/                # Sidebar, TopBar
│   ├── patients/              # PatientTable, PatientForm
│   ├── drugs/                 # InteractionChecker
│   └── checklists/            # ChecklistPanel
├── hooks/                     # TanStack Query hooks per domain
├── lib/                       # Axios client, utilities
├── context/                   # AuthContext, QueryProvider
└── types/                     # Shared TypeScript interfaces
```

---

## Author

**Alex** — Junior Full Stack Developer  
[GitHub](https://github.com/your-username) · [LinkedIn](https://linkedin.com/in/your-profile)

---

## License

MIT