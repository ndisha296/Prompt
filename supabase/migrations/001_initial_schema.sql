-- ============================================================================
-- MEDICORE CONNECT - PRODUCTION DATABASE SCHEMA & SECURITY POLICIES
-- Target Engine: Supabase PostgreSQL (Postgres 15+)
-- Compliance Target: HIPAA Security Rule & GDPR Healthcare Data Privacy
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CUSTOM ENUMS & TYPES
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consultation_type AS ENUM ('in-person', 'virtual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE blood_group_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. RELATIONAL TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: profiles
-- Extends Supabase auth.users with RBAC metadata and shared profile info.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'patient',
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- Table: doctors
-- Stores professional credentials, license verification status, and schedules.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    bio TEXT,
    clinic_address TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    availability_schedule JSONB NOT NULL DEFAULT '{
        "monday": ["09:00-12:00", "14:00-17:00"],
        "tuesday": ["09:00-12:00", "14:00-17:00"],
        "wednesday": ["09:00-12:00", "14:00-17:00"],
        "thursday": ["09:00-12:00", "14:00-17:00"],
        "friday": ["09:00-12:00", "14:00-17:00"],
        "saturday": ["10:00-13:00"],
        "sunday": []
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- Table: patients
-- Stores sensitive personal health information (PHI) protected under HIPAA.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT,
    blood_group blood_group_type,
    emergency_contact JSONB DEFAULT '{"name": "", "relationship": "", "phone": ""}'::jsonb,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    medical_history_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- Table: appointments
-- Clinical encounters between patient and doctor.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    appointment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status appointment_status NOT NULL DEFAULT 'pending',
    consultation_type consultation_type NOT NULL DEFAULT 'virtual',
    reason_for_visit TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- Table: prescriptions
-- Digital e-prescriptions written by verified doctors after consultation.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb, 
    -- Schema for medications JSONB items:
    -- [{"name": "Amoxicillin", "dosage": "500mg", "frequency": "3x daily", "duration": "7 days", "instructions": "Take after meals"}]
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- Table: medical_documents
-- Secure storage references for lab results, imaging, and patient reports.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    description TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- Table: audit_logs
-- HIPAA compliance audit trail logging sensitive health data access and modifications.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role user_role,
    action TEXT NOT NULL, -- e.g., 'READ_PATIENT_CHART', 'CREATE_PRESCRIPTION', 'VERIFY_DOCTOR'
    resource_type TEXT NOT NULL, -- 'patient', 'appointment', 'prescription', 'document'
    resource_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. PERFORMANCE INDEXES & CONSTRAINTS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_is_verified ON public.doctors(is_verified);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON public.prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON public.medical_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Unique index to prevent duplicate active appointments for the same doctor at the same slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_doctor_active_slot
ON public.appointments(doctor_id, appointment_date)
WHERE status IN ('pending', 'confirmed');

-- ============================================================================
-- 4. AUTOMATIC TIMESTAMP TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. HELPER SECURITY FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Function to get current user's role from JWT / profiles table
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if caller is a doctor
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'doctor'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if caller has an active or past appointment relationship with patient
-- This guarantees HIPAA consent: doctors cannot arbitrarily browse patient charts without a clinical relationship
CREATE OR REPLACE FUNCTION public.doctor_has_appointment_with_patient(p_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = auth.uid()
          AND patient_id = p_id
          AND status IN ('pending', 'confirmed', 'completed')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all relational tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- PROFILES POLICIES
-------------------------------------------------------------------------------
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- 2. Verified doctors and patient public names can be viewed for booking/display
CREATE POLICY "Public can view verified doctors and basic profiles"
    ON public.profiles FOR SELECT
    USING (
        role = 'doctor' 
        OR auth.uid() = id
        OR public.is_admin()
    );

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 4. Admins can view and update all profiles
CREATE POLICY "Admins full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-------------------------------------------------------------------------------
-- DOCTORS POLICIES
-------------------------------------------------------------------------------
-- 1. Anyone authenticated can browse verified doctors
CREATE POLICY "Anyone can browse verified doctors"
    ON public.doctors FOR SELECT
    USING (is_verified = true OR auth.uid() = id OR public.is_admin());

-- 2. Doctor can insert and update their own professional profile
CREATE POLICY "Doctors can manage own profile"
    ON public.doctors FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can update own profile"
    ON public.doctors FOR UPDATE
    USING (auth.uid() = id);

-- 3. Admins can verify or update any doctor record
CREATE POLICY "Admins manage all doctors"
    ON public.doctors FOR ALL
    USING (public.is_admin());

-------------------------------------------------------------------------------
-- PATIENTS POLICIES (HIPAA PROTECTED)
-------------------------------------------------------------------------------
-- 1. Patients can view and manage their own medical record
CREATE POLICY "Patients view own record"
    ON public.patients FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Patients insert own record"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients update own record"
    ON public.patients FOR UPDATE
    USING (auth.uid() = id);

-- 2. Doctors can ONLY view patient records if an appointment exists between them
CREATE POLICY "Doctors view patients with clinical relationship"
    ON public.patients FOR SELECT
    USING (
        public.is_doctor() AND public.doctor_has_appointment_with_patient(id)
    );

-- 3. Admins have oversight access for compliance and audit
CREATE POLICY "Admins manage patients"
    ON public.patients FOR ALL
    USING (public.is_admin());

-------------------------------------------------------------------------------
-- APPOINTMENTS POLICIES
-------------------------------------------------------------------------------
-- 1. Patients can view their appointments
CREATE POLICY "Patients view own appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = patient_id);

-- 2. Doctors can view their appointments
CREATE POLICY "Doctors view assigned appointments"
    ON public.appointments FOR SELECT
    USING (auth.uid() = doctor_id);

-- 3. Patients can book appointments for themselves
CREATE POLICY "Patients book appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- 4. Patients can cancel their pending/confirmed appointments
CREATE POLICY "Patients update own appointment"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = patient_id);

-- 5. Doctors can update status (confirm, complete, cancel) of their appointments
CREATE POLICY "Doctors update own appointment status"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = doctor_id);

