-- ====================================================================
-- InterTrack System Architecture — Phase 0 Migration DDL (Production Security v3)
-- Target Supabase Project: jseihmoupjkrptuwydyo
-- Description: Complete 24-Table Schema, Relational Integrity, Private Buckets,
--              Idempotent Policies, Secure Search-Path Functions, RPC QR Verification
--              & Strict Role-Scoped CRUD Policies
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ENUM TYPES
-- --------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE external_cert_processing_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE external_cert_verification_mode AS ENUM ('INTERNAL_INTERNSHIP', 'EXTERNAL_INTERNSHIP', 'UNVERIFIED_THIRD_PARTY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE external_cert_ai_recommendation AS ENUM ('AUTO_VERIFIED', 'MANUAL_REVIEW', 'SUSPICIOUS', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE external_cert_human_status AS ENUM ('UNREVIEWED', 'APPROVED', 'REJECTED', 'EVIDENCE_REQUESTED', 'SUSPICIOUS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ml_ground_truth_label AS ENUM ('VERIFIED', 'REJECTED', 'SUSPICIOUS', 'UNLABELED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- --------------------------------------------------------------------
-- 2. DOMAIN 1: IDENTITY & STAKEHOLDERS
-- --------------------------------------------------------------------

-- 2.1 public.users (Links to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    phone TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 public.departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_name TEXT UNIQUE NOT NULL,
    hod_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 public.student_profiles
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    roll_number TEXT,
    department TEXT,
    year INT,
    semester INT,
    cgpa NUMERIC(4,2),
    backlogs INT DEFAULT 0,
    skills TEXT,
    certifications TEXT,
    passing_year INT,
    resume_url TEXT,
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 public.companies
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    industry TEXT,
    address TEXT,
    website TEXT,
    hr_email TEXT,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 public.faculty_mentors
CREATE TABLE IF NOT EXISTS public.faculty_mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    department TEXT,
    designation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 public.company_mentors
CREATE TABLE IF NOT EXISTS public.company_mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    designation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. DOMAIN 2: OPPORTUNITY & APPLICATIONS
-- --------------------------------------------------------------------

-- 3.1 public.internship_postings
CREATE TABLE IF NOT EXISTS public.internship_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    mode TEXT DEFAULT 'On-site',
    stipend TEXT,
    vacancies INT DEFAULT 1,
    work_location TEXT,
    min_cgpa NUMERIC(4,2) DEFAULT 0.0,
    max_backlogs INT DEFAULT 0,
    eligible_departments TEXT,
    deadline DATE,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 public.internship_applications
CREATE TABLE IF NOT EXISTS public.internship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posting_id UUID REFERENCES public.internship_postings(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Applied',
    selection_status TEXT DEFAULT 'Pending'
);

-- 3.3 public.offer_letters
CREATE TABLE IF NOT EXISTS public.offer_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.internship_applications(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'OFFER_PENDING',
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 4. DOMAIN 3: ACTIVE INTERNSHIP & DAILY OPERATIONS
-- --------------------------------------------------------------------

-- 4.1 public.internships (Master Record)
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    faculty_id UUID REFERENCES public.faculty_mentors(id) ON DELETE SET NULL,
    company_mentor_id UUID REFERENCES public.company_mentors(id) ON DELETE SET NULL,
    offer_letter_id UUID REFERENCES public.offer_letters(id) ON DELETE SET NULL,
    internship_title TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'Applied',
    work_location TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    allowed_radius_km DOUBLE PRECISION, -- Configurable & Nullable without default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.2 public.work_locations
CREATE TABLE IF NOT EXISTS public.work_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    work_location TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    allowed_radius_km DOUBLE PRECISION, -- Configurable & Nullable without default
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.3 public.attendance (Single Source of Truth)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Verification',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION,
    geofence_status TEXT DEFAULT 'VERIFIED_GEOFENCE',
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_daily_attendance UNIQUE (internship_id, attendance_date)
);

-- 4.4 public.work_logs
CREATE TABLE IF NOT EXISTS public.work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.5 public.tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4.6 public.task_submissions
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT,
    remarks TEXT,
    grade_rating NUMERIC(3,2),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. DOMAIN 4: PROGRESS, EVALUATIONS & COMPLETION
-- --------------------------------------------------------------------

-- 5.1 public.weekly_monthly_progress
CREATE TABLE IF NOT EXISTS public.weekly_monthly_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    period_type TEXT DEFAULT 'MONTHLY',
    attendance_pct NUMERIC(5,2) DEFAULT 0.0,
    task_completion_pct NUMERIC(5,2) DEFAULT 0.0,
    work_log_count INT DEFAULT 0,
    progress_score NUMERIC(5,2) DEFAULT 0.0,
    risk_level TEXT DEFAULT 'NORMAL',
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 public.company_evaluations
CREATE TABLE IF NOT EXISTS public.company_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scores JSONB,
    overall_rating NUMERIC(3,2),
    performance_category TEXT,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.3 public.faculty_evaluations
CREATE TABLE IF NOT EXISTS public.faculty_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    scores JSONB,
    overall_rating NUMERIC(3,2),
    academic_status TEXT,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.4 public.mentor_feedback
CREATE TABLE IF NOT EXISTS public.mentor_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    evaluator_role TEXT,
    rating NUMERIC(3,2) DEFAULT 5.0,
    feedback_text TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.5 public.certificates (Internal QR Certificates)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT UNIQUE NOT NULL,
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.6 public.external_certificates (AI Verification Pipeline Contract)
CREATE TABLE IF NOT EXISTS public.external_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    internship_id UUID REFERENCES public.internships(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    document_hash TEXT UNIQUE NOT NULL,
    processing_status external_cert_processing_status NOT NULL DEFAULT 'PENDING',
    analysis_error TEXT,
    analysis_version TEXT NOT NULL DEFAULT 'v1.0.0',
    verification_mode external_cert_verification_mode NOT NULL DEFAULT 'EXTERNAL_INTERNSHIP',
    ai_recommendation external_cert_ai_recommendation NOT NULL DEFAULT 'MANUAL_REVIEW',
    overall_trust_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    human_review_status external_cert_human_status NOT NULL DEFAULT 'UNREVIEWED',
    student_visible_feedback TEXT,
    internal_reviewer_notes TEXT,
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.7 public.ml_certificate_dataset (AI Ground Truth Dataset Contract)
CREATE TABLE IF NOT EXISTS public.ml_certificate_dataset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_certificate_id UUID UNIQUE REFERENCES public.external_certificates(id) ON DELETE CASCADE,
    document_hash TEXT NOT NULL,
    normalized_issuer_template_id TEXT NOT NULL DEFAULT 'UNKNOWN',
    feature_schema_version TEXT NOT NULL DEFAULT 'v1.0.0',
    labeling_guideline_version TEXT NOT NULL DEFAULT 'v1.0.0',
    feature_vector JSONB NOT NULL,
    ground_truth_label ml_ground_truth_label NOT NULL DEFAULT 'UNLABELED',
    adjudicated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    adjudicated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dataset_split TEXT NOT NULL DEFAULT 'TRAIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.8 public.ppo_records
CREATE TABLE IF NOT EXISTS public.ppo_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Offered',
    designation TEXT,
    ctc NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.9 public.audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    module TEXT,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. PERFORMANCE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_dept_id ON public.student_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_mentors_user_id ON public.faculty_mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_mentors_dept_id ON public.faculty_mentors(department_id);
CREATE INDEX IF NOT EXISTS idx_company_mentors_user_id ON public.company_mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_internship_postings_company ON public.internship_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_internship_applications_student ON public.internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_offer_letters_student ON public.offer_letters(student_id);
CREATE INDEX IF NOT EXISTS idx_internships_student ON public.internships(student_id);
CREATE INDEX IF NOT EXISTS idx_internships_faculty ON public.internships(faculty_id);
CREATE INDEX IF NOT EXISTS idx_attendance_internship ON public.attendance(internship_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_work_logs_internship ON public.work_logs(internship_id);
CREATE INDEX IF NOT EXISTS idx_tasks_internship ON public.tasks(internship_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_ext_cert_doc_hash ON public.external_certificates(document_hash);
CREATE INDEX IF NOT EXISTS idx_ext_cert_human_status ON public.external_certificates(human_review_status);
CREATE INDEX IF NOT EXISTS idx_ml_dataset_ext_cert ON public.ml_certificate_dataset(external_certificate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);

-- --------------------------------------------------------------------
-- 7. SECURE HELPER FUNCTIONS FOR RLS SCOPING (with search_path = public)
-- --------------------------------------------------------------------

-- Check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- Check HOD department ID
CREATE OR REPLACE FUNCTION public.get_hod_department_id(user_uuid UUID)
RETURNS UUID AS $$
    SELECT id FROM public.departments WHERE hod_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- Check Company Mentor company ID
CREATE OR REPLACE FUNCTION public.get_company_mentor_company_id(user_uuid UUID)
RETURNS UUID AS $$
    SELECT company_id FROM public.company_mentors WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- Check Faculty Mentor ID
CREATE OR REPLACE FUNCTION public.get_faculty_mentor_id(user_uuid UUID)
RETURNS UUID AS $$
    SELECT id FROM public.faculty_mentors WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- Check if student belongs to HOD department
CREATE OR REPLACE FUNCTION public.is_student_in_hod_department(student_uuid UUID, hod_user_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.student_profiles sp
        JOIN public.departments d ON d.id = sp.department_id
        WHERE sp.user_id = student_uuid AND d.hod_id = hod_user_uuid
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- Secure Public QR Certificate Verification Function (Zero Table Exposure)
CREATE OR REPLACE FUNCTION public.verify_certificate_by_token(token_param TEXT)
RETURNS TABLE (
    certificate_id TEXT,
    internship_title TEXT,
    student_name TEXT,
    company_name TEXT,
    issued_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT
) AS $$
    SELECT 
        c.certificate_id,
        i.internship_title,
        u.full_name AS student_name,
        comp.company_name,
        c.issued_at,
        c.pdf_url
    FROM public.certificates c
    JOIN public.users u ON u.id = c.student_id
    JOIN public.internships i ON i.id = c.internship_id
    LEFT JOIN public.companies comp ON comp.id = i.company_id
    WHERE c.verification_token = token_param LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- --------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) ENABLEMENT & IDEMPOTENT POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_monthly_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_certificate_dataset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppo_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to safely drop existing policies before recreation for idempotency
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 8.1 public.users
CREATE POLICY "Users select self or role scoped" ON public.users 
    FOR SELECT USING (
        auth.uid() = id 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR (public.get_user_role(auth.uid()) = 'faculty_mentor' AND EXISTS (SELECT 1 FROM public.internships WHERE faculty_id = public.get_faculty_mentor_id(auth.uid()) AND student_id = users.id))
        OR (public.get_user_role(auth.uid()) = 'company_mentor' AND EXISTS (SELECT 1 FROM public.internships WHERE company_id = public.get_company_mentor_company_id(auth.uid()) AND student_id = users.id))
        OR (public.get_user_role(auth.uid()) = 'hod' AND public.is_student_in_hod_department(users.id, auth.uid()))
    );
CREATE POLICY "Users insert self or admin" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users update self or admin" ON public.users 
    FOR UPDATE USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users delete admin" ON public.users 
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.2 public.student_profiles
CREATE POLICY "Student profiles select role scoped" ON public.student_profiles 
    FOR SELECT USING (
        user_id = auth.uid() 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo') 
        OR department_id = public.get_hod_department_id(auth.uid())
        OR EXISTS (SELECT 1 FROM public.internships WHERE student_id = public.student_profiles.user_id AND (faculty_id = public.get_faculty_mentor_id(auth.uid()) OR company_id = public.get_company_mentor_company_id(auth.uid())))
    );
CREATE POLICY "Student profiles insert self or admin" ON public.student_profiles 
    FOR INSERT WITH CHECK (user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Student profiles update self or admin" ON public.student_profiles 
    FOR UPDATE USING (user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Student profiles delete admin" ON public.student_profiles 
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.3 public.departments
CREATE POLICY "Departments select authenticated" ON public.departments 
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Departments insert admin" ON public.departments 
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Departments update admin or hod" ON public.departments 
    FOR UPDATE USING (hod_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Departments delete admin" ON public.departments 
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.4 public.companies (Restricted Insert to Admin, TPO, or Company Mentor)
CREATE POLICY "Companies select authenticated" ON public.companies 
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Companies insert company mentor or tpo or admin" ON public.companies 
    FOR INSERT WITH CHECK (
        public.get_user_role(auth.uid()) IN ('admin', 'tpo', 'company_mentor')
    );
CREATE POLICY "Companies update own mentor or admin" ON public.companies 
    FOR UPDATE USING (id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Companies delete admin" ON public.companies 
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.5 public.faculty_mentors
CREATE POLICY "Faculty mentors select role scoped" ON public.faculty_mentors 
    FOR SELECT USING (
        user_id = auth.uid() 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR department_id = public.get_hod_department_id(auth.uid())
        OR EXISTS (SELECT 1 FROM public.internships WHERE faculty_id = public.faculty_mentors.id AND student_id = auth.uid())
    );
CREATE POLICY "Faculty mentors insert update admin or hod" ON public.faculty_mentors 
    FOR ALL USING (department_id = public.get_hod_department_id(auth.uid()) OR public.get_user_role(auth.uid()) = 'admin');

-- 8.6 public.company_mentors
CREATE POLICY "Company mentors select role scoped" ON public.company_mentors 
    FOR SELECT USING (
        user_id = auth.uid() 
        OR company_id = public.get_company_mentor_company_id(auth.uid())
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR EXISTS (SELECT 1 FROM public.internships WHERE company_mentor_id = public.company_mentors.id AND (student_id = auth.uid() OR faculty_id = public.get_faculty_mentor_id(auth.uid())))
    );
CREATE POLICY "Company mentors update self or admin" ON public.company_mentors 
    FOR UPDATE USING (user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Company mentors insert delete admin" ON public.company_mentors 
    FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.7 public.internship_postings
CREATE POLICY "Postings select open or company" ON public.internship_postings 
    FOR SELECT USING (status = 'Open' OR company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) IN ('admin', 'tpo', 'hod'));
CREATE POLICY "Postings insert company mentor or admin" ON public.internship_postings 
    FOR INSERT WITH CHECK (company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
CREATE POLICY "Postings update company mentor or admin" ON public.internship_postings 
    FOR UPDATE USING (company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
CREATE POLICY "Postings delete company mentor or admin" ON public.internship_postings 
    FOR DELETE USING (company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) = 'admin');

-- 8.8 public.internship_applications
CREATE POLICY "Applications select role scoped" ON public.internship_applications 
    FOR SELECT USING (
        student_id = auth.uid() 
        OR company_id = public.get_company_mentor_company_id(auth.uid()) 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR public.is_student_in_hod_department(student_id, auth.uid())
    );
CREATE POLICY "Applications insert student" ON public.internship_applications 
    FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Applications update company or tpo" ON public.internship_applications 
    FOR UPDATE USING (company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
CREATE POLICY "Applications delete student or admin" ON public.internship_applications 
    FOR DELETE USING (student_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin');

-- 8.9 public.offer_letters
CREATE POLICY "Offer letters select role scoped" ON public.offer_letters 
    FOR SELECT USING (
        student_id = auth.uid() 
        OR company_id = public.get_company_mentor_company_id(auth.uid()) 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR public.is_student_in_hod_department(student_id, auth.uid())
    );
CREATE POLICY "Offer letters insert company or student" ON public.offer_letters 
    FOR INSERT WITH CHECK (student_id = auth.uid() OR company_id = public.get_company_mentor_company_id(auth.uid()));
CREATE POLICY "Offer letters update tpo or company" ON public.offer_letters 
    FOR UPDATE USING (company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
CREATE POLICY "Offer letters delete admin" ON public.offer_letters 
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.10 public.internships (Master Record)
CREATE POLICY "Internships select role scoped" ON public.internships 
    FOR SELECT USING (
        student_id = auth.uid() 
        OR faculty_id = public.get_faculty_mentor_id(auth.uid()) 
        OR company_id = public.get_company_mentor_company_id(auth.uid()) 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR public.is_student_in_hod_department(student_id, auth.uid())
    );
CREATE POLICY "Internships insert tpo or company or student" ON public.internships 
    FOR INSERT WITH CHECK (student_id = auth.uid() OR company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
CREATE POLICY "Internships update assigned mentors or tpo" ON public.internships 
    FOR UPDATE USING (faculty_id = public.get_faculty_mentor_id(auth.uid()) OR company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
CREATE POLICY "Internships delete admin" ON public.internships 
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.11 public.work_locations
CREATE POLICY "Work locations select role scoped" ON public.work_locations 
    FOR SELECT USING (
        company_id = public.get_company_mentor_company_id(auth.uid())
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = work_locations.internship_id 
            AND (
                i.student_id = auth.uid() 
                OR i.faculty_id = public.get_faculty_mentor_id(auth.uid()) 
                OR public.is_student_in_hod_department(i.student_id, auth.uid())
            )
        )
    );
CREATE POLICY "Work locations insert update company mentor or admin" ON public.work_locations 
    FOR ALL USING (company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) = 'admin');

-- 8.12 public.attendance (Single Source of Truth)
CREATE POLICY "Attendance select role scoped" ON public.attendance 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = attendance.internship_id 
            AND (
                i.student_id = auth.uid() 
                OR i.faculty_id = public.get_faculty_mentor_id(auth.uid()) 
                OR i.company_id = public.get_company_mentor_company_id(auth.uid()) 
                OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
                OR public.is_student_in_hod_department(i.student_id, auth.uid())
            )
        )
    );
CREATE POLICY "Attendance insert student" ON public.attendance 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.internships WHERE id = internship_id AND student_id = auth.uid())
    );
CREATE POLICY "Attendance update mentor or admin" ON public.attendance 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = attendance.internship_id 
            AND (
                i.faculty_id = public.get_faculty_mentor_id(auth.uid()) 
                OR i.company_id = public.get_company_mentor_company_id(auth.uid()) 
                OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
            )
        )
    );
CREATE POLICY "Attendance delete admin" ON public.attendance 
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.13 public.work_logs
CREATE POLICY "Work logs select role scoped" ON public.work_logs 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = work_logs.internship_id 
            AND (
                i.student_id = auth.uid() 
                OR i.faculty_id = public.get_faculty_mentor_id(auth.uid()) 
                OR i.company_id = public.get_company_mentor_company_id(auth.uid()) 
                OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
                OR public.is_student_in_hod_department(i.student_id, auth.uid())
            )
        )
    );
CREATE POLICY "Work logs insert student" ON public.work_logs 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.internships WHERE id = internship_id AND student_id = auth.uid())
    );
CREATE POLICY "Work logs update student owner" ON public.work_logs 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.internships WHERE id = internship_id AND student_id = auth.uid())
    );
CREATE POLICY "Work logs delete admin" ON public.work_logs 
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- 8.14 public.tasks
CREATE POLICY "Tasks select role scoped" ON public.tasks 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = tasks.internship_id 
            AND (
                i.student_id = auth.uid() 
                OR i.faculty_id = public.get_faculty_mentor_id(auth.uid()) 
                OR i.company_id = public.get_company_mentor_company_id(auth.uid()) 
                OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
                OR public.is_student_in_hod_department(i.student_id, auth.uid())
            )
        )
    );
