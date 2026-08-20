import { supabase } from '../supabase/client.js';
import { calculateHaversineDistance } from '../utils/haversine.js';

/**
 * Helper to enrich attendance logs with student profiles, departments, and user full names
 */
async function enrichAttendanceLogs(logs) {
  if (!logs || logs.length === 0) return [];

  const studentIds = [...new Set(logs.map((l) => l.internships?.student_id).filter(Boolean))];
  if (studentIds.length === 0) return logs;

  try {
    // 1. Fetch student profiles and departments
    const { data: profiles } = await supabase
      .from('student_profiles')
      .select(`
        user_id,
        roll_number,
        department_id,
        departments:department_id (
          id,
          department_name
        )
      `)
      .in('user_id', studentIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    // 2. Fetch users for full_name resolution fallback
    const { data: userRows } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', studentIds);

    const userMap = new Map((userRows || []).map((u) => [u.id, u]));

    return logs.map((log) => {
      if (log.internships) {
        const studentId = log.internships.student_id;
        if (studentId) {
          log.internships.student_profile = profileMap.get(studentId) || null;
          
          // Ensure users object is populated with full_name
          const resolvedUser = userMap.get(studentId);
          if (resolvedUser) {
            log.internships.users = resolvedUser;
          }
        }
      }
      return log;
    });
  } catch (err) {
    console.error('Error enriching attendance logs:', err);
    return logs;
  }
}

export const attendanceService = {
  /**
   * Mark daily student GPS check-in attendance
   * @param {string} studentUserId - Authenticated student user UUID
   * @param {string} internshipId - Master internship UUID
   * @param {object} gpsCoords - { latitude, longitude, accuracy }
   */
  async markGPSAttendance(studentUserId, internshipId, gpsCoords) {
    if (!studentUserId || !internshipId || !gpsCoords) {
      throw new Error('Student User ID, Internship ID, and GPS Coordinates are required.');
    }

    const { latitude, longitude, accuracy } = gpsCoords;
    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      throw new Error('Valid GPS Latitude and Longitude coordinates are required for check-in.');
    }

    try {
      // 1. Fetch master internship record
      const { data: internship, error: intErr } = await supabase
        .from('internships')
        .select(`
          id,
          student_id,
          company_id,
          faculty_id,
          status,
          latitude,
          longitude,
          allowed_radius_km,
          work_location
        `)
        .eq('id', internshipId)
        .single();

      if (intErr || !internship) {
        throw new Error('Master internship record not found.');
      }

      // Security Check: Enforce active status and student ownership
      if (internship.student_id !== studentUserId) {
        throw new Error('Unauthorized: Student does not match internship record.');
      }

      if (internship.status !== 'ACTIVE') {
        throw new Error(`Cannot record attendance for non-ACTIVE internship (current status: '${internship.status}').`);
      }

      if (internship.latitude === null || internship.longitude === null) {
        throw new Error('Work location coordinates not configured for this internship.');
      }

      // 2. Compute Haversine distance in meters
      const distanceMeters = calculateHaversineDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(internship.latitude),
        parseFloat(internship.longitude)
      );

      const allowedRadiusMeters = (internship.allowed_radius_km || 0.5) * 1000;
      const isWithinGeofence = distanceMeters <= allowedRadiusMeters;

      const geofenceStatus = isWithinGeofence ? 'VERIFIED_GEOFENCE' : 'OUT_OF_BOUNDS';
      const status = isWithinGeofence ? 'Present' : 'Flagged';
      const todayDate = new Date().toISOString().split('T')[0];

      // 3. Insert attendance row into single source of truth table
      const payload = {
        internship_id: internshipId,
        attendance_date: todayDate,
        status,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        distance_meters: distanceMeters,
        geofence_status: geofenceStatus,
      };

      const { data: attendanceRow, error: insErr } = await supabase
        .from('attendance')
        .insert(payload)
        .select()
        .single();

      if (insErr) {
        if (insErr.code === '23505' || insErr.message?.includes('unique_student_daily_attendance')) {
          throw new Error('Attendance check-in already recorded for today.');
        }
        console.error('Error inserting attendance row:', insErr.message);
        throw insErr;
      }

      return attendanceRow;
    } catch (err) {
      console.error('attendanceService.markGPSAttendance error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch attendance logs for student candidate
   * @param {string} studentUserId - Authenticated student user UUID
   */
  async getStudentAttendance(studentUserId) {
    if (!studentUserId) return [];
    try {
      const { data: internship } = await supabase
        .from('internships')
        .select('id')
        .eq('student_id', studentUserId)
        .maybeSingle();

      if (!internship) return [];

      const { data, error } = await supabase
        .from('attendance')
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
        .eq('internship_id', internship.id)
        .order('attendance_date', { ascending: false });

      if (error) throw error;
      return await enrichAttendanceLogs(data || []);
    } catch (err) {
      console.error('attendanceService.getStudentAttendance error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch attendance logs for company mentor's company interns
   * @param {string} companyUserId - Authenticated company mentor user ID
   */
  async getCompanyAttendance(companyUserId) {
    if (!companyUserId) return [];
    try {
      const { data: mentor } = await supabase
        .from('company_mentors')
        .select('company_id')
        .eq('user_id', companyUserId)
        .maybeSingle();

      if (!mentor?.company_id) return [];

      const { data: logs, error } = await supabase
        .from('attendance')
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
        .order('attendance_date', { ascending: false });

      if (error) throw error;

      // Scoped by company_id via RLS / JS filter
      const companyLogs = (logs || []).filter((l) => l.internships?.company_id === mentor.company_id);
      return await enrichAttendanceLogs(companyLogs);
    } catch (err) {
      console.error('attendanceService.getCompanyAttendance error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch attendance logs for faculty mentor's assigned mentees
   * @param {string} facultyUserId - Authenticated faculty mentor user ID
   */
  async getFacultyAttendance(facultyUserId) {
    if (!facultyUserId) return [];
    try {
      const { data: logs, error } = await supabase
        .from('attendance')
        .select(`
          *,
          internships:internship_id (
            id,
            internship_title,
            student_id,
            faculty_id,
            companies:company_id (id, company_name),
            users:student_id (id, full_name, email)
          )
        `)
        .order('attendance_date', { ascending: false });

      if (error) throw error;
      return await enrichAttendanceLogs(logs || []);
    } catch (err) {
      console.error('attendanceService.getFacultyAttendance error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch department-scoped attendance logs for HOD
   * @param {string} hodUserId - Authenticated HOD user ID
   */
  async getHODAttendance(hodUserId) {
    if (!hodUserId) return [];
    try {
      const { data: logs, error } = await supabase
        .from('attendance')
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
        .order('attendance_date', { ascending: false });

      if (error) throw error;
      return await enrichAttendanceLogs(logs || []);
    } catch (err) {
      console.error('attendanceService.getHODAttendance error:', err.message || err);
      throw err;
    }
  },

  /**
   * Company Mentor / Admin verification remarks update
   */
  async verifyAttendanceRemarks(attendanceId, mentorUserId, remarks, status = 'VERIFIED') {
    if (!attendanceId || !mentorUserId) {
      throw new Error('Attendance ID and Mentor User ID are required.');
    }

    try {
      const { data: updated, error } = await supabase
        .from('attendance')
        .update({
          remarks,
          status,
          verified_by: mentorUserId,
        })
        .eq('id', attendanceId)
        .select()
        .single();

      if (error) throw error;
      return updated;
    } catch (err) {
      console.error('attendanceService.verifyAttendanceRemarks error:', err.message || err);
      throw err;
    }
  },
};
