import { supabase } from '../supabase/client.js';

export const hodService = {
  /**
   * Fetch HOD department analytics
   * @param {string} userId - Authenticated HOD user UUID
   */
  async getDepartmentAnalytics(userId) {
    if (!userId) {
      throw new Error('User ID is required for department analytics.');
    }

    try {
      // 1. Resolve HOD Department dynamically via DB: departments.hod_id = userId
      const { data: deptRow, error: deptErr } = await supabase
        .from('departments')
        .select('id, department_name, hod_id')
        .eq('hod_id', userId)
        .maybeSingle();

      if (deptErr) {
        console.error('Error resolving HOD department:', deptErr.message);
        throw deptErr;
      }

      if (!deptRow) {
        return {
          department: null,
          hasDepartment: false,
          activeInternshipCount: 0,
          attendanceAverage: 0.0,
          completionPercentage: 0.0,
          currentMonthProgressAvg: null,
          hasProgressData: false,
        };
      }

      const departmentId = deptRow.id;

      // 2. Fetch students belonging to this department
      const { data: studentProfiles, error: studErr } = await supabase
        .from('student_profiles')
        .select('user_id')
        .eq('department_id', departmentId);

      if (studErr) {
        console.error('Error fetching department students:', studErr.message);
        throw studErr;
      }

      const deptStudentIds = (studentProfiles || []).map((s) => s.user_id);

      if (deptStudentIds.length === 0) {
        return {
          department: deptRow,
          hasDepartment: true,
          activeInternshipCount: 0,
          attendanceAverage: 0.0,
          completionPercentage: 0.0,
          currentMonthProgressAvg: null,
          hasProgressData: false,
        };
      }

      // 3. Fetch internships for department students
      const { data: deptInternships, error: intErr } = await supabase
        .from('internships')
        .select('id, student_id, status')
        .in('student_id', deptStudentIds);

      if (intErr) {
        console.error('Error fetching department internships:', intErr.message);
        throw intErr;
      }

      const totalInternships = deptInternships?.length || 0;
      const activeInternships = (deptInternships || []).filter((i) => i.status === 'ACTIVE');
      const completedInternships = (deptInternships || []).filter((i) => i.status === 'COMPLETED');

      const activeInternshipCount = activeInternships.length;
      const completedCount = completedInternships.length;
      const completionPercentage = totalInternships > 0
        ? Math.round((completedCount / totalInternships) * 1000) / 10
        : 0.0;

      const deptInternshipIds = (deptInternships || []).map((i) => i.id);

      // 4. Calculate Department Attendance Average (% PRESENT)
      let attendanceAverage = 0.0;
      if (deptInternshipIds.length > 0) {
        const { data: attRows, error: attErr } = await supabase
          .from('attendance')
          .select('status')
          .in('internship_id', deptInternshipIds);

        if (!attErr && attRows && attRows.length > 0) {
          const presentCount = attRows.filter((r) => r.status === 'PRESENT').length;
          attendanceAverage = Math.round((presentCount / attRows.length) * 1000) / 10;
        }
      }

      // 5. Calculate Current-Month Progress AVG for Active Internships (BLK-3 Decision)
      const activeInternshipIds = activeInternships.map((i) => i.id);
      let currentMonthProgressAvg = null;
      let hasProgressData = false;

      if (activeInternshipIds.length > 0) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data: progressRows, error: progErr } = await supabase
          .from('weekly_monthly_progress')
          .select('progress_score, created_at')
          .in('internship_id', activeInternshipIds)
          .gte('created_at', startOfMonth);

        if (!progErr && progressRows && progressRows.length > 0) {
          const totalScore = progressRows.reduce((sum, r) => sum + Number(r.progress_score || 0), 0);
          currentMonthProgressAvg = Math.round((totalScore / progressRows.length) * 10) / 10;
          hasProgressData = true;
        }
      }

      return {
        department: deptRow,
        hasDepartment: true,
        activeInternshipCount,
        attendanceAverage,
        completionPercentage,
        currentMonthProgressAvg,
        hasProgressData,
      };
    } catch (err) {
      console.error('hodService.getDepartmentAnalytics error:', err.message || err);
      throw err;
    }
  },
};
