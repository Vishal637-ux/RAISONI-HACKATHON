import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jseihmoupjkrptuwydyo.supabase.co';
const supabaseKey = 'sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l';
const password = 'Password123!';

const studentEmail = 'student@raisoni.edu';
const adminEmail = 'admin@raisoni.edu';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPhase6RLS() {
  console.log('==================================================');
  console.log(' PHASE 6 — DIRECT LIVE SUPABASE RLS VERIFICATION');
  console.log('==================================================\n');

  let studentUserId, internshipId;

  // Setup: Get IDs via Admin
  await supabase.auth.signInWithPassword({ email: adminEmail, password });
  const { data: sAuth } = await supabase.auth.signInWithPassword({ email: studentEmail, password });
  studentUserId = sAuth.user.id;

  await supabase.auth.signInWithPassword({ email: adminEmail, password });
  const { data: intRow } = await supabase.from('internships').select('id').eq('student_id', studentUserId).single();
  internshipId = intRow.id;

  // Clean up any test attendance records for test date '2026-08-20'
  const testDate = '2026-08-20';
  await supabase.from('attendance').delete().eq('internship_id', internshipId).eq('attendance_date', testDate);

  // --------------------------------------------------
  // TEST 1: FACULTY_ASSIGNED Direct INSERT Negative Test
  // --------------------------------------------------
  await supabase.auth.signInWithPassword({ email: adminEmail, password });
  await supabase.from('internships').update({ status: 'FACULTY_ASSIGNED' }).eq('id', internshipId);

  await supabase.auth.signInWithPassword({ email: studentEmail, password });
  const { data: ins1, error: err1 } = await supabase
    .from('attendance')
    .insert({
      internship_id: internshipId,
      attendance_date: testDate,
      status: 'Present',
      latitude: 21.123456,
      longitude: 79.054321,
    })
    .select();

  const test1Blocked = (!ins1 || ins1.length === 0) && !!err1;
  console.log('--------------------------------------------------');
  console.log('TEST 1: FACULTY_ASSIGNED Direct INSERT Negative Test');
  console.log(`EXPECTED: Blocked by RLS (status != ACTIVE)`);
  console.log(`ACTUAL:   Inserted Rows: ${ins1 ? ins1.length : 0} | Code: ${err1?.code || 'None'} | Message: ${err1?.message || 'None'}`);
  console.log(`VERDICT:  ${test1Blocked ? 'PASS ✅ (RLS Blocked Insertion)' : 'FAIL ❌'}`);
  console.log('--------------------------------------------------\n');

  // --------------------------------------------------
  // TEST 2: TPO_VERIFIED Direct INSERT Negative Test
  // --------------------------------------------------
  await supabase.auth.signInWithPassword({ email: adminEmail, password });
  await supabase.from('internships').update({ status: 'TPO_VERIFIED' }).eq('id', internshipId);

  await supabase.auth.signInWithPassword({ email: studentEmail, password });
  const { data: ins2, error: err2 } = await supabase
    .from('attendance')
    .insert({
      internship_id: internshipId,
      attendance_date: testDate,
      status: 'Present',
      latitude: 21.123456,
      longitude: 79.054321,
    })
    .select();

  const test2Blocked = (!ins2 || ins2.length === 0) && !!err2;
  console.log('--------------------------------------------------');
  console.log('TEST 2: TPO_VERIFIED Direct INSERT Negative Test');
  console.log(`EXPECTED: Blocked by RLS (status != ACTIVE)`);
  console.log(`ACTUAL:   Inserted Rows: ${ins2 ? ins2.length : 0} | Code: ${err2?.code || 'None'} | Message: ${err2?.message || 'None'}`);
  console.log(`VERDICT:  ${test2Blocked ? 'PASS ✅ (RLS Blocked Insertion)' : 'FAIL ❌'}`);
  console.log('--------------------------------------------------\n');

  // --------------------------------------------------
  // TEST 3: ACTIVE Direct INSERT Positive Test
  // --------------------------------------------------
  await supabase.auth.signInWithPassword({ email: adminEmail, password });
  await supabase.from('internships').update({ status: 'ACTIVE' }).eq('id', internshipId);

  await supabase.auth.signInWithPassword({ email: studentEmail, password });
  const { data: ins3, error: err3 } = await supabase
    .from('attendance')
    .insert({
      internship_id: internshipId,
      attendance_date: testDate,
      status: 'Present',
      latitude: 21.123456,
      longitude: 79.054321,
      geofence_status: 'VERIFIED_GEOFENCE',
    })
    .select();

  const test3Success = ins3 && ins3.length === 1 && !err3;
  console.log('--------------------------------------------------');
  console.log('TEST 3: ACTIVE Direct INSERT Positive Test');
  console.log(`EXPECTED: INSERT succeeds for ACTIVE internship`);
  console.log(`ACTUAL:   Inserted Rows: ${ins3 ? ins3.length : 0} | Status: ${ins3 ? ins3[0]?.status : 'N/A'}`);
  console.log(`VERDICT:  ${test3Success ? 'PASS ✅ (Row Persisted)' : 'FAIL ❌'}`);
  console.log('--------------------------------------------------\n');

  // --------------------------------------------------
  // TEST 4: Cross-Student Foreign Internship Insert Block
  // --------------------------------------------------
  await supabase.auth.signInWithPassword({ email: studentEmail, password });
  const fakeForeignInternshipId = '00000000-0000-0000-0000-000000000000';
  const { data: ins4, error: err4 } = await supabase
    .from('attendance')
    .insert({
      internship_id: fakeForeignInternshipId,
      attendance_date: testDate,
      status: 'Present',
    })
    .select();

  const test4Blocked = (!ins4 || ins4.length === 0) && !!err4;
  console.log('--------------------------------------------------');
  console.log('TEST 4: Cross-Student Foreign Internship Insert Block');
  console.log(`EXPECTED: Blocked by RLS (student_id != auth.uid())`);
  console.log(`ACTUAL:   Inserted Rows: ${ins4 ? ins4.length : 0} | Code: ${err4?.code || 'None'} | Message: ${err4?.message || 'None'}`);
  console.log(`VERDICT:  ${test4Blocked ? 'PASS ✅ (RLS Blocked Foreign Insert)' : 'FAIL ❌'}`);
  console.log('--------------------------------------------------\n');

  // Clean up test row
  await supabase.auth.signInWithPassword({ email: adminEmail, password });
  await supabase.from('attendance').delete().eq('internship_id', internshipId).eq('attendance_date', testDate);

  const allPassed = test1Blocked && test2Blocked && test3Success && test4Blocked;
  console.log('==================================================');
  console.log(` DIRECT RLS VERIFICATION: ${allPassed ? 'ALL 4 TESTS PASS ✅' : 'FAILED ❌'}`);
  console.log('==================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

verifyPhase6RLS().catch(console.error);
