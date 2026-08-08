import { supabase } from '../supabase/client';

const isValidUUID = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const companyAttendanceService = {
  /**
   * Fetch All Company Assigned Student Attendance Punch-In Records
   */
  async fetchCompanyAttendanceRecords(companyUserId) {
    if (!companyUserId) return [];

    let logsList = [];

    // 1. Fetch from Supabase
    try {
      const { data: attendanceLogs } = await supabase
        .from('attendance')
        .select('*');
      if (attendanceLogs && attendanceLogs.length > 0) {
        logsList.push(...attendanceLogs);
      }
    } catch {
      // Safe fallback
    }

    // 2. Fetch from LocalStorage for instant cross-portal sync
    try {
      const localLogs = JSON.parse(localStorage.getItem('student_attendance_logs') || '[]');
      if (localLogs && localLogs.length > 0) {
        localLogs.forEach((ll) => {
          if (!logsList.some((l) => l.id === ll.id)) {
            logsList.unshift(ll);
          }
        });
      }
    } catch {
      // Safe fallback
    }

    if (logsList.length === 0) {
      return [];
    }

    return logsList.map((log) => ({
      id: log.id,
      studentId: log.student_id || log.internship_id || 'std-101',
      studentName: log.student_name || 'Vishal Bhelave',
      rollNumber: log.roll_number || 'EN-2026-STD',
      department: 'Computer Engineering',
      companyName: log.company_name || 'TechCorp Solutions Pvt Ltd',
      attendanceDate: log.attendance_date || new Date().toISOString().slice(0, 10),
      punchInTime: log.punch_in_time || '09:15 AM',
      punchOutTime: log.punch_out_time || '06:00 PM',
      workLocation: log.work_location || 'TechCorp Development Center',
      geolocationCoordinates: log.geolocation_coordinates || '18.5204° N, 73.8567° E',
      photoUrl: null,
      studentRemarks: log.remarks || 'Daily industry attendance punch-in.',
      status: log.status || 'Pending Verification',
      supervisorRemarks: '',
      verifiedBy: log.verified_by || null,
      createdAt: log.created_at || new Date().toISOString(),
    }));
  },

  /**
   * Verify Student Industry Attendance (Mark Present)
   */
  async verifyAttendance(companyUserId, attendanceId, { remarks }) {
    // 1. LocalStorage Update
    try {
      const localLogs = JSON.parse(localStorage.getItem('student_attendance_logs') || '[]');
      const updated = localLogs.map((l) => {
        if (l.id === attendanceId) {
          return { ...l, status: 'Verified Present', remarks: remarks || 'Verified by Company Mentor' };
        }
        return l;
      });
      localStorage.setItem('student_attendance_logs', JSON.stringify(updated));
    } catch {
      // Safe fallback
    }

    // 2. Supabase Update
    try {
      const isRealUser = isValidUUID(companyUserId) && !companyUserId.startsWith('00000000-');
      if (isRealUser && isValidUUID(attendanceId)) {
        await supabase
          .from('attendance')
          .update({
            status: 'Verified Present',
            verified_by: companyUserId,
            remarks: remarks || 'Industry attendance verified by Company Supervisor',
          })
          .eq('id', attendanceId);
      }

      await this.logAttendanceAuditAction({
        userId: companyUserId,
        action: `Verified Attendance #${attendanceId} as Present`,
      });
    } catch {
      // Safe fallback
    }

    return true;
  },

  /**
   * Mark Student Attendance as Late
   */
  async markLateAttendance(companyUserId, attendanceId, { remarks }) {
    try {
      const isRealUser = isValidUUID(companyUserId) && !companyUserId.startsWith('00000000-');
      if (isRealUser && isValidUUID(attendanceId)) {
        await supabase
          .from('attendance')
          .update({
            status: 'Late',
            verified_by: companyUserId,
            remarks: remarks || 'Marked Late by Company Supervisor',
          })
          .eq('id', attendanceId);
      }

      await this.logAttendanceAuditAction({
        userId: companyUserId,
        action: `Marked Attendance #${attendanceId} as Late`,
      });

      return true;
    } catch {
      return true;
    }
  },

  /**
   * Mark Student Attendance as Absent
   */
  async markAbsentAttendance(companyUserId, attendanceId, { remarks }) {
    try {
      const isRealUser = isValidUUID(companyUserId) && !companyUserId.startsWith('00000000-');
      if (isRealUser && isValidUUID(attendanceId)) {
        await supabase
          .from('attendance')
          .update({
            status: 'Absent',
            verified_by: companyUserId,
            remarks: remarks || 'Marked Absent by Company Supervisor',
          })
          .eq('id', attendanceId);
      }

      await this.logAttendanceAuditAction({
        userId: companyUserId,
        action: `Marked Attendance #${attendanceId} as Absent`,
      });

      return true;
    } catch {
      return true;
    }
  },

  /**
   * Bulk Verify Selected Attendance Records
   */
  async bulkVerifyAttendance(companyUserId, attendanceIds = []) {
    try {
      const isRealUser = isValidUUID(companyUserId) && !companyUserId.startsWith('00000000-');
      if (isRealUser && attendanceIds.length > 0) {
        await supabase
          .from('attendance')
          .update({
            status: 'Verified Present',
            verified_by: companyUserId,
            remarks: 'Bulk verified present by Company Supervisor',
          })
          .in('id', attendanceIds);
      }

      await this.logAttendanceAuditAction({
        userId: companyUserId,
        action: `Bulk Verified ${attendanceIds.length} Attendance Record(s)`,
      });

      return true;
    } catch {
      return true;
    }
  },

  /**
   * Log Audit Action for Attendance Operations
   */
  async logAttendanceAuditAction({ userId, action }) {
    try {
      const isRealUser = isValidUUID(userId) && !userId.startsWith('00000000-');
      await supabase.from('audit_logs').insert({
        user_id: isRealUser ? userId : null,
        action: action || 'Company Attendance Action',
        module: 'Company Mentor Portal',
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Fallback
    }
  },
};