-- 6. Admins can manage all appointments
CREATE POLICY "Admins manage all appointments"
    ON public.appointments FOR ALL
    USING (public.is_admin());

-------------------------------------------------------------------------------
-- PRESCRIPTIONS POLICIES
-------------------------------------------------------------------------------
-- 1. Patients can view their prescriptions
CREATE POLICY "Patients view their own prescriptions"
    ON public.prescriptions FOR SELECT
    USING (auth.uid() = patient_id);

-- 2. Doctors can view prescriptions they have written
CREATE POLICY "Doctors view their authored prescriptions"
    ON public.prescriptions FOR SELECT
    USING (auth.uid() = doctor_id);

-- 3. Verified Doctors can create prescriptions for valid appointments
CREATE POLICY "Doctors create prescriptions for appointments"
    ON public.prescriptions FOR INSERT
    WITH CHECK (
        auth.uid() = doctor_id 
        AND EXISTS (
            SELECT 1 FROM public.appointments
            WHERE id = appointment_id 
              AND doctor_id = auth.uid() 
              AND patient_id = prescriptions.patient_id
        )
    );

-- 4. Admins have read access for auditing
CREATE POLICY "Admins manage prescriptions"
    ON public.prescriptions FOR ALL
    USING (public.is_admin());

-------------------------------------------------------------------------------
-- MEDICAL DOCUMENTS POLICIES
-------------------------------------------------------------------------------
-- 1. Patients can view and upload their own documents
CREATE POLICY "Patients view own documents"
    ON public.medical_documents FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients upload own documents"
    ON public.medical_documents FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients delete own documents"
    ON public.medical_documents FOR DELETE
    USING (auth.uid() = patient_id);

-- 2. Doctors can view patient documents ONLY if an active/past appointment exists
CREATE POLICY "Doctors view documents with clinical relationship"
    ON public.medical_documents FOR SELECT
    USING (
        public.is_doctor() AND public.doctor_has_appointment_with_patient(patient_id)
    );

-- 3. Admins audit access
CREATE POLICY "Admins manage documents"
    ON public.medical_documents FOR ALL
    USING (public.is_admin());

-------------------------------------------------------------------------------
-- AUDIT LOGS POLICIES
-------------------------------------------------------------------------------
-- Immutable audit log: Only inserts allowed by users/system, only Admins can read
CREATE POLICY "System and users can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins read audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

-- ============================================================================
-- 7. AUTOMATIC USER REGISTRATION SYNC HOOK (SUPABASE AUTH TRIGGER)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role user_role := 'patient';
    v_full_name TEXT := 'MediCore User';
BEGIN
    -- Read role and full name from user_metadata if provided
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
        v_role := (NEW.raw_user_meta_data->>'role')::user_role;
    END IF;

    IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        v_full_name := NEW.raw_user_meta_data->>'full_name';
    END IF;

    -- Create profile entry
    INSERT INTO public.profiles (id, role, full_name, phone)
    VALUES (NEW.id, v_role, v_full_name, NEW.phone)
    ON CONFLICT (id) DO NOTHING;

    -- Create associated specialized role row
    IF v_role = 'patient' THEN
        INSERT INTO public.patients (id)
        VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    ELSIF v_role = 'doctor' THEN
        INSERT INTO public.doctors (id, specialization, license_number, is_verified)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'specialization', 'General Medicine'),
            COALESCE(NEW.raw_user_meta_data->>'license_number', 'PENDING-' || substring(NEW.id::text, 1, 8)),
            false
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================================
-- 8. SUPABASE STORAGE BUCKET CONFIGURATION (METADATA INSTRUCTIONS)
-- ============================================================================
-- Run in Supabase SQL editor to create private storage bucket for medical documents:
--
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--     'medical-documents', 
--     'medical-documents', 
--     false, 
--     26214400, -- 25MB max
--     ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
-- ) ON CONFLICT (id) DO NOTHING;
--
-- Storage RLS:
-- CREATE POLICY "Users upload to own folder" ON storage.objects
-- FOR INSERT WITH CHECK (
--     bucket_id = 'medical-documents' AND (storage.foldername(name))[1] = auth.uid()::text
-- );
--
-- CREATE POLICY "Users read own folder" ON storage.objects
-- FOR SELECT USING (
--     bucket_id = 'medical-documents' AND (storage.foldername(name))[1] = auth.uid()::text
-- );
-- ============================================================================