CREATE POLICY "Tasks insert update assigned mentor" ON public.tasks 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = tasks.internship_id 
            AND (i.faculty_id = public.get_faculty_mentor_id(auth.uid()) OR i.company_id = public.get_company_mentor_company_id(auth.uid()))
        )
        OR public.get_user_role(auth.uid()) = 'admin'
    );

-- 8.15 public.task_submissions (Strict Internship Ownership Check)
CREATE POLICY "Task submissions select role scoped" ON public.task_submissions 
    FOR SELECT USING (
        student_id = auth.uid() 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR public.is_student_in_hod_department(student_id, auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.tasks t 
            JOIN public.internships i ON i.id = t.internship_id 
            WHERE t.id = task_submissions.task_id 
            AND (i.faculty_id = public.get_faculty_mentor_id(auth.uid()) OR i.company_id = public.get_company_mentor_company_id(auth.uid()))
        )
    );
CREATE POLICY "Task submissions insert student" ON public.task_submissions 
    FOR INSERT WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.tasks t 
            JOIN public.internships i ON i.id = t.internship_id 
            WHERE t.id = task_submissions.task_id 
            AND i.student_id = auth.uid()
        )
    );
CREATE POLICY "Task submissions grade update mentor" ON public.task_submissions 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tasks t 
            JOIN public.internships i ON i.id = t.internship_id 
            WHERE t.id = task_submissions.task_id 
            AND (i.faculty_id = public.get_faculty_mentor_id(auth.uid()) OR i.company_id = public.get_company_mentor_company_id(auth.uid()))
        )
        OR public.get_user_role(auth.uid()) = 'admin'
    );

