import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jseihmoupjkrptuwydyo.supabase.co';
const supabaseKey = 'sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l';

const supabase = createClient(supabaseUrl, supabaseKey);

async function probePhase5Db() {
  console.log('=== PHASE 5 DATABASE SCHEMA PROBE ===\n');

  // Sign in as admin
  await supabase.auth.signInWithPassword({ email: 'admin@raisoni.edu', password: 'Password123!' });

  // 1. Check faculty_mentors table
  const { data: fmData, error: fmErr } = await supabase.from('faculty_mentors').select('*').limit(1);
  console.log('faculty_mentors row probe:', { sample: fmData, error: fmErr ? fmErr.message : null });

  // 2. Check internships table
  const { data: intData, error: intErr } = await supabase.from('internships').select('*').limit(1);
  console.log('internships row probe:', { sample: intData, error: intErr ? intErr.message : null });

  // 3. Check departments table
  const { data: deptData, error: deptErr } = await supabase.from('departments').select('*').limit(5);
  console.log('departments rows count:', deptData?.length, 'sample:', deptData);

  // 4. Check faculty users in users table
  const { data: facultyUsers, error: fUsersErr } = await supabase.from('users').select('*').eq('role', 'faculty');
  console.log('faculty users in public.users count:', facultyUsers?.length, 'rows:', facultyUsers);

  // 5. Test columns of faculty_mentors
  const fmCols = ['id', 'user_id', 'department_id', 'employee_id', 'designation', 'created_at'];
  for (const c of fmCols) {
    const { error: cErr } = await supabase.from('faculty_mentors').select(c).limit(1);
    console.log(`faculty_mentors.${c}:`, cErr ? `NO (${cErr.message})` : 'EXISTS ✅');
  }

  // 6. Test columns of internships
  const intCols = ['id', 'student_id', 'company_id', 'faculty_id', 'company_mentor_id', 'offer_letter_id', 'internship_title', 'status', 'start_date', 'end_date', 'work_location', 'created_at'];
  for (const c of intCols) {
    const { error: cErr } = await supabase.from('internships').select(c).limit(1);
    console.log(`internships.${c}:`, cErr ? `NO (${cErr.message})` : 'EXISTS ✅');
  }
}

probePhase5Db().catch(console.error);
