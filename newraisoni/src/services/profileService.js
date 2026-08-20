import { supabase } from '../supabase/client';

export const profileService = {
  /**
   * Fetch complete database-backed student profile
   */
  async getStudentProfile(userId) {
    if (!userId) return null;
    try {
      // 1. Fetch user base record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role, phone, status')
        .eq('id', userId)
        .maybeSingle();

      if (userError) throw userError;

      // 2. Fetch student_profiles record
      const { data: profileData, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      // 3. Fetch department info if department_id present
      let department = null;
      if (profileData?.department_id) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('id, department_name')
          .eq('id', profileData.department_id)
          .maybeSingle();

        if (deptData) {
          department = {
            id: deptData.id,
            name: deptData.department_name,
            code: deptData.department_name,
            department_name: deptData.department_name,
          };
        }
      }

      const combinedProfile = {
        user_id: userId,
        email: userData?.email || '',
        full_name: userData?.full_name || '',
        phone: userData?.phone || '',
        roll_number: profileData?.roll_number || '',
        branch: profileData?.branch || department?.code || '',
        year: profileData?.year || null,
        semester: profileData?.semester || null,
        cgpa: profileData?.cgpa !== undefined && profileData?.cgpa !== null ? Number(profileData.cgpa) : null,
        skills: profileData?.skills || [],
        resume_url: profileData?.resume_url || null,
        department_id: profileData?.department_id || null,
        department_name: department?.name || '',
        department_code: department?.code || '',
        created_at: profileData?.created_at || new Date().toISOString(),
      };

      return combinedProfile;
    } catch (err) {
      console.error('Error in getStudentProfile:', err.message || err);
      throw err;
    }
  },

  /**
   * Update student profile fields in public.student_profiles and public.users
   */
  async updateStudentProfile(userId, { fullName, phone, rollNumber, departmentId, year, semester, cgpa, skills, branch }) {
    if (!userId) throw new Error('User ID is required.');

    // 1. Update public.users full_name / phone
    const userUpdates = {};
    if (fullName !== undefined) userUpdates.full_name = fullName;
    if (phone !== undefined) userUpdates.phone = phone || null;

    if (Object.keys(userUpdates).length > 0) {
      const { error: userErr } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', userId);
      if (userErr) console.warn('Notice updating users table:', userErr.message);
    }

    // 2. Prepare clean student_profiles update payload
    const cleanYear = year ? parseInt(String(year).replace(/\D/g, ''), 10) || null : null;
    const cleanSem = semester ? parseInt(String(semester).replace(/\D/g, ''), 10) || null : null;
    const cleanCgpa = cgpa !== undefined && cgpa !== null && cgpa !== '' ? parseFloat(cgpa) : null;
    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    let validDeptId = null;
    if (departmentId && departmentId.length === 36) {
      const { data: validDept } = await supabase
        .from('departments')
        .select('id')
        .eq('id', departmentId)
        .maybeSingle();

      if (validDept) {
        validDeptId = validDept.id;
      }
    }

    const profilePayload = {
      roll_number: rollNumber || null,
      department_id: validDeptId,
      year: cleanYear,
      semester: cleanSem,
      cgpa: cleanCgpa,
      skills: skillsArray,
    };

    // 3. Upsert into public.student_profiles
    const { data: existing } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error: profileErr } = await supabase
        .from('student_profiles')
        .update(profilePayload)
        .eq('user_id', userId);
      if (profileErr) throw profileErr;
    } else {
      const { error: profileErr } = await supabase
        .from('student_profiles')
        .insert({ user_id: userId, ...profilePayload });
      if (profileErr) throw profileErr;
    }

    return this.getStudentProfile(userId);
  },

  /**
   * Upload resume to private Supabase Storage bucket 'resumes'
   */
  async uploadResume(userId, file) {
    if (!userId) throw new Error('User ID is required.');
    if (!file) throw new Error('No file provided.');

    // 1. File Type Validation: PDF Only
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      throw new Error('Invalid file format. Only PDF files (.pdf) are permitted.');
    }

    // 2. File Size Validation: Max 5 MB (5 * 1024 * 1024 bytes)
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      throw new Error('File size exceeds the 5 MB limit. Please upload a smaller PDF file.');
    }

    // 3. RLS Path Enforcement: resumes/{userId}/{filename}
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `${userId}/${Date.now()}_${cleanFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      throw new Error(`Resume upload failed: ${uploadError.message}`);
    }

    // 4. Get public/signed URL or reference path
    const { data: publicUrlData } = supabase.storage.from('resumes').getPublicUrl(uploadData.path);
    const resumeUrl = publicUrlData?.publicUrl || uploadData.path;

    // 5. Update student_profiles.resume_url in DB
    const { error: dbError } = await supabase
      .from('student_profiles')
      .update({ resume_url: resumeUrl })
      .eq('user_id', userId);

    if (dbError) {
      console.warn('Notice updating DB resume_url:', dbError.message);
    }

    return { path: uploadData.path, resumeUrl };
  },

  /**
   * Evaluate Academic Eligibility Engine against Posting Criteria
   */
  evaluateEligibility(studentProfile, postingCriteria = {}) {
    const defaultCriteria = {
      min_cgpa: 6.50,
      allowed_department_ids: [], // empty array = all departments allowed
      allowed_years: [3, 4],     // 3rd & 4th year eligible by default
      require_resume: true,
    };

    const criteria = { ...defaultCriteria, ...postingCriteria };
    const checks = [];

    // Check 1: CGPA Criteria
    const currentCgpa = studentProfile?.cgpa ? Number(studentProfile.cgpa) : 0;
    const cgpaPassed = currentCgpa >= criteria.min_cgpa;
    checks.push({
      id: 'cgpa',
      title: 'Academic CGPA Criterion',
      required: `>= ${criteria.min_cgpa.toFixed(2)} CGPA`,
      actual: studentProfile?.cgpa !== null && studentProfile?.cgpa !== undefined ? `${currentCgpa.toFixed(2)} CGPA` : 'Not Entered',
      passed: cgpaPassed,
      reason: cgpaPassed
        ? `Student CGPA (${currentCgpa.toFixed(2)}) meets the minimum requirement (${criteria.min_cgpa.toFixed(2)}).`
        : `Student CGPA (${currentCgpa ? currentCgpa.toFixed(2) : 'N/A'}) is below the required ${criteria.min_cgpa.toFixed(2)} threshold.`,
    });

    // Check 2: Department Criteria
    let deptPassed = true;
    let deptReason = 'All academic departments are eligible for this opportunity.';
    if (criteria.allowed_department_ids && criteria.allowed_department_ids.length > 0) {
      deptPassed = criteria.allowed_department_ids.includes(studentProfile?.department_id);
      deptReason = deptPassed
        ? `Student department (${studentProfile?.department_name || 'Enrolled Department'}) matches allowed criteria.`
        : `Student department is not included in the allowed department list for this drive.`;
    }
    checks.push({
      id: 'department',
      title: 'Department Eligibility',
      required: criteria.allowed_department_ids?.length > 0 ? 'Specific Department Match' : 'All Departments Allowed',
      actual: studentProfile?.department_name || 'Department Linked',
      passed: deptPassed,
      reason: deptReason,
    });

    // Check 3: Academic Year Criterion
    const currentYear = studentProfile?.year ? Number(studentProfile.year) : null;
    let yearPassed = true;
    if (criteria.allowed_years && criteria.allowed_years.length > 0) {
      yearPassed = currentYear !== null && criteria.allowed_years.includes(currentYear);
    }
    checks.push({
      id: 'year',
      title: 'Academic Year Criterion',
      required: criteria.allowed_years?.length > 0 ? `Year ${criteria.allowed_years.join(' or ')}` : 'Any Year',
      actual: currentYear ? `Year ${currentYear}` : 'Not Specified',
      passed: yearPassed,
      reason: yearPassed
        ? `Student year (${currentYear || 'N/A'}) satisfies academic year requirements.`
        : `Student academic year (${currentYear || 'Unspecified'}) does not meet criteria (${criteria.allowed_years.join(', ')}).`,
    });

    // Check 4: Resume Document Criterion
    const hasResume = Boolean(studentProfile?.resume_url);
    checks.push({
      id: 'resume',
      title: 'Verified Resume File',
      required: 'PDF Resume Uploaded',
      actual: hasResume ? 'Resume Uploaded' : 'Missing Resume File',
      passed: hasResume,
      reason: hasResume
        ? 'Verified PDF resume document is attached to student profile.'
        : 'Student has not uploaded a verified PDF resume file.',
    });

    const isEligible = checks.every((c) => c.passed);
    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return {
      isEligible,
      score,
      checks,
      evaluated_at: new Date().toISOString(),
    };
  },

  /**
   * Calculate Profile Completeness (0% to 100%)
   */
  calculateProfileCompleteness(profile) {
    if (!profile) return 0;
    let score = 0;

    // 1. Full Name (15%)
    if (profile.full_name && profile.full_name.trim().length > 0) score += 15;
    // 2. Email (15%)
    if (profile.email && profile.email.trim().length > 0) score += 15;
    // 3. Roll Number (15%)
    if (profile.roll_number && profile.roll_number.trim().length > 0) score += 15;
    // 4. Department Linked (15%)
    if (profile.department_id && profile.department_id.length === 36) score += 15;
    // 5. Academic CGPA (15%)
    if (profile.cgpa !== null && profile.cgpa !== undefined && !isNaN(profile.cgpa)) score += 15;
    // 6. Skills Array (10%)
    if (Array.isArray(profile.skills) && profile.skills.length > 0) score += 10;
    // 7. Resume Document Uploaded (15%)
    if (profile.resume_url && profile.resume_url.length > 0) score += 15;

    return Math.min(100, score);
  },
};
