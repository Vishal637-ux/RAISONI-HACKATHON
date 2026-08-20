/**
 * Pure calculation module for InterTrack Phase 8 Progress Aggregator
 */

/**
 * Calculate Mon-Fri working days between start date and end date (inclusive)
 */
export function calculateElapsedWorkingDays(startDateInput, endDateInput) {
  if (!startDateInput || !endDateInput) return 0;

  const start = new Date(startDateInput);
  const end = new Date(endDateInput);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let count = 0;
  const cur = new Date(start);
  cur.setUTCHours(0, 0, 0, 0);

  const targetEnd = new Date(end);
  targetEnd.setUTCHours(23, 59, 59, 999);

  while (cur <= targetEnd) {
    const dayOfWeek = cur.getUTCDay();
    // Monday = 1, Tuesday = 2, ..., Friday = 5
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      count++;
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return count;
}

/**
 * Returns ISO week details { periodKey: 'YYYY-Www', startDate: Date, endDate: Date }
 * Week window: Monday 00:00:00.000 UTC to Sunday 23:59:59.999 UTC
 */
export function getISOWeekRange(dateInput = new Date()) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const utcDay = d.getUTCDay(); // Sunday = 0, Monday = 1, ...
  const diffToMonday = utcDay === 0 ? -6 : 1 - utcDay;

  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  // Compute ISO week number
  const target = new Date(monday.valueOf());
  const dayNr = (monday.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNr = 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
  const year = monday.getUTCFullYear();
  const weekStr = weekNr < 10 ? `0${weekNr}` : `${weekNr}`;

  return {
    periodKey: `${year}-W${weekStr}`,
    startDate: monday,
    endDate: sunday,
  };
}

/**
 * Returns ISO month details { periodKey: 'YYYY-MM', startDate: Date, endDate: Date }
 * Month window: 1st day 00:00:00.000 UTC to last day 23:59:59.999 UTC
 */
export function getISOMonthRange(dateInput = new Date()) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-indexed

  const firstDay = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const monthStr = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;

  return {
    periodKey: `${year}-${monthStr}`,
    startDate: firstDay,
    endDate: lastDay,
  };
}

/**
 * Calculate Attendance Percentage
 */
export function calculateAttendancePct(presentCount, elapsedWorkingDays) {
  if (!elapsedWorkingDays || elapsedWorkingDays <= 0) return 0.0;
  const pct = (presentCount / elapsedWorkingDays) * 100;
  return Math.min(100.0, Math.max(0.0, parseFloat(pct.toFixed(2))));
}

/**
 * Calculate Task Metrics: Task Completion %, Task Score %, Combined Task Score
 */
export function calculateTaskMetrics(assignedTasksCount, submittedTasksCount, gradeRatingsArray = []) {
  if (!assignedTasksCount || assignedTasksCount <= 0) {
    return {
      taskCompletionPct: 0.0,
      taskScorePct: 0.0,
      combinedTaskScore: 0.0,
    };
  }

  const completionPct = Math.min(100.0, (submittedTasksCount / assignedTasksCount) * 100);

  // Filter valid grade ratings (1.00 to 5.00)
  const validGrades = (gradeRatingsArray || []).filter((g) => typeof g === 'number' && !isNaN(g) && g >= 1.0 && g <= 5.0);

  let scorePct = 0.0;
  if (validGrades.length > 0) {
    const avgGrade = validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length;
    scorePct = (avgGrade / 5.0) * 100;
  } else if (submittedTasksCount > 0) {
    // If submissions exist but are ungraded: Task Score % = Task Completion %
    scorePct = completionPct;
  }

  const combinedTaskScore = (completionPct + scorePct) / 2;

  return {
    taskCompletionPct: parseFloat(completionPct.toFixed(2)),
    taskScorePct: parseFloat(scorePct.toFixed(2)),
    combinedTaskScore: parseFloat(combinedTaskScore.toFixed(2)),
  };
}

/**
 * Calculate Work Log Percentage
 */
export function calculateWorkLogPct(workLogCount, elapsedWorkingDays) {
  if (!elapsedWorkingDays || elapsedWorkingDays <= 0) return 0.0;
  const pct = (workLogCount / elapsedWorkingDays) * 100;
  return Math.min(100.0, Math.max(0.0, parseFloat(pct.toFixed(2))));
}

/**
 * Authoritative Progress Score Formula:
 * Progress Score = (Attendance % × 0.40) + (((Task Completion % + Task Score %) / 2) × 0.40) + (Work Log % × 0.20)
 */
export function calculateProgressScore(attendancePct, combinedTaskScore, workLogPct) {
  const att = typeof attendancePct === 'number' ? attendancePct : 0;
  const task = typeof combinedTaskScore === 'number' ? combinedTaskScore : 0;
  const log = typeof workLogPct === 'number' ? workLogPct : 0;

  const score = att * 0.40 + task * 0.40 + log * 0.20;
  return Math.min(100.0, Math.max(0.0, parseFloat(score.toFixed(2))));
}

/**
 * Classify Risk Level:
 * - NORMAL: score >= 60.00
 * - LAGGING: score >= 40.00 and < 60.00
 * - CRITICAL: score < 40.00 OR zero activity in elapsed period
 */
export function classifyRiskLevel(progressScore, hasAnyActivity = true) {
  if (!hasAnyActivity || progressScore < 40.0) {
    return 'CRITICAL';
  }
  if (progressScore >= 60.0) {
    return 'NORMAL';
  }
  return 'LAGGING';
}
