import { supabase } from '../supabase/client.js';
import {
  getISOWeekRange,
  getISOMonthRange,
  calculateElapsedWorkingDays,
  calculateAttendancePct,
  calculateTaskMetrics,
  calculateWorkLogPct,
  calculateProgressScore,
  classifyRiskLevel,
} from '../utils/progressAggregator.js';

export const progressService = {
  /**
   * Compute real-time progress metrics from live evidence tables without forcing DB persistence
   */
  async calculateLiveProgress(internshipId, periodType = 'MONTHLY', targetDateInput = new Date()) {
    if (!internshipId) return null;

    const typeUpper = (periodType || 'MONTHLY').toUpperCase();

    // Fetch master internship record
    const { data: internship, error: intErr } = await supabase
      .from('internships')
      .select('id, student_id, start_date, end_date, status, created_at')
      .eq('id', internshipId)
      .single();

    if (intErr || !internship) return null;

    // 1. Resolve student's true activity start date
    let intStart = internship.start_date ? new Date(internship.start_date) : null;

    const { data: firstAtt } = await supabase
      .from('attendance')
      .select('attendance_date, created_at')
      .eq('internship_id', internshipId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    let firstActivityDate = null;
    if (firstAtt?.attendance_date) {
      firstActivityDate = new Date(firstAtt.attendance_date);
    } else if (firstAtt?.created_at) {
      firstActivityDate = new Date(firstAtt.created_at);
    } else if (internship.created_at) {
      firstActivityDate = new Date(internship.created_at);
    }

    // 2. Determine target period window
    let period;
    if (typeUpper === 'OVERALL') {
      const baseStart = intStart || firstActivityDate || new Date();
      let intEnd = internship.end_date ? new Date(internship.end_date) : null;
      if (!intEnd) {
        intEnd = new Date(baseStart);
        intEnd.setMonth(intEnd.getMonth() + 3);
      }
      period = {
        periodKey: 'OVERALL',
        startDate: baseStart,
        endDate: intEnd,
      };
    } else if (typeUpper === 'WEEKLY') {
      period = getISOWeekRange(targetDateInput);
    } else {
      period = getISOMonthRange(targetDateInput);
    }

    if (!period) return null;

    // 3. Benchmark effective start: use firstActivityDate or intStart if after period.startDate
    let effectiveStart = period.startDate;
    if (firstActivityDate && firstActivityDate > effectiveStart) {
      effectiveStart = firstActivityDate;
    }
    if (intStart && intStart > effectiveStart) {
      effectiveStart = intStart;
    }

    const now = new Date();
    const effectiveEnd = now < period.endDate ? now : period.endDate;

    const elapsedWorkingDays = calculateElapsedWorkingDays(effectiveStart, effectiveEnd);

    const isoStartStr = period.startDate.toISOString();
    const isoEndStr = period.endDate.toISOString();

    // Attendance evidence
    const { data: attRows } = await supabase
      .from('attendance')
      .select('id')
      .eq('internship_id', internshipId)
      .gte('created_at', typeUpper === 'OVERALL' ? '2020-01-01T00:00:00.000Z' : isoStartStr)
      .lte('created_at', isoEndStr);

    const presentCount = attRows ? attRows.length : 0;

    // Work logs evidence
    const { data: logRows } = await supabase
      .from('work_logs')
      .select('id')
      .eq('internship_id', internshipId)
      .gte('submitted_at', typeUpper === 'OVERALL' ? '2020-01-01T00:00:00.000Z' : isoStartStr)
      .lte('submitted_at', isoEndStr);

    const workLogCount = logRows ? logRows.length : 0;

    // Tasks evidence
    const { data: taskRows } = await supabase
      .from('tasks')
      .select('id, created_at')
      .eq('internship_id', internshipId)
      .gte('created_at', typeUpper === 'OVERALL' ? '2020-01-01T00:00:00.000Z' : isoStartStr)
      .lte('created_at', isoEndStr);

    const assignedTasksCount = taskRows ? taskRows.length : 0;
    let submittedTasksCount = 0;
    const gradeRatingsArray = [];

    if (assignedTasksCount > 0) {
      const taskIds = taskRows.map((t) => t.id);
      const { data: subRows } = await supabase
        .from('task_submissions')
        .select('id, task_id, grade_rating')
        .in('task_id', taskIds);

      if (subRows) {
        submittedTasksCount = subRows.length;
        subRows.forEach((s) => {
          if (s.grade_rating !== null && s.grade_rating !== undefined) {
            gradeRatingsArray.push(parseFloat(s.grade_rating));
          }
        });
      }
    }

    const attPct = calculateAttendancePct(presentCount, elapsedWorkingDays);
    const taskMetrics = calculateTaskMetrics(assignedTasksCount, submittedTasksCount, gradeRatingsArray);
    const logPct = calculateWorkLogPct(workLogCount, elapsedWorkingDays);

    const progressScore = calculateProgressScore(attPct, taskMetrics.combinedTaskScore, logPct);

    const hasAnyActivity = presentCount > 0 || workLogCount > 0 || submittedTasksCount > 0;
    const riskLevel = classifyRiskLevel(progressScore, hasAnyActivity);

    return {
      internship_id: internshipId,
      student_id: internship.student_id,
      period_type: typeUpper,
      attendance_pct: attPct,
      task_completion_pct: taskMetrics.taskCompletionPct,
      work_log_count: workLogCount,
      progress_score: progressScore,
      risk_level: riskLevel,
      ai_summary: `Evidence-based aggregate: ${presentCount} check-ins, ${workLogCount} work logs, ${submittedTasksCount}/${assignedTasksCount} tasks completed.`,
      created_at: new Date().toISOString(),
    };
  },

  /**
   * Calculate and persist progress metrics for an active internship and period
   */
  async calculateAndPersistProgress(internshipId, periodType = 'MONTHLY', targetDateInput = new Date()) {
    const calculated = await this.calculateLiveProgress(internshipId, periodType, targetDateInput);
    if (!calculated) return null;

    try {
      const typeUpper = (periodType || 'MONTHLY').toUpperCase();
      const period = typeUpper === 'WEEKLY' ? getISOWeekRange(targetDateInput) : getISOMonthRange(targetDateInput);

      const isoStartStr = period.startDate.toISOString();
      const isoEndStr = period.endDate.toISOString();

      const { data: existingSnapshots } = await supabase
        .from('weekly_monthly_progress')
        .select('id')
        .eq('internship_id', internshipId)
        .eq('period_type', typeUpper)
        .gte('created_at', isoStartStr)
        .lte('created_at', isoEndStr)
        .order('created_at', { ascending: false });

      if (existingSnapshots && existingSnapshots.length > 0) {
        const existingId = existingSnapshots[0].id;
        const { data: updated, error: upErr } = await supabase
          .from('weekly_monthly_progress')
          .update(calculated)
          .eq('id', existingId)
          .select()
          .single();

        if (!upErr && updated) return updated;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('weekly_monthly_progress')
          .insert(calculated)
          .select()
          .single();

        if (!insErr && inserted) return inserted;
      }
    } catch (saveErr) {
      // If RLS blocks client-side write, fall back safely to calculated in-memory snapshot
      console.warn('Persisting progress snapshot restricted by RLS; using live calculated metrics:', saveErr.message || saveErr);
    }

    return calculated;
  },

  /**
   * Fetch progress history for student's active internship
   */
  async getStudentProgressHistory(studentUserId) {
    if (!studentUserId) return { weekly: [], monthly: [], current: null };
    try {
      const { data: internship } = await supabase
        .from('internships')
        .select('id, start_date')
        .eq('student_id', studentUserId)
        .maybeSingle();

      if (!internship) return { weekly: [], monthly: [], current: null };

      // Query persistent DB snapshots
      const { data: rows } = await supabase
        .from('weekly_monthly_progress')
        .select('*')
        .eq('internship_id', internship.id)
        .order('created_at', { ascending: false });

      let weekly = (rows || []).filter((r) => r.period_type === 'WEEKLY');
      let monthly = (rows || []).filter((r) => r.period_type === 'MONTHLY');

      // Always calculate live real-time snapshots for overall, current week, and current month
      const liveOverall = await this.calculateLiveProgress(internship.id, 'OVERALL');
      const liveWeekly = await this.calculateLiveProgress(internship.id, 'WEEKLY');
      const liveMonthly = await this.calculateLiveProgress(internship.id, 'MONTHLY');

      if (liveWeekly) {
        const currentWeekStart = getISOWeekRange(new Date())?.startDate.toISOString().substring(0, 10);
        const pastWeekly = (rows || []).filter((r) => {
          if (r.period_type !== 'WEEKLY') return false;
          const rStart = getISOWeekRange(new Date(r.created_at))?.startDate.toISOString().substring(0, 10);
          return rStart !== currentWeekStart;
        });
        weekly = [liveWeekly, ...pastWeekly];
      }

      if (liveMonthly) {
        const currentMonthKey = new Date().toISOString().substring(0, 7); // e.g. '2026-08'
        const pastMonthly = (rows || []).filter(
          (r) => r.period_type === 'MONTHLY' && !r.created_at.startsWith(currentMonthKey)
        );
        monthly = [liveMonthly, ...pastMonthly];
      }

      const current = liveOverall || (monthly.length > 0 ? monthly[0] : weekly.length > 0 ? weekly[0] : null);

      return { overall: liveOverall, weekly, monthly, current };
    } catch (err) {
      console.error('progressService.getStudentProgressHistory error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch mentee progress snapshots for faculty mentor
   */
  async getFacultyMenteeProgress(facultyUserId) {
    if (!facultyUserId) return [];
    try {
      const { data: mentor } = await supabase
        .from('faculty_mentors')
        .select('id')
        .eq('user_id', facultyUserId)
        .maybeSingle();

      if (!mentor) return [];

      const { data: internships } = await supabase
        .from('internships')
        .select('id, student_id, internship_title, users:student_id(full_name, email), companies:company_id(company_name)')
        .eq('faculty_id', mentor.id);

      if (!internships || internships.length === 0) return [];

      const internshipIds = internships.map((i) => i.id);
      const intMap = new Map(internships.map((i) => [i.id, i]));

      const { data: snapshots } = await supabase
        .from('weekly_monthly_progress')
        .select('*')
        .in('internship_id', internshipIds)
        .order('created_at', { ascending: false });

      const results = [];
      const coveredIds = new Set();

      if (snapshots && snapshots.length > 0) {
        snapshots.forEach((snap) => {
          results.push({
            ...snap,
            internship: intMap.get(snap.internship_id) || null,
          });
          coveredIds.add(snap.internship_id);
        });
      }

      // Compute live fallback for any mentee without persistent snapshot
      for (const int of internships) {
        if (!coveredIds.has(int.id)) {
          const live = await this.calculateLiveProgress(int.id, 'MONTHLY');
          if (live) {
            results.push({
              ...live,
              internship: int,
            });
          }
        }
      }

      return results;
    } catch (err) {
      console.error('progressService.getFacultyMenteeProgress error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch department intern progress snapshots for HOD
   */
  async getHODDepartmentProgress(hodUserId) {
    if (!hodUserId) return [];
    try {
      const { data: dept } = await supabase
        .from('departments')
        .select('id, department_name')
        .eq('hod_id', hodUserId)
        .maybeSingle();

      if (!dept) return [];

      const { data: studentProfiles } = await supabase
        .from('student_profiles')
        .select('user_id, roll_number')
        .eq('department_id', dept.id);

      if (!studentProfiles || studentProfiles.length === 0) return [];

      const studentUserIds = studentProfiles.map((sp) => sp.user_id);

      const { data: internships } = await supabase
        .from('internships')
        .select('id, student_id, internship_title, users:student_id(full_name, email), companies:company_id(company_name)')
        .in('student_id', studentUserIds);

      if (!internships || internships.length === 0) return [];

      const internshipIds = internships.map((i) => i.id);
      const intMap = new Map(internships.map((i) => [i.id, i]));

      const { data: snapshots } = await supabase
        .from('weekly_monthly_progress')
        .select('*')
        .in('internship_id', internshipIds)
        .order('created_at', { ascending: false });

      const results = [];
      const coveredIds = new Set();

      if (snapshots && snapshots.length > 0) {
        snapshots.forEach((snap) => {
          results.push({
            ...snap,
            internship: intMap.get(snap.internship_id) || null,
            department: dept,
          });
          coveredIds.add(snap.internship_id);
        });
      }

      for (const int of internships) {
        if (!coveredIds.has(int.id)) {
          const live = await this.calculateLiveProgress(int.id, 'MONTHLY');
          if (live) {
            results.push({
              ...live,
              internship: int,
              department: dept,
            });
          }
        }
      }

      return results;
    } catch (err) {
      console.error('progressService.getHODDepartmentProgress error:', err.message || err);
      throw err;
    }
  },
};
