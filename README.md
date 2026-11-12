# MediCore Connect 🏥

> **Production-Ready, Zero-Trust Healthcare Clinical Web Application**  
> Built with **React (Vite) + Tailwind CSS**, **Node.js + Express (Zod Validation)**, and **Supabase (PostgreSQL 15+, Row Level Security, Auth, and Encrypted Storage Buckets)**. Aligned with **HIPAA Security Rule & GDPR Healthcare Data Privacy** standards.

---

## 📑 Table of Contents
1. [Core System Architecture & Modules](#1-core-system-architecture--modules)
2. [Folder Structure](#2-folder-structure)
3. [Database Schema & PostgreSQL Security (Supabase)](#3-database-schema--postgresql-security-supabase)
4. [Row Level Security (RLS) & HIPAA Consent Policies](#4-row-level-security-rls--hipaa-consent-policies)
5. [Backend API Reference & Security Engine](#5-backend-api-reference--security-engine)
6. [Frontend Clinical Design & Interactive Dashboards](#6-frontend-clinical-design--interactive-dashboards)
7. [Environment Variable Configuration (`.env.example`)](#7-environment-variable-configuration-envexample)
8. [Setup & Deployment Guide](#8-setup--deployment-guide)
9. [Zero-Exposure Security & Compliance Verification](#9-zero-exposure-security--compliance-verification)

---

## 1. Core System Architecture & Modules

MediCore Connect implements strict **Role-Based Access Control (RBAC)** across three distinct clinical personas:

```
                                  ┌───────────────────────────┐
                                  │      MediCore Connect     │
                                  │    Zero-Trust Web App     │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
      ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
      │       PATIENT        │      │        DOCTOR        │      │        ADMIN         │
      │  (Self-Service PHI)  │      │ (Licensed Clinician) │      │ (Security & Audits)  │
      ├──────────────────────┤      ├──────────────────────┤      ├──────────────────────┤
      │ • Encrypted Sign In  │      │ • Verified Profile   │      │ • System Telemetry   │
      │ • Doctor Search      │      │ • Availability Slots │      │ • Doctor Credential  │
      │ • Conflict-Free Book │      │ • Request Queues     │      │   Verification Queue │
      │ • View Prescriptions │      │ • Patient EHR Charts │      │ • User Governance    │
      │ • Secure Vault (EHR) │      │ • Digital Rx Issuing │      │ • HIPAA Audit Trail  │
      └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
                 │                              │                              │
                 └──────────────────────┬───────┴──────────────────────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │   Express.js Backend API    │
                         │ Helmet • CORS • Rate Limits │
                         │   Zod Schema Validation     │
                         └──────────────┬──────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │  Supabase PostgreSQL (BaaS) │
                         │ Row Level Security (RLS)    │
                         │ AES-256 Storage • Audit Log │
                         └─────────────────────────────┘
```

### User Roles Breakdown:
1. **Patients:**
   - Register and manage personal health records (blood group, allergies, chronic conditions, emergency contact).
   - Search board-certified specialists with real-time slot checking.
   - Schedule virtual telehealth or in-person consultations with automated double-booking prevention.
   - View e-prescriptions with diagnostic instructions and printable Rx PDFs.
   - Deposit and manage encrypted lab records and imaging files via Supabase Storage signed URLs.
2. **Doctors (Clinicians):**
   - Manage professional credentials, medical license numbers, consultation fees, and recurring availability schedules.
   - Interactive appointment request queue: accept or decline consultations.
   - Access patient health charts and diagnostic documents **only** when an active or historical appointment exists (HIPAA consent gate).
   - Author digital e-prescriptions with structured JSONB medications (dosage, frequency, duration, precautions).
3. **Admins (Security & Clinical Governance):**
   - Platform health dashboard displaying patient volume, active appointments, and issued prescriptions.
   - Credential verification queue to vet doctor medical board licenses before public listing.
   - Real-time HIPAA audit logging tracking actor ID, action type, resource UUID, and client IP address.

---

## 2. Folder Structure

```
prompt/
├── .gitignore                          # Root ignore: strictly excludes .env, credentials, node_modules
├── README.md                           # Master architectural and deployment documentation
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Production PostgreSQL migration: tables, enums, triggers & RLS
│
├── backend/
│   ├── .env.example                    # Environment template for Node.js Express server
│   ├── .gitignore                      # Backend-specific ignore rules
│   ├── package.json                    # Backend dependencies (Express, Helmet, Cors, Zod, Supabase JS)
│   ├── server.js                       # Express server entry with Helmet, CORS, and Rate Limiters
│   └── src/
│       ├── config/
│       │   └── supabase.js             # Service role admin client & user-forwarded JWT client
│       ├── data/
│       │   └── mockStore.js            # In-memory realistic dataset for zero-config evaluation
│       ├── middleware/
│       │   ├── authMiddleware.js       # Bearer JWT token verification via Supabase Auth
│       │   ├── rbacMiddleware.js       # Role-Based Access Control gate (patient/doctor/admin)
│       │   ├── validateZod.js          # Request payload sanitizer and Zod schema validator
│       │   └── errorHandler.js         # Production-safe centralized error handler
│       ├── validators/
│       │   └── index.js                # Zod schemas (appointments, prescriptions, sync, uploads)
│       ├── controllers/
│       │   ├── authController.js       # Profile sync & authenticated user retrieval
│       │   ├── doctorController.js     # Clinician search, filtering, and schedule management
│       │   ├── appointmentController.js# Conflict checking & booking management
│       │   ├── prescriptionController.js# E-prescription authoring & retrieval
│       │   ├── documentController.js   # Storage signed upload URLs & HIPAA document access
│       │   └── adminController.js      # System telemetry, doctor verification, and audit logs
│       └── routes/
│           ├── authRoutes.js
│           ├── doctorRoutes.js
│           ├── appointmentRoutes.js
│           ├── prescriptionRoutes.js
│           ├── documentRoutes.js
│           ├── adminRoutes.js
│           └── index.js                # Unified API router mounted at /api
│
└── frontend/
    ├── .env.example                    # Frontend environment template (VITE_API_URL, VITE_SUPABASE_*)
    ├── .gitignore                      # Frontend-specific ignore rules
    ├── package.json                    # React, Vite, Tailwind CSS, Lucide Icons, Supabase JS
    ├── index.html                      # HTML5 template with Inter font and clinical metadata
    ├── vite.config.js                  # Vite bundler configuration
    ├── tailwind.config.js              # Healthcare color system (Trust Blue #0284c7, Slate, Emerald)
    ├── postcss.config.js
    └── src/
        ├── index.css                   # Custom scrollbars and Tailwind directives
        ├── main.jsx                    # React root with AuthProvider wrapper
        ├── App.jsx                     # View router: Landing vs Role Dashboards
        ├── lib/
        │   ├── supabaseClient.js       # Browser Supabase client
        │   └── api.js                  # Axios/fetch client with automatic Bearer token injection
        ├── context/
        │   └── AuthContext.jsx         # Auth state, session listener & 1-click Demo Role Switcher
        └── components/
            ├── common/
            │   ├── Navbar.jsx          # Top bar with compliance indicator & demo tester pill
            │   └── Footer.jsx          # Healthcare compliance statements and specs
            ├── auth/
            │   └── AuthModal.jsx       # Modal for login/signup with role picker & quick demo access
            ├── landing/
            │   └── LandingPage.jsx     # Trust hero, specialist directory, and HIPAA architecture
            ├── patient/
            │   ├── PatientDashboard.jsx# Appointments, prescriptions, records vault, and chart
            │   ├── BookAppointmentModal.jsx # Slot picker with conflict avoidance
            │   ├── PrescriptionDetailModal.jsx # Printable digital Rx document
            │   └── UploadDocumentModal.jsx  # Signed upload trigger for lab documents
            ├── doctor/
            │   ├── DoctorDashboard.jsx # Request queue, accepted consultations, and Rx history
            │   ├── PatientChartModal.jsx    # HIPAA-guarded patient health chart viewer
            │   └── WritePrescriptionModal.jsx # Dynamic medication repeater & Rx authoring
            └── admin/
                └── AdminDashboard.jsx  # Telemetry cards, doctor licensing queue, audit ledger
```

---

## 3. Database Schema & PostgreSQL Security (Supabase)

The database schema is fully defined in [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).

### Relational Tables Summary:
| Table Name | Description | Key Columns | Security & RLS Model |
| :--- | :--- | :--- | :--- |
| `profiles` | Extends `auth.users` | `id`, `role`, `full_name`, `phone`, `is_active` | Users view own; Public views verified doctors; Admins view all |
| `doctors` | Professional credentials | `id`, `specialization`, `license_number`, `is_verified`, `availability_schedule` | Public reads verified doctors; Doctors edit own; Admin verifies |
| `patients` | Protected Health Info (PHI) | `id`, `blood_group`, `allergies`, `chronic_conditions`, `medical_history_summary` | Patient reads/writes own; Doctor reads **only** if appointment exists |
| `appointments` | Clinical encounters | `id`, `patient_id`, `doctor_id`, `appointment_date`, `status`, `consultation_type` | Patient/Doctor view shared; Unique index prevents double bookings |
| `prescriptions` | Digital e-prescriptions | `id`, `appointment_id`, `doctor_id`, `patient_id`, `diagnosis`, `medications` (JSONB) | Patient reads own; Doctor reads authored; Doctor inserts for appointment |
| `medical_documents`| Medical records / lab PDFs | `id`, `patient_id`, `file_name`, `storage_path`, `file_url`, `file_type` | Patient manages own; Doctor reads **only** if appointment exists |
| `audit_logs` | HIPAA immutable access log | `id`, `actor_id`, `actor_role`, `action`, `resource_type`, `ip_address`, `details` | Append-only inserts; Read-only restricted to `admin` |

---

## 4. Row Level Security (RLS) & HIPAA Consent Policies

In compliance with HIPAA Security Rule 45 CFR § 164.312(a)(1) (Access Controls), access to sensitive health information is barred at the PostgreSQL storage engine level:

```sql
-- Helper function to establish clinical consent
CREATE OR REPLACE FUNCTION public.doctor_has_appointment_with_patient(p_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = auth.uid()
          AND patient_id = p_id
          AND status IN ('pending', 'confirmed', 'completed')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Doctors can ONLY read patient records if an appointment exists between them
CREATE POLICY "Doctors view patients with clinical relationship"
    ON public.patients FOR SELECT
    USING (
        public.is_doctor() AND public.doctor_has_appointment_with_patient(id)
    );

-- Doctors can ONLY view patient lab documents if an appointment exists
CREATE POLICY "Doctors view documents with clinical relationship"
    ON public.medical_documents FOR SELECT
    USING (
        public.is_doctor() AND public.doctor_has_appointment_with_patient(patient_id)
    );
```

---

## 5. Backend API Reference & Security Engine

The Express.js backend runs on port 5000 and applies:
- **Helmet**: Disables MIME sniffing, clickjacking (`frameguard`), enforces HSTS (`Strict-Transport-Security: max-age=31536000`), and CSP.
- **CORS**: Enforces whitelisted origins (`FRONTEND_URL` and `localhost`).
- **Rate-Limiting**:
  - General API: 200 requests per 15-minute window.
  - Auth Endpoints: 30 requests per 15-minute window (brute-force defense).
- **Zod Input Sanitization**: All request bodies, parameters, and query strings are parsed through strict schemas before hitting controllers.

### Core Endpoints:
| Method | Route | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status, compliance indicators, and security headers |
| `POST`| `/api/auth/sync` | Public / Webhook | Syncs newly registered Supabase auth user to public `profiles` |
| `GET` | `/api/auth/me` | Bearer Token | Fetches current user profile and role-specific health/credential data |
| `GET` | `/api/doctors` | Public | Search/filter doctors by specialization, name, or verification status |
| `GET` | `/api/doctors/:id`| Public | Retrieve clinician schedule and profile |
| `PUT` | `/api/doctors/:id/schedule` | Doctor / Admin | Updates weekly availability slots |
| `GET` | `/api/appointments` | Authenticated | Lists role-scoped appointments (Patient sees own; Doctor sees assigned) |
| `POST`| `/api/appointments` | Patient / Admin | Books consultation with instant doctor slot conflict validation |
| `PATCH`| `/api/appointments/:id/status` | Doctor / Patient | Confirm, complete, or cancel appointment (doctor or patient scoped) |
| `GET` | `/api/prescriptions`| Authenticated | Retrieves role-scoped digital prescriptions |
| `POST`| `/api/prescriptions`| Doctor / Admin | Doctor issues digital Rx linked to verified appointment |
| `GET` | `/api/documents` | Authenticated | Fetches patient lab documents (enforces HIPAA relationship check) |
| `POST`| `/api/documents/upload` | Patient / Admin | Generates signed upload URL for secure Supabase Storage bucket |
| `GET` | `/api/admin/stats` | Admin | Retrieves system-wide patient, doctor, and consultation telemetry |
| `PATCH`| `/api/admin/doctors/:id/verify` | Admin | Approves or rejects doctor medical board license |
| `GET` | `/api/admin/audit-logs` | Admin | Inspects HIPAA compliance access logs and IP trails |

---

## 6. Frontend Clinical Design & Interactive Dashboards

The frontend features a healthcare color system:
- **Primary Trust Blue (`#0284c7` / `medicore-600`)**: Conveys clinical authority and calm confidence.
- **Clinical Emerald (`#10b981`)**: Highlights verified licenses, confirmed slots, and signed prescriptions.
- **Surface White (`#ffffff`) & Soft Canvas (`#f8fafc`)**: Maximizes readability and reduces cognitive fatigue for clinicians.

### Interactive Features Built-In:
- **One-Click Demo Role Switcher**: Located in the top navigation ribbon, allowing reviewers and developers to seamlessly toggle between **Patient**, **Doctor**, and **Admin** workspaces without creating separate email accounts.
- **Dynamic Prescription Authoring Modal**: Doctors can dynamically append and remove medication items (drug, dosage, frequency, duration, instructions), sign electronically, and mark the consultation completed in real time.
- **Printable E-Prescription Viewer**: Formatted like an official prescription pad with electronic security seals and browser print/PDF export.

---

## 7. Environment Variable Configuration (`.env.example`)

### Backend (`backend/.env.example`):
```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# Supabase API Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Client Origins for CORS
FRONTEND_URL=http://localhost:5173

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX_REQUESTS=30
```

### Frontend (`frontend/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 8. Setup & Deployment Guide

### Prerequisites:
- Node.js (v18.0.0 or higher)
- npm or pnpm
- Supabase project (Free tier or self-hosted)

### Step 1: Database Migration
1. Navigate to your **Supabase Dashboard** -> **SQL Editor**.
2. Open [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql).
3. Paste the contents into the SQL Editor and click **Run**.
4. Create the private storage bucket:
   - Go to **Storage** -> **New Bucket**.
   - Name: `medical-documents`.
   - Access: **Private** (Disable public bucket).

### Step 2: Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

npm install
npm run dev
# Backend starts on http://localhost:5000
```

### Step 3: Frontend Setup
```bash
cd ../frontend
cp .env.example .env
# Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm install
npm run dev
# Frontend starts on http://localhost:5173
```

---

## 9. Zero-Exposure Security & Compliance Verification

To ensure that confidential credentials and API keys are never published or leaked:
1. `.env` and `*.env` patterns are explicitly blacklisted in root `.gitignore`, `backend/.gitignore`, and `frontend/.gitignore`.
2. Only `.env.example` templates containing sanitized placeholder values are tracked in version control.
3. Supabase `SERVICE_ROLE_KEY` is restricted exclusively to the Express backend and is never packaged or referenced by the Vite frontend client.
4. All client-side requests forward user Bearer JWTs to maintain database-level Row Level Security enforcement.

---

### 🛡️ License & Compliance
This software architecture is designed in accordance with the Health Insurance Portability and Accountability Act (HIPAA) of 1996 and General Data Protection Regulation (GDPR). Developed for clinical demonstrations and enterprise healthcare solutions.
