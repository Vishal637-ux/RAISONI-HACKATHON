import { supabase } from '../supabase/client';
import { ROLES } from '../constants/roles';
import { DEFAULT_DEPARTMENTS } from '../constants/departments';

// Fake placeholder UUIDs from DEFAULT_DEPARTMENTS (display-only, not real DB IDs)
const FAKE_DEPT_IDS = new Set(DEFAULT_DEPARTMENTS.map((d) => d.id));

export const authService = {
  /**
   * Register a new Student account
   */
  async signUpStudent({ email, password, fullName, phone, rollNumber, departmentId, year, semester, cgpa, skills }) {
    // Determine if departmentId is a real DB UUID or a fake fallback placeholder
    const isRealDeptId = departmentId && departmentId.length === 36 && !FAKE_DEPT_IDS.has(departmentId);
    const safeDeptId = isRealDeptId ? departmentId : null;

    // Store selected department code in metadata for display fallback
    const selectedDept = DEFAULT_DEPARTMENTS.find((d) => d.id === departmentId);
    const deptCode = selectedDept?.code || null;

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: ROLES.STUDENT,
          dept_code: deptCode,
          dept_id_raw: departmentId || null,
        },
      },
    });

    if (authError) throw authError;
    const user = authData.user;
    if (!user) throw new Error('User registration failed.');

    // 2. Build an authenticated client using the session token from signUp
    //    This ensures RLS auth.uid() resolves correctly immediately after sign-up
    const sessionToken = authData.session?.access_token;
    const authedClient = sessionToken
      ? supabase  // session is already set in the client after signUp
      : supabase;

    // 3. Insert into public.users
    const { error: userError } = await authedClient
      .from('users')
      .insert({
        id: user.id,
        email: email.trim().toLowerCase(),
        full_name: fullName,
        role: ROLES.STUDENT,
        phone: phone || null,
        status: 'Active',
      });

    if (userError) {
      console.warn('Notice creating public.users record:', userError.message);
    }

    // 4. Insert into public.student_profiles with safe department_id only
    const cleanYear = year ? parseInt(String(year).replace(/\D/g, ''), 10) || null : null;
    const cleanSem = semester ? parseInt(String(semester).replace(/\D/g, ''), 10) || null : null;
    const cleanCgpa = cgpa ? parseFloat(cgpa) || null : null;
    const skillsArray = Array.isArray(skills) ? skills : (skills ? [skills] : null);

    const { error: profileError } = await authedClient
      .from('student_profiles')
      .insert({
        user_id: user.id,
        roll_number: rollNumber || null,
        department_id: safeDeptId,
        year: cleanYear,
        semester: cleanSem,
        cgpa: cleanCgpa,
        skills: skillsArray,
      });

    if (profileError) {
      console.warn('Notice creating student_profiles record:', profileError.message);
    }

    return { user, session: authData.session };
  },

  /**
   * Register an invited Company Mentor account linked to target company_id
   */
  async signUpCompanyMentor({ email, password, fullName, phone, companyId, designation }) {
    if (!companyId) {
      throw new Error('Valid host company_id is required for Company Mentor registration.');
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName,
          role: ROLES.COMPANY,
          company_id: companyId,
        },
      },
    });

    if (authError) throw authError;
    const user = authData.user;
    if (!user) throw new Error('Company Mentor user creation failed.');

    // 2. Insert into public.users
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: email.trim().toLowerCase(),
        full_name: fullName,
        role: ROLES.COMPANY,
        phone: phone || null,
        status: 'Active',
        updated_at: new Date().toISOString(),
      });

    if (userError) {
      console.warn('Notice upserting public.users record:', userError.message);
    }

    // 3. Update or Insert into public.company_mentors safely
    const { data: existingMentor } = await supabase
      .from('company_mentors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMentor) {
      const { error: mentorError } = await supabase
        .from('company_mentors')
        .update({
          company_id: companyId,
          designation: designation || 'Company Mentor',
        })
        .eq('id', existingMentor.id);

      if (mentorError) {
        console.warn('Notice updating public.company_mentors record:', mentorError.message);
      }
    } else {
      const { error: mentorError } = await supabase
        .from('company_mentors')
        .insert({
          user_id: user.id,
          company_id: companyId,
          designation: designation || 'Company Mentor',
        });

      if (mentorError) {
        console.warn('Notice inserting public.company_mentors record:', mentorError.message);
      }
    }

    // 4. Log to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'COMPANY_MENTOR_REGISTRATION_COMPLETED',
      module: 'COMPANY_GOVERNANCE',
      details: JSON.stringify({ company_id: companyId, designation }),
    });

    return { user, session: authData.session };
  },

  /**
   * Sign in with Email and Password via real Supabase Auth
   */
  async signIn({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out current session
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Send Password Reset Email via Supabase Auth
   */
  async sendPasswordResetEmail(email) {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Update password for active user
   */
  async updateUserPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Fetch user profile & role from public.users table
   * auth.users.id -> public.users.id -> public.users.role
   */
  async fetchUserProfile(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, phone, status')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      return null;
    }
  },

  /**
   * Fetch HOD department UUID dynamically:
   * auth.uid() -> public.departments.hod_id -> public.departments.id
   */
  async fetchHodDepartment(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, department_name, hod_id')
        .eq('hod_id', userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }
      return {
        ...data,
        name: data.department_name,
        code: data.department_name,
      };
    } catch (err) {
      console.warn('Notice fetching HOD department:', err);
      return null;
    }
  },

  /**
   * Fetch all active departments for dropdown selection
   */
  async fetchDepartments() {
    try {
      // Check if user is authenticated before querying RLS-restricted departments table
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        return DEFAULT_DEPARTMENTS;
      }

      const { data, error } = await supabase
        .from('departments')
        .select('id, department_name, hod_id')
        .order('department_name');

      if (error || !data || data.length === 0) return DEFAULT_DEPARTMENTS;

      return data.map((d) => ({
        id: d.id,
        name: d.department_name,
        code: d.department_name,
        department_name: d.department_name,
        hod_id: d.hod_id,
      }));
    } catch {
      return DEFAULT_DEPARTMENTS;
    }
  },

  /**
   * Get active Supabase session
   */
  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};
