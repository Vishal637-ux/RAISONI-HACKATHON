import { supabase } from '../supabase/client';

export const companyService = {
  /**
   * Fetch company mentor record with joined company information
   * @param {string} userId - User UUID
   */
  async getCompanyMentorProfile(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('company_mentors')
        .select(`
          id,
          user_id,
          company_id,
          designation,
          created_at,
          companies (
            id,
            company_name,
            industry,
            website,
            address,
            created_at
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company mentor profile:', error.message);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('companyService.getCompanyMentorProfile error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch company details for a mentor user
   * @param {string} userId - User UUID
   */
  async getMyCompany(userId) {
    if (!userId) return null;
    try {
      const mentor = await this.getCompanyMentorProfile(userId);
      if (!mentor || !mentor.companies) {
        return null;
      }
      return mentor.companies;
    } catch (err) {
      console.error('companyService.getMyCompany error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch all applicants for a company's postings with student details
   * @param {string} companyId - Company UUID
   */
  async getCompanyApplicants(companyId) {
    if (!companyId) return [];

    try {
      const { data, error } = await supabase
        .from('internship_applications')
        .select(`
          id,
          posting_id,
          student_id,
          company_id,
          status,
          selection_status,
          applied_at,
          internship_postings (
            id,
            title,
            mode,
            stipend,
            duration,
            min_cgpa,
            deadline,
            status
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
            verification_status,
            created_at
          )
        `)
        .eq('company_id', companyId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching company applicants:', error.message);
        throw error;
      }

      // Fetch student profiles for detailed academic information
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map((app) => app.student_id))];
        const { data: studentProfiles } = await supabase
          .from('student_profiles')
          .select('user_id, roll_number, department, year, semester, cgpa, skills, resume_url')
          .in('user_id', studentIds);

        const profileMap = new Map();
        if (studentProfiles) {
          studentProfiles.forEach((sp) => profileMap.set(sp.user_id, sp));
        }

        return data.map((app) => ({
          ...app,
          student_profile: profileMap.get(app.student_id) || null,
        }));
      }

      return data || [];
    } catch (err) {
      console.error('companyService.getCompanyApplicants error:', err.message || err);
      throw err;
    }
  },

  /**
   * Configure physical work location & geofence parameters for an internship
   * @param {string} companyUserId - Authenticated company mentor user ID
   * @param {string} internshipId - Master internship UUID
   * @param {object} locationData - { work_location, address, latitude, longitude, allowed_radius_km }
   */
  async setupWorkLocation(companyUserId, internshipId, locationData) {
    if (!companyUserId || !internshipId || !locationData) {
      throw new Error('Company User ID, Internship ID, and Location Data are required.');
    }

    const { work_location, address, latitude, longitude, allowed_radius_km } = locationData;
    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      throw new Error('Latitude and Longitude coordinates are required for geofenced work location.');
    }

    const radiusKm = allowed_radius_km ? parseFloat(allowed_radius_km) : 0.5; // Default 500m (0.5km)

    try {
      // 1. Get mentor's company_id
      const mentorProfile = await this.getCompanyMentorProfile(companyUserId);
      if (!mentorProfile?.company_id) {
        throw new Error('Company Mentor profile or company association not found.');
      }
      const companyId = mentorProfile.company_id;

      // 2. Check if work location row already exists for this internship
      const { data: existingWl } = await supabase
        .from('work_locations')
        .select('id')
        .eq('internship_id', internshipId)
        .maybeSingle();

      let workLocRecord;
      if (existingWl) {
        // Update existing record
        const { data: updated, error: upErr } = await supabase
          .from('work_locations')
          .update({
            work_location,
            address: address || '',
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            allowed_radius_km: radiusKm,
            is_active: true,
          })
          .eq('id', existingWl.id)
          .select()
          .single();

        if (upErr) throw upErr;
        workLocRecord = updated;
      } else {
        // Insert new record
        const { data: inserted, error: insErr } = await supabase
          .from('work_locations')
          .insert({
            internship_id: internshipId,
            company_id: companyId,
            work_location,
            address: address || '',
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            allowed_radius_km: radiusKm,
            is_active: true,
          })
          .select()
          .single();

        if (insErr) throw insErr;
        workLocRecord = inserted;
      }

      // 3. Sync coordinates to master internships record
      const { error: syncErr } = await supabase
        .from('internships')
        .update({
          work_location,
          address: address || '',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          allowed_radius_km: radiusKm,
        })
        .eq('id', internshipId);

      if (syncErr) {
        console.error('Error syncing work location to internships table:', syncErr.message);
        throw syncErr;
      }

      return workLocRecord;
    } catch (err) {
      console.error('companyService.setupWorkLocation error:', err.message || err);
      throw err;
    }
  },

  /**
   * Activate an internship (FACULTY_ASSIGNED -> ACTIVE) after prerequisites are met
   * @param {string} internshipId - Master internship UUID
   * @param {string} companyUserId - Authenticated user UUID
   */
  async activateInternship(internshipId, companyUserId) {
    if (!internshipId || !companyUserId) {
      throw new Error('Internship ID and User ID are required.');
    }

    try {
      // 1. Fetch current master internship
      const { data: internship, error: fetchErr } = await supabase
        .from('internships')
        .select('*, offer_letters(*)')
        .eq('id', internshipId)
        .single();

      if (fetchErr || !internship) {
        throw new Error('Internship record not found.');
      }

      // 2. Validate activation prerequisites
      if (internship.status !== 'FACULTY_ASSIGNED') {
        throw new Error(`Cannot activate internship with status '${internship.status}'. Status must be FACULTY_ASSIGNED.`);
      }

      if (!internship.faculty_id) {
        throw new Error('Prerequisite missing: Faculty Mentor must be assigned before activation.');
      }

      if (internship.latitude === null || internship.longitude === null) {
        throw new Error('Prerequisite missing: Work location GPS coordinates must be configured before activation.');
      }

      // 3. Update status to ACTIVE
      const { data: activated, error: actErr } = await supabase
        .from('internships')
        .update({
          status: 'ACTIVE',
        })
        .eq('id', internshipId)
        .select()
        .single();

      if (actErr) throw actErr;

      return activated;
    } catch (err) {
      console.error('companyService.activateInternship error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch active company internships for a company mentor
   * @param {string} companyUserId - Authenticated company user UUID
   */
  async getCompanyActiveInternships(companyUserId) {
    if (!companyUserId) return [];
    try {
      const mentorProfile = await this.getCompanyMentorProfile(companyUserId);
      if (!mentorProfile?.company_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('internships')
        .select(`
          *,
          users:student_id (
            id,
            full_name,
            email
          ),
          companies (
            id,
            company_name
          )
        `)
        .eq('company_id', mentorProfile.company_id)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching company active internships:', error.message);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('companyService.getCompanyActiveInternships error:', err.message || err);
      throw err;
    }
  },
};