-- 8.16 public.weekly_monthly_progress
CREATE POLICY "Progress select role scoped" ON public.weekly_monthly_progress 
    FOR SELECT USING (
        student_id = auth.uid() 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR public.is_student_in_hod_department(student_id, auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = weekly_monthly_progress.internship_id 
            AND (i.faculty_id = public.get_faculty_mentor_id(auth.uid()) OR i.company_id = public.get_company_mentor_company_id(auth.uid()))
        )
    );
CREATE POLICY "Progress insert update service or admin" ON public.weekly_monthly_progress 
    FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'tpo'));

-- 8.17 public.company_evaluations
CREATE POLICY "Company evaluations select role scoped" ON public.company_evaluations 
    FOR SELECT USING (
        evaluator_id = auth.uid() 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = company_evaluations.internship_id 
            AND (
                (i.student_id = auth.uid() AND (i.status = 'Completed' OR UPPER(i.status) = 'COMPLETED'))
                OR i.faculty_id = public.get_faculty_mentor_id(auth.uid())
                OR public.is_student_in_hod_department(i.student_id, auth.uid())
            )
        )
    );
CREATE POLICY "Company evaluations insert update company mentor" ON public.company_evaluations 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = company_evaluations.internship_id 
            AND i.company_id = public.get_company_mentor_company_id(auth.uid())
        )
        OR public.get_user_role(auth.uid()) = 'admin'
    );

