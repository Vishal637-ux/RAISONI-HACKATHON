import { supabase } from '../supabase/client';

export const facultyService = {
  /**
   * Get faculty mentor record by authenticated user ID
   * @param {string} userId - Auth user UUID
   */
  async getFacultyProfile(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('faculty_mentors')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            phone
          ),
          departments (
            id,
            department_name
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching faculty profile:', error.message);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('facultyService.getFacultyProfile error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch faculty mentors filtered by department for TPO assignment
   * @param {string} departmentId - Department UUID to match
   */
  async getEligibleFacultyMentors(departmentId = null) {
    try {
      let query = supabase
        .from('faculty_mentors')
        .select(`
          id,
          user_id,
          department_id,
          designation,
          created_at,
          users:user_id (
            id,
            full_name,
            email,
            phone
          ),
          departments:department_id (
            id,
            department_name
          )
        `)
        .order('created_at', { ascending: true });

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching eligible faculty mentors:', error.message);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('facultyService.getEligibleFacultyMentors error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch assigned student mentees for a specific faculty mentor user session
   * @param {string} facultyUserId - Authenticated faculty user UUID
   */
  async getAssignedMentees(facultyUserId) {
    if (!facultyUserId) return [];
    try {
      // 1. Get faculty mentor ID
      const facultyProfile = await this.getFacultyProfile(facultyUserId);
      if (!facultyProfile?.id) {
        return [];
      }

      // 2. Fetch internships assigned to this faculty mentor
      const { data: internships, error } = await supabase
        .from('internships')
        .select(`
          id,
          student_id,
          company_id,
          faculty_id,
          company_mentor_id,
          offer_letter_id,
          internship_title,
          status,
          work_location,
          start_date,
          end_date,
          created_at,
          companies (
            id,
            company_name,
            industry,
            address
          ),
          users:student_id (
            id,
            full_name,
            email,
            phone
          ),
          offer_letters (
            id,
            file_url,
            verification_status
          )
        `)
        .eq('faculty_id', facultyProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assigned mentees for faculty:', error.message);
        throw error;
      }

      if (!internships || internships.length === 0) return [];

      // 3. Attach student profile details (department, roll_number, year)
      const studentIds = [...new Set(internships.map((i) => i.student_id))];
      const { data: profiles } = await supabase
        .from('student_profiles')
        .select(`
          user_id,
          roll_number,
          department,
          department_id,
          year,
          semester,
          cgpa,
          departments:department_id (
            id,
            department_name
          )
        `)
        .in('user_id', studentIds);

      const profileMap = new Map();
      if (profiles) {
        profiles.forEach((p) => profileMap.set(p.user_id, p));
      }

      return internships.map((internship) => ({
        ...internship,
        student_profile: profileMap.get(internship.student_id) || null,
        faculty_profile: facultyProfile,
      }));
    } catch (err) {
      console.error('facultyService.getAssignedMentees error:', err.message || err);
      throw err;
    }
  },
};
