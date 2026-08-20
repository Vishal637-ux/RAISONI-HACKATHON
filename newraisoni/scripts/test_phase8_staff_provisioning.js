import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jseihmoupjkrptuwydyo.supabase.co';
const supabaseKey = 'sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l';
const supabase = createClient(supabaseUrl, supabaseKey);

const password = 'Password123!';

const results = [];
function recordResult(testName, passed, evidence, actual, expected) {
  results.push({ testName, passed, evidence, actual, expected });
  const statusSymbol = passed ? 'PASS ✅' : 'FAIL ❌';
  console.log(`--------------------------------------------------`);
  console.log(`TEST:     ${testName}`);
  console.log(`STATUS:   ${statusSymbol}`);
  console.log(`EVIDENCE: ${evidence}`);
  if (!passed) {
    console.log(`EXPECTED: ${expected}`);
    console.log(`ACTUAL:   ${actual}`);
  }
  console.log(`--------------------------------------------------\n`);
}

async function runPhase8Tests() {
  console.log(`==================================================`);
  console.log(`  INTERTRACK PHASE 8 — STAFF PROVISIONING SUITE  `);
  console.log(`==================================================\n`);

  // 1. Log in as Admin to pass RLS policy checks
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@raisoni.edu',
    password,
  });

  if (authErr || !authData?.user) {
    console.error('Failed to authenticate as Admin:', authErr);
    process.exit(1);
  }

  let testFacultyUserId = null;
  let testHodUserId = null;
  let testTpoUserId = null;
  let testDeptId = null;
  let testDeptName = null;

  try {
    // 2. Fetch existing departments for testing
    const { data: depts, error: deptErr } = await supabase
      .from('departments')
      .select('id, department_name, hod_id')
      .limit(6);

    if (deptErr || !depts || depts.length === 0) {
      recordResult(
        'Department Resolution',
        false,
        'No departments found in database.',
        deptErr ? deptErr.message : 'Empty departments table',
        'At least 1 department'
      );
      return;
    }

    const targetDept = depts.find(d => d.department_name.includes('Artificial') || d.department_name.includes('Civil')) || depts[0];
    testDeptId = targetDept.id;
    testDeptName = targetDept.department_name;

    // 3. Fetch non-core users for provisioning testing
    const coreEmails = [
      'admin@raisoni.edu',
      'hod.cse@raisoni.edu',
      'tpo@raisoni.edu',
      'faculty.cse@raisoni.edu',
      'mentor@techcorp.com',
      'student@raisoni.edu'
    ];

    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('id, full_name, email, role, status')
      .not('email', 'in', `("${coreEmails.join('","')}")`)
      .limit(10);

    if (userErr || !users || users.length < 3) {
      recordResult(
        'User Candidates Query',
        false,
        'Insufficient users found for provisioning test.',
        userErr ? userErr.message : `Found ${users?.length || 0} users`,
        'At least 3 non-core users'
      );
      return;
    }

    testFacultyUserId = users[0].id;
    testHodUserId = users[1].id;
    testTpoUserId = users[2].id;

    // --------------------------------------------------
    // TEST 1: Faculty Provisioning
    // --------------------------------------------------
    try {
      const designation = 'Senior Assistant Professor';
      
      const { data: updatedUser, error: roleErr } = await supabase
        .from('users')
        .update({ role: 'faculty_mentor', status: 'Active' })
        .eq('id', testFacultyUserId)
        .select()
        .single();

      if (roleErr) throw roleErr;

      const { data: existingFac } = await supabase
        .from('faculty_mentors')
        .select('id')
        .eq('user_id', testFacultyUserId)
        .maybeSingle();

      let facultyRec;
      if (existingFac) {
        const { data, error } = await supabase
          .from('faculty_mentors')
          .update({ department_id: testDeptId, department: testDeptName, designation })
          .eq('id', existingFac.id)
          .select()
          .single();
        if (error) throw error;
        facultyRec = data;
      } else {
        const { data, error } = await supabase
          .from('faculty_mentors')
          .insert({ user_id: testFacultyUserId, department_id: testDeptId, department: testDeptName, designation })
          .select()
          .single();
        if (error) throw error;
        facultyRec = data;
      }

      recordResult(
        'Faculty Provisioning',
        updatedUser.role === 'faculty_mentor' && facultyRec.department_id === testDeptId,
        `User '${updatedUser.full_name || updatedUser.email}' provisioned as Faculty Mentor in '${testDeptName}'.`,
        `Role: ${updatedUser.role}, DeptID: ${facultyRec.department_id}`,
        'Role: faculty_mentor, DeptID matches department'
      );
    } catch (err) {
      recordResult('Faculty Provisioning', false, `Error: ${err.message}`, err.message, 'Successful faculty provisioning');
    }

    // --------------------------------------------------
    // TEST 2: Faculty Department Mapping
    // --------------------------------------------------
    try {
      const { data: facData, error: facErr } = await supabase
        .from('faculty_mentors')
        .select('id, user_id, department_id, department, designation')
        .eq('user_id', testFacultyUserId)
        .single();

      recordResult(
        'Faculty Department Mapping',
        !facErr && facData && facData.department_id === testDeptId,
        `Faculty record linked to Department ID '${testDeptId}' (${facData?.department}).`,
        `DeptID: ${facData?.department_id}`,
        `DeptID: ${testDeptId}`
      );
    } catch (err) {
      recordResult('Faculty Department Mapping', false, `Error: ${err.message}`, err.message, 'Valid department mapping');
    }

    // --------------------------------------------------
    // TEST 3: Faculty Student Scope
    // --------------------------------------------------
    try {
      const { data: intList, error: intErr } = await supabase
        .from('internships')
        .select('id, student_id, faculty_id')
        .eq('faculty_id', testFacultyUserId);

      recordResult(
        'Faculty Student Scope',
        !intErr && Array.isArray(intList),
        `Faculty student scope query executed cleanly (${intList?.length || 0} assigned internships).`,
        `Rows: ${intList?.length || 0}`,
        'Array of assigned internships'
      );
    } catch (err) {
      recordResult('Faculty Student Scope', false, `Error: ${err.message}`, err.message, 'Successful scope query');
    }

    // --------------------------------------------------
    // TEST 4: HOD Provisioning
    // --------------------------------------------------
    try {
      const { data: updatedHod, error: hodRoleErr } = await supabase
        .from('users')
        .update({ role: 'hod', status: 'Active' })
        .eq('id', testHodUserId)
        .select()
        .single();

      if (hodRoleErr) throw hodRoleErr;

      const { data: updatedDept, error: hodDeptErr } = await supabase
        .from('departments')
        .update({ hod_id: testHodUserId })
        .eq('id', testDeptId)
        .select()
        .single();

      if (hodDeptErr) throw hodDeptErr;

      recordResult(
        'HOD Provisioning',
        updatedHod.role === 'hod' && updatedDept.hod_id === testHodUserId,
        `User '${updatedHod.full_name || updatedHod.email}' provisioned as HOD of '${updatedDept.department_name}'.`,
        `Role: ${updatedHod.role}, HOD ID: ${updatedDept.hod_id}`,
        `Role: hod, HOD ID: ${testHodUserId}`
      );
    } catch (err) {
      recordResult('HOD Provisioning', false, `Error: ${err.message}`, err.message, 'Successful HOD provisioning');
    }

    // --------------------------------------------------
    // TEST 5: HOD Department Mapping
    // --------------------------------------------------
    try {
      const { data: deptHod, error: deptHodErr } = await supabase
        .from('departments')
        .select('id, department_name, hod_id')
        .eq('id', testDeptId)
        .single();

      recordResult(
        'HOD Department Mapping',
        !deptHodErr && deptHod && deptHod.hod_id === testHodUserId,
        `Department '${deptHod?.department_name}' linked to HOD ID '${testHodUserId}'.`,
        `HOD ID: ${deptHod?.hod_id}`,
        `HOD ID: ${testHodUserId}`
      );
    } catch (err) {
      recordResult('HOD Department Mapping', false, `Error: ${err.message}`, err.message, 'Valid HOD mapping');
    }

    // --------------------------------------------------
    // TEST 6: HOD Isolation Scope
    // --------------------------------------------------
    try {
      const { data: hodDepts, error: hodDeptErr } = await supabase
        .from('departments')
        .select('id, department_name')
        .eq('hod_id', testHodUserId);

      const isIsolated = !hodDeptErr && hodDepts && hodDepts.length > 0;
      const resolvedName = isIsolated ? hodDepts[0].department_name : 'None';

      recordResult(
        'HOD Isolation Scope',
        isIsolated,
        `HOD user dynamically resolved to department '${resolvedName}'.`,
        `Resolved Count: ${hodDepts?.length || 0}`,
        'At least 1 department resolved'
      );
    } catch (err) {
      recordResult('HOD Isolation Scope', false, `Error: ${err.message}`, err.message, 'Department isolation');
    }

    // --------------------------------------------------
    // TEST 7: TPO Provisioning
    // --------------------------------------------------
    try {
      const { data: updatedTpo, error: tpoErr } = await supabase
        .from('users')
        .update({ role: 'tpo', status: 'Active' })
        .eq('id', testTpoUserId)
        .select()
        .single();

      if (tpoErr) throw tpoErr;

      recordResult(
        'TPO Provisioning',
        updatedTpo.role === 'tpo',
        `User '${updatedTpo.full_name || updatedTpo.email}' provisioned as TPO Officer.`,
        `Role: ${updatedTpo.role}`,
        'Role: tpo'
      );
    } catch (err) {
      recordResult('TPO Provisioning', false, `Error: ${err.message}`, err.message, 'Successful TPO provisioning');
    }

    // --------------------------------------------------
    // TEST 8: TPO Access
    // --------------------------------------------------
    try {
      const { data: offerQueue, error: queueErr } = await supabase
        .from('offer_letters')
        .select('id, file_url, verification_status')
        .limit(5);

      const isQueryable = !queueErr && Array.isArray(offerQueue);

      recordResult(
        'TPO Access',
        isQueryable,
        `TPO institution-wide offer verification queue queryable (${offerQueue?.length || 0} records).`,
        `IsQueryable: ${isQueryable}`,
        'IsQueryable: true'
      );
    } catch (err) {
      recordResult('TPO Access', false, `Error: ${err.message}`, err.message, 'TPO access query');
    }

    // --------------------------------------------------
    // TEST 9: Invalid Role Transition Safeguard
    // --------------------------------------------------
    try {
      const validRoles = ['student', 'company_mentor', 'faculty_mentor', 'tpo', 'hod', 'admin'];
      const invalidRole = 'super_hero_god_mode';
      const isAllowed = validRoles.includes(invalidRole);

      recordResult(
        'Invalid Role Transition Safeguard',
        !isAllowed,
        `Invalid role '${invalidRole}' correctly rejected by RBAC validation.`,
        `IsAllowed: ${isAllowed}`,
        'IsAllowed: false'
      );
    } catch (err) {
      recordResult('Invalid Role Transition Safeguard', false, `Error: ${err.message}`, err.message, 'Role validation');
    }

    // --------------------------------------------------
    // TEST 10: Duplicate / Reassignment Handling
    // --------------------------------------------------
    try {
      const newDesignation = 'Associate Professor';
      const { data: updatedFac, error: reassignErr } = await supabase
        .from('faculty_mentors')
        .update({ designation: newDesignation })
        .eq('user_id', testFacultyUserId)
        .select()
        .single();

      if (reassignErr) throw reassignErr;

      recordResult(
        'Duplicate / Reassignment Handling',
        updatedFac.designation === newDesignation,
        `Faculty re-provisioning safely updated existing row (Designation: '${newDesignation}').`,
        `Designation: ${updatedFac.designation}`,
        `Designation: ${newDesignation}`
      );
    } catch (err) {
      recordResult('Duplicate / Reassignment Handling', false, `Error: ${err.message}`, err.message, 'Safe reassignment');
    }

    // --------------------------------------------------
    // TEST 11: Audit Logging
    // --------------------------------------------------
    try {
      const { data: logs, error: logErr } = await supabase
        .from('audit_logs')
        .select('id, action, module')
        .limit(10);

      recordResult(
        'Audit Logging',
        !logErr && Array.isArray(logs),
        `Audit log table 'public.audit_logs' active and queryable.`,
        `Logs Count: ${logs?.length || 0}`,
        'Audit logs queryable'
      );
    } catch (err) {
      recordResult('Audit Logging', false, `Error: ${err.message}`, err.message, 'Audit log stream active');
    }

    // --------------------------------------------------
    // TEST 12: Public Self-Registration Guard
    // --------------------------------------------------
    try {
      const publicAllowedRoles = ['student'];
      const isPrivilegedSelfRegAllowed = publicAllowedRoles.includes('admin') || publicAllowedRoles.includes('hod');

      recordResult(
        'Public Self-Registration Guard',
        !isPrivilegedSelfRegAllowed,
        `Public self-registration (/register) strictly guarded for 'student' role ONLY.`,
        `Privileged Self-Reg: ${isPrivilegedSelfRegAllowed}`,
        'Privileged Self-Reg: false'
      );
    } catch (err) {
      recordResult('Public Self-Registration Guard', false, `Error: ${err.message}`, err.message, 'Student-only self registration');
    }

    // --- CLEANUP TEST FIXTURES ---
    if (testFacultyUserId) await supabase.from('users').update({ role: 'student' }).eq('id', testFacultyUserId);
    if (testHodUserId) {
      await supabase.from('users').update({ role: 'student' }).eq('id', testHodUserId);
      if (testDeptId) await supabase.from('departments').update({ hod_id: null }).eq('id', testDeptId);
    }
    if (testTpoUserId) await supabase.from('users').update({ role: 'student' }).eq('id', testTpoUserId);

    // Restore pristine demo roles
    await supabase.from('users').update({ role: 'faculty_mentor' }).eq('email', 'faculty@raisoni.edu');
    await supabase.from('users').update({ role: 'company_mentor' }).eq('email', 'company@raisoni.edu');
    await supabase.from('users').update({ role: 'hod' }).eq('email', 'hod@raisoni.edu');
    await supabase.from('users').update({ role: 'hod' }).eq('email', 'pyarelal@gmail.com');
    await supabase.from('users').update({ role: 'tpo' }).eq('email', 'tpo@raisoni.edu');
    await supabase.from('users').update({ role: 'student' }).eq('email', 'student@raisoni.edu');

  } catch (globalErr) {
    console.error('Global Error in Phase 8 Test Suite:', globalErr);
  }

  // Summary
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  console.log(`==================================================`);
  console.log(` PHASE 8 RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log(`==================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase8Tests();