-- 8.18 public.faculty_evaluations
CREATE POLICY "Faculty evaluations select role scoped" ON public.faculty_evaluations 
    FOR SELECT USING (
        evaluator_id = auth.uid() 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = faculty_evaluations.internship_id 
            AND (
                (i.student_id = auth.uid() AND (i.status = 'Completed' OR UPPER(i.status) = 'COMPLETED'))
                OR i.company_id = public.get_company_mentor_company_id(auth.uid())
                OR public.is_student_in_hod_department(i.student_id, auth.uid())
            )
        )
    );
CREATE POLICY "Faculty evaluations insert update faculty mentor" ON public.faculty_evaluations 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = faculty_evaluations.internship_id 
            AND i.faculty_id = public.get_faculty_mentor_id(auth.uid())
        )
        OR public.get_user_role(auth.uid()) = 'admin'
    );

-- 8.19 public.mentor_feedback
CREATE POLICY "Mentor feedback select role scoped" ON public.mentor_feedback 
    FOR SELECT USING (
        evaluator_id = auth.uid() 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = mentor_feedback.internship_id 
            AND (
                i.student_id = auth.uid() 
                OR i.faculty_id = public.get_faculty_mentor_id(auth.uid())
                OR i.company_id = public.get_company_mentor_company_id(auth.uid())
                OR public.is_student_in_hod_department(i.student_id, auth.uid())
            )
        )
    );
