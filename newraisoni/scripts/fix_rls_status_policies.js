import { supabase } from '../src/supabase/client.js';

const password = 'Password123!';

async function applyRLSFix() {
  console.log('=== APPLYING RLS CANONICAL STATUS FIX ON SUPABASE ===');

  await supabase.auth.signInWithPassword({ email: 'admin@raisoni.edu', password });

  // Test executing SQL policy update via RPC or REST API
  // In Supabase PostgreSQL, we drop old case-sensitive policies and apply UPPER(i.status) checks
  const sql = `
    DROP POLICY IF EXISTS "Company evaluations select role scoped" ON public.company_evaluations;
    CREATE POLICY "Company evaluations select role scoped" ON public.company_evaluations 
        FOR SELECT USING (
            evaluator_id = auth.uid() 
            OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
            OR EXISTS (
                SELECT 1 FROM public.internships i 
                WHERE i.id = company_evaluations.internship_id 
                AND (
                    (i.student_id = auth.uid() AND UPPER(i.status) IN ('COMPLETED', 'ACTIVE'))
                    OR i.faculty_id = public.get_faculty_mentor_id(auth.uid())
                    OR public.is_student_in_hod_department(i.student_id, auth.uid())
                )
            )
        );

    DROP POLICY IF EXISTS "Faculty evaluations select role scoped" ON public.faculty_evaluations;
    CREATE POLICY "Faculty evaluations select role scoped" ON public.faculty_evaluations 
        FOR SELECT USING (
            evaluator_id = auth.uid() 
            OR public.get_user_role(auth.uid()) IN ('admin', 'tpo')
            OR EXISTS (
                SELECT 1 FROM public.internships i 
                WHERE i.id = faculty_evaluations.internship_id 
                AND (
                    (i.student_id = auth.uid() AND UPPER(i.status) IN ('COMPLETED', 'ACTIVE'))
                    OR i.company_id = public.get_company_mentor_company_id(auth.uid())
                    OR public.is_student_in_hod_department(i.student_id, auth.uid())
                )
            )
        );

    DROP POLICY IF EXISTS "External certs delete student or admin" ON public.external_certificates;
    CREATE POLICY "External certs delete student or admin" ON public.external_certificates 
        FOR DELETE USING (student_id = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin', 'tpo'));

    DROP POLICY IF EXISTS "ML dataset delete tpo or admin" ON public.ml_certificate_dataset;
    CREATE POLICY "ML dataset delete tpo or admin" ON public.ml_certificate_dataset 
        FOR DELETE USING (public.get_user_role(auth.uid()) IN ('admin', 'tpo'));
  `;

  console.log('SQL DDL Migration Script prepared:');
  console.log(sql);
}

applyRLSFix().catch(console.error);
