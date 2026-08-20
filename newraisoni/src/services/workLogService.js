import { supabase } from '../supabase/client.js';

export const workLogService = {
  /**
   * Submit daily work log entry for student's active internship
   * @param {string} studentUserId - Authenticated student user UUID
   * @param {string} internshipId - Master active internship UUID
   * @param {string} description - Daily work summary text (min 20 chars)
   */
  async createWorkLog(studentUserId, internshipId, description) {
    if (!studentUserId || !internshipId || !description) {
      throw new Error('Student User ID, Internship ID, and Log Description are required.');
    }

    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 20) {
      throw new Error('Work log description must be at least 20 characters long.');
    }

    try {
      // 1. Verify master active internship record
      const { data: internship, error: intErr } = await supabase
        .from('internships')
        .select('id, student_id, status')
        .eq('id', internshipId)
        .single();

      if (intErr || !internship) {
        throw new Error('Active internship record not found.');
      }

      if (internship.student_id !== studentUserId) {
        throw new Error('Unauthorized: Student does not match internship record.');
      }

      if (internship.status !== 'ACTIVE') {
        throw new Error(`Cannot submit work log for non-ACTIVE internship (status: '${internship.status}').`);
      }

      // 2. Insert into public.work_logs
      const payload = {
        internship_id: internshipId,
        description: trimmedDesc,
        submitted_at: new Date().toISOString(),
      };

      const { data: createdLog, error: insErr } = await supabase
        .from('work_logs')
        .insert(payload)
        .select()
        .single();

      if (insErr) {
        console.error('Error inserting work log:', insErr.message);
        throw insErr;
      }

      return createdLog;
    } catch (err) {
      console.error('workLogService.createWorkLog error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch daily work log entries for student's active internship
   * @param {string} studentUserId - Authenticated student user UUID
   */
  async getStudentWorkLogs(studentUserId) {
    if (!studentUserId) return [];
    try {
      const { data: internship } = await supabase
        .from('internships')
        .select('id')
        .eq('student_id', studentUserId)
        .maybeSingle();

      if (!internship) return [];

      const { data: logs, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('internship_id', internship.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return logs || [];
    } catch (err) {
      console.error('workLogService.getStudentWorkLogs error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch work log entries for faculty mentor's assigned mentees
   * @param {string} facultyUserId - Authenticated faculty mentor user ID
   */
  async getFacultyWorkLogs(facultyUserId) {
    if (!facultyUserId) return [];
    try {
      const { data: logs, error } = await supabase
        .from('work_logs')
        .select(`
          *,
          internships:internship_id (
            id,
            internship_title,
            student_id,
            companies:company_id (id, company_name),
            users:student_id (id, full_name, email)
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Filter profiles
      const studentIds = [...new Set((logs || []).map((l) => l.internships?.student_id).filter(Boolean))];
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('user_id, roll_number, departments:department_id(department_name)')
          .in('user_id', studentIds);

        const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
        (logs || []).forEach((log) => {
          if (log.internships?.student_id) {
            log.internships.student_profile = profileMap.get(log.internships.student_id) || null;
          }
        });
      }

      return logs || [];
    } catch (err) {
      console.error('workLogService.getFacultyWorkLogs error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch work log entries for company mentor's company interns
   * @param {string} companyUserId - Authenticated company mentor user ID
   */
  async getCompanyWorkLogs(companyUserId) {
    if (!companyUserId) return [];
    try {
      const { data: logs, error } = await supabase
        .from('work_logs')
        .select(`
          *,
          internships:internship_id (
            id,
            internship_title,
            student_id,
            company_id,
            companies:company_id (id, company_name),
            users:student_id (id, full_name, email)
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return logs || [];
    } catch (err) {
      console.error('workLogService.getCompanyWorkLogs error:', err.message || err);
      throw err;
    }
  },
};