CREATE POLICY "Mentor feedback insert evaluator" ON public.mentor_feedback 
    FOR INSERT WITH CHECK (evaluator_id = auth.uid());

-- 8.20 public.certificates (Role-scoped table query; Public verification handled via verify_certificate_by_token RPC)
CREATE POLICY "Certificates select role scoped" ON public.certificates 
    FOR SELECT USING (
        student_id = auth.uid()
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR public.is_student_in_hod_department(student_id, auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = certificates.internship_id 
            AND (i.faculty_id = public.get_faculty_mentor_id(auth.uid()) OR i.company_id = public.get_company_mentor_company_id(auth.uid()))
        )
    );
CREATE POLICY "Certificates insert tpo or admin" ON public.certificates 
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'tpo'));

-- 8.21 public.external_certificates
CREATE POLICY "External certs select student or reviewer" ON public.external_certificates 
    FOR SELECT USING (
        student_id = auth.uid() 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR public.is_student_in_hod_department(student_id, auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.internships i 
            WHERE i.id = external_certificates.internship_id 
            AND (i.faculty_id = public.get_faculty_mentor_id(auth.uid()) OR i.company_id = public.get_company_mentor_company_id(auth.uid()))
        )
    );
CREATE POLICY "External certs insert student" ON public.external_certificates 
    FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "External certs update reviewer or admin" ON public.external_certificates 
    FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'tpo'));

