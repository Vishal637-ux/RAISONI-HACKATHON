-- ====================================================================
-- Production SQL Migration Script
-- Missing Tables: tasks, task_submissions, mentor_feedback
-- Project: AI-Powered Internship Management & Verification System
-- Run this script in your Supabase Project -> SQL Editor
-- ====================================================================

-- 1. Create Tasks Table (Architecture Section 5.10)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Task Submissions Table (Architecture Section 5.11)
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT,
    remarks TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Mentor Feedback Table (Architecture Section 5.12)
CREATE TABLE IF NOT EXISTS public.mentor_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    evaluator_role TEXT,
    rating NUMERIC(3,2) DEFAULT 5.0,
    feedback_text TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- Performance Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_internship_id ON public.tasks(internship_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON public.task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_id ON public.task_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_internship_id ON public.mentor_feedback(internship_id);

-- ====================================================================
-- Enable Row Level Security (RLS) & Policies
-- ====================================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow public access task_submissions" ON public.task_submissions FOR ALL USING (true);
CREATE POLICY "Allow public access mentor_feedback" ON public.mentor_feedback FOR ALL USING (true);
