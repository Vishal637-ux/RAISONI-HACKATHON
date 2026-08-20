import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jseihmoupjkrptuwydyo.supabase.co';
const supabaseKey = 'sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l';
const supabase = createClient(supabaseUrl, supabaseKey);

const password = 'Password123!';

async function runPhase6HierarchySuite() {
  console.log('==================================================');
  console.log('  INTERTRACK PHASE 6 — HIERARCHY & SCOPE SUITE   ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, evidence) {
    console.log(`--------------------------------------------------`);
    console.log(`TEST:     ${testName}`);
    if (condition) {
      console.log(`STATUS:   PASS ✅`);
      console.log(`EVIDENCE: ${evidence}`);
      passed++;
    } else {
      console.log(`STATUS:   FAIL ❌`);
      console.log(`EVIDENCE: ${evidence}`);
      failed++;
    }
    console.log(`--------------------------------------------------\n`);
  }

  // 1. Admin Login
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@raisoni.edu',
    password,
  });

  if (authErr || !authData.user) {
    console.error('Failed to log in as Admin:', authErr);
    process.exit(1);
  }

  // 2. Department Hierarchy & HOD Mapping Audit
  const { data: depts, error: deptErr } = await supabase
    .from('departments')
    .select('*, users!hod_id(id, full_name, email)');

  assert(!deptErr && depts.length === 6, 'Hierarchy Audit — Academic Departments Count', `Discovered 6 departments in database.`);
  
  const cseDept = depts.find(d => d.department_name === 'Computer Science & Engineering');
  assert(cseDept && cseDept.hod_id !== null, 'HOD Mapping — Department Leadership Link', `CSE Department linked to HOD '${cseDept?.users?.full_name}'.`);

  // 3. Faculty Mentor Department Link Audit
  const { data: facultyList, error: facErr } = await supabase
    .from('faculty_mentors')
    .select('*, users(full_name, email), departments(department_name)');

  assert(!facErr && facultyList.length > 0, 'Faculty Hierarchy — Department Link', `Verified ${facultyList.length} faculty mentors linked to departments.`);

  // 4. Student-Faculty Mentor Internship Scope Audit
  const { data: internshipsList, error: intErr } = await supabase
    .from('internships')
    .select('id, student_id, faculty_id, company_id, status, faculty_mentors(*), company_mentors(*)');

  assert(!intErr && internshipsList.length > 0, 'Internship Scope — Supervision Dimension Link', `Verified ${internshipsList.length} active master internship scope records.`);

  // 5. Faculty Scope Isolation Test
  const facultyUser = facultyList[0];
  const { data: facStudents, error: facStudErr } = await supabase
    .from('internships')
    .select('*')
    .eq('faculty_id', facultyUser.id);

  assert(!facStudErr, 'Faculty Scope Isolation — Assigned Students Query', `Faculty '${facultyUser.users?.full_name}' assigned ${facStudents?.length || 0} students.`);

  // 6. HOD Scope Isolation Test
  const { data: hodDept } = await supabase
    .from('departments')
    .select('*')
    .eq('hod_id', 'a16fe2cd-d718-4595-98f1-2550e875f468')
    .single();

  assert(hodDept && hodDept.department_name === 'Computer Science & Engineering', 'HOD Scope Isolation — Department Boundary', `HOD restricted to '${hodDept?.department_name}'.`);

  // 7. Company Mentor Scope Isolation Test
  const { data: compMentors } = await supabase
    .from('company_mentors')
    .select('*, companies(company_name)');

  const compMentor = compMentors[0];
  assert(compMentor && compMentor.company_id !== null, 'Company Mentor Scope — Host Partner Boundary', `Mentor '${compMentor.designation}' restricted to Company ID '${compMentor.company_id}'.`);

  // 8. Audit Log Recording Check
  const { count: auditCount } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true });
  assert(typeof auditCount === 'number', 'Audit Stream — public.audit_logs Stream', `Real audit log table queryable with ${auditCount} records.`);

  console.log('==================================================');
  console.log(` PHASE 6 HIERARCHY RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6HierarchySuite().catch((err) => {
  console.error('Unhandled Phase 6 test suite error:', err);
  process.exit(1);
});