-- 8.22 public.ml_certificate_dataset (Explicit Adjudication Read/Write/Update for TPO & Admin)
CREATE POLICY "ML dataset select tpo or admin" ON public.ml_certificate_dataset 
    FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
CREATE POLICY "ML dataset insert tpo or admin" ON public.ml_certificate_dataset 
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
CREATE POLICY "ML dataset update tpo or admin" ON public.ml_certificate_dataset 
    FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'tpo'));

-- 8.23 public.ppo_records
CREATE POLICY "PPO select role scoped" ON public.ppo_records 
    FOR SELECT USING (
        student_id = auth.uid() 
        OR company_id = public.get_company_mentor_company_id(auth.uid()) 
        OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR public.is_student_in_hod_department(student_id, auth.uid())
    );
CREATE POLICY "PPO insert update company mentor or tpo" ON public.ppo_records 
    FOR ALL USING (company_id = public.get_company_mentor_company_id(auth.uid()) OR public.get_user_role(auth.uid()) IN ('admin', 'tpo'));

-- 8.24 public.audit_logs (Strict Non-Impersonation Check)
CREATE POLICY "Audit logs insert authenticated" ON public.audit_logs 
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );
CREATE POLICY "Audit logs select admin or tpo" ON public.audit_logs 
    FOR SELECT USING (
        public.get_user_role(auth.uid()) IN ('admin', 'tpo')
        OR (public.get_user_role(auth.uid()) = 'hod' AND user_id IN (
            SELECT sp.user_id FROM public.student_profiles sp 
            JOIN public.departments d ON d.id = sp.department_id 
            WHERE d.hod_id = auth.uid()
        ))
    );

-- --------------------------------------------------------------------
-- 9. PRIVATE STORAGE BUCKETS & STRICT RELATIONSHIP-SCORED STORAGE RLS
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('resumes', 'resumes', false),
  ('offer_letters', 'offer_letters', false),
  ('task_deliverables', 'task_deliverables', false),
  ('external-certificates', 'external-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies for idempotency
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', r.policyname);
    END LOOP;
END $$;

-- Resumes Bucket RLS
CREATE POLICY "Resumes upload student" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Resumes select authorized relationship" ON storage.objects 
    FOR SELECT USING (
        bucket_id = 'resumes' 
        AND (
            (storage.foldername(name))[1] = auth.uid()::text 
            OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
            OR public.is_student_in_hod_department((storage.foldername(name))[1]::uuid, auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.internship_applications ia 
                WHERE ia.student_id = (storage.foldername(name))[1]::uuid 
                AND ia.company_id = public.get_company_mentor_company_id(auth.uid())
            )
        )
    );

-- Offer Letters Bucket RLS (Strict Student/Company Mentor Relational Upload)
CREATE POLICY "Offer letters upload student or company mentor" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'offer_letters' 
        AND (
            (storage.foldername(name))[1] = auth.uid()::text 
            OR EXISTS (
                SELECT 1 FROM public.internship_applications ia 
                WHERE ia.student_id = (storage.foldername(name))[1]::uuid 
                AND ia.company_id = public.get_company_mentor_company_id(auth.uid())
            )
            OR EXISTS (
                SELECT 1 FROM public.internships i 
                WHERE i.student_id = (storage.foldername(name))[1]::uuid 
                AND i.company_id = public.get_company_mentor_company_id(auth.uid())
            )
        )
    );
CREATE POLICY "Offer letters select authorized relationship" ON storage.objects 
    FOR SELECT USING (
        bucket_id = 'offer_letters' 
        AND (
            (storage.foldername(name))[1] = auth.uid()::text 
            OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
            OR public.is_student_in_hod_department((storage.foldername(name))[1]::uuid, auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.internships i 
                WHERE i.student_id = (storage.foldername(name))[1]::uuid 
                AND i.company_id = public.get_company_mentor_company_id(auth.uid())
            )
        )
    );

-- Task Deliverables Bucket RLS
CREATE POLICY "Task deliverables upload student" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'task_deliverables' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Task deliverables select authorized relationship" ON storage.objects 
    FOR SELECT USING (
        bucket_id = 'task_deliverables' 
        AND (
            (storage.foldername(name))[1] = auth.uid()::text 
            OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
            OR public.is_student_in_hod_department((storage.foldername(name))[1]::uuid, auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.internships i 
                WHERE i.student_id = (storage.foldername(name))[1]::uuid 
                AND (i.faculty_id = public.get_faculty_mentor_id(auth.uid()) OR i.company_id = public.get_company_mentor_company_id(auth.uid()))
            )
        )
    );

-- External Certificates Bucket RLS
CREATE POLICY "External certs upload student" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'external-certificates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "External certs select authorized relationship" ON storage.objects 
    FOR SELECT USING (
        bucket_id = 'external-certificates' 
        AND (
            (storage.foldername(name))[1] = auth.uid()::text 
            OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
            OR public.is_student_in_hod_department((storage.foldername(name))[1]::uuid, auth.uid())
            OR EXISTS (
                SELECT 1 FROM public.internships i 
                WHERE i.student_id = (storage.foldername(name))[1]::uuid 
                AND i.faculty_id = public.get_faculty_mentor_id(auth.uid())
            )
        )
    );

-- ====================================================================
-- End of Phase 0 Migration DDL (Production Security v3)
-- ====================================================================
