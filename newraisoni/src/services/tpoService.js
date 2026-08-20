import { supabase } from '../supabase/client.js';

export const tpoService = {
  /**
   * Fetch pending offer letters for TPO verification queue
   */
  async getPendingOffers() {
    try {
      const { data, error } = await supabase
        .from('offer_letters')
        .select(`
          id,
          application_id,
          student_id,
          company_id,
          file_url,
          verification_status,
          verified_by,
          verified_at,
          created_at,
          companies (
            id,
            company_name,
            industry,
            website,
            address
          ),
          users:student_id (
            id,
            full_name,
            email,
            phone
          ),
          internship_applications (
            id,
            posting_id,
            status,
            applied_at,
            internship_postings (
              id,
              title,
              mode,
              stipend,
              duration,
              work_location
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending offer letters for TPO:', error.message);
        throw error;
      }

      // Fetch student academic profiles for department/roll_number context
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map((o) => o.student_id))];
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('user_id, roll_number, department, year, semester, cgpa')
          .in('user_id', studentIds);

        const profileMap = new Map();
        if (profiles) {
          profiles.forEach((p) => profileMap.set(p.user_id, p));
        }

        return data.map((offer) => ({
          ...offer,
          student_profile: profileMap.get(offer.student_id) || null,
        }));
      }

      return data || [];
    } catch (err) {
      console.error('tpoService.getPendingOffers error:', err.message || err);
      throw err;
    }
  },

  /**
   * Generate secure signed URL for viewing private offer letter PDF
   * @param {string} filePath - Path in offer_letters bucket ({student_id}/filename.pdf)
   */
  async getSignedOfferUrl(filePath) {
    if (!filePath) return null;
    try {
      const { data, error } = await supabase.storage
        .from('offer_letters')
        .createSignedUrl(filePath, 3600); // 1 hour expiration

      if (error) {
        console.error('Error generating signed URL:', error.message);
        throw error;
      }

      return data?.signedUrl || null;
    } catch (err) {
      console.error('tpoService.getSignedOfferUrl error:', err.message || err);
      throw err;
    }
  },

  /**
   * Verify or Reject an offer letter (TPO Authoritative Action)
   * @param {string} offerId - Offer letter UUID
   * @param {string} status - Decision ('TPO_VERIFIED' | 'REJECTED')
   * @param {string} tpoUserId - Authenticated TPO user UUID
   */
  async verifyOfferLetter(offerId, status, tpoUserId) {
    if (!offerId || !status || !tpoUserId) {
      throw new Error('Offer ID, Decision Status, and TPO User ID are required.');
    }

    const validDecisions = ['TPO_VERIFIED', 'REJECTED'];
    if (!validDecisions.includes(status)) {
      throw new Error(`Invalid TPO decision '${status}'. Must be TPO_VERIFIED or REJECTED.`);
    }

    try {
      // 1. Update public.offer_letters
      const { data: updatedOffer, error: updateErr } = await supabase
        .from('offer_letters')
        .update({
          verification_status: status,
          verified_by: tpoUserId,
          verified_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select(`
          *,
          companies (
            id,
            company_name
          ),
          internship_applications (
            id,
            posting_id,
            internship_postings (
              id,
              title,
              work_location
            )
          )
        `)
        .single();

      if (updateErr) {
        console.error('Error updating offer letter status:', updateErr.message);
        throw updateErr;
      }

      // 2. If decision is TPO_VERIFIED -> Create/Update master record in public.internships
      if (status === 'TPO_VERIFIED') {
        const posting = updatedOffer.internship_applications?.internship_postings || {};
        const title = posting.title || 'Verified Internship';
        const workLocation = posting.work_location || 'Company Office';

        // Find company_mentor_id if available
        let companyMentorId = null;
        const { data: mentorRow } = await supabase
          .from('company_mentors')
          .select('id')
          .eq('company_id', updatedOffer.company_id)
          .maybeSingle();

        if (mentorRow) {
          companyMentorId = mentorRow.id;
        }

        // Check if master internship row already exists for student
        const { data: existingInternship } = await supabase
          .from('internships')
          .select('id')
          .eq('student_id', updatedOffer.student_id)
          .maybeSingle();

        if (existingInternship) {
          // Update existing master record
          await supabase
            .from('internships')
            .update({
              company_id: updatedOffer.company_id,
              company_mentor_id: companyMentorId,
              offer_letter_id: offerId,
              internship_title: title,
              work_location: workLocation,
              status: 'TPO_VERIFIED', // Must remain TPO_VERIFIED (not Active)
            })
            .eq('id', existingInternship.id);
        } else {
          // Insert new master record
          await supabase
            .from('internships')
            .insert({
              student_id: updatedOffer.student_id,
              company_id: updatedOffer.company_id,
              company_mentor_id: companyMentorId,
              offer_letter_id: offerId,
              internship_title: title,
              work_location: workLocation,
              status: 'TPO_VERIFIED', // Must remain TPO_VERIFIED (not Active)
            });
        }
      }

      return updatedOffer;
    } catch (err) {
      console.error('tpoService.verifyOfferLetter error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch verified internships requiring faculty mentor assignment (status IN ['TPO_VERIFIED', 'FACULTY_ASSIGNED'])
   */
  async getVerifiedInternshipsForAssignment() {
    try {
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
          created_at,
          companies (
            id,
            company_name,
            industry
          ),
          users:student_id (
            id,
            full_name,
            email,
            phone
          ),
          faculty_mentors:faculty_id (
            id,
            user_id,
            department_id,
            designation,
            users:user_id (
              id,
              full_name,
              email
            )
          )
        `)
        .in('status', ['TPO_VERIFIED', 'FACULTY_ASSIGNED'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verified internships for assignment:', error.message);
        throw error;
      }

      if (!internships || internships.length === 0) return [];

      // Fetch student academic profiles for department context
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
      }));
    } catch (err) {
      console.error('tpoService.getVerifiedInternshipsForAssignment error:', err.message || err);
      throw err;
    }
  },

  /**
   * Assign a Faculty Mentor to a verified internship
   * @param {string} internshipId - Internship UUID
   * @param {string} facultyMentorId - Faculty Mentor UUID (public.faculty_mentors.id)
   */
  async assignFacultyMentor(internshipId, facultyMentorId) {
    if (!internshipId || !facultyMentorId) {
      throw new Error('Internship ID and Faculty Mentor ID are required.');
    }

    try {
      const { data: updatedInternship, error } = await supabase
        .from('internships')
        .update({
          faculty_id: facultyMentorId,
          status: 'FACULTY_ASSIGNED', // Transition to FACULTY_ASSIGNED (DO NOT set to ACTIVE)
        })
        .eq('id', internshipId)
        .select(`
          *,
          faculty_mentors (
            id,
            user_id,
            designation,
            users (
              full_name,
              email
            )
          )
        `)
        .single();

      if (error) {
        console.error('Error assigning faculty mentor:', error.message);
        throw error;
      }

      return updatedInternship;
    } catch (err) {
      console.error('tpoService.assignFacultyMentor error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch Institution-wide TPO Analytics
   */
  async getInstitutionalAnalytics() {
    try {
      // 1. Active Internship Count (status = 'ACTIVE')
      const { data: activeRows, error: activeErr } = await supabase
        .from('internships')
        .select('id')
        .eq('status', 'ACTIVE');

      if (activeErr) {
        console.error('Error fetching active internships:', activeErr.message);
        throw activeErr;
      }

      const activeInternshipCount = activeRows?.length || 0;

      // 2. Completed Internship Count (status = 'COMPLETED')
      const { data: completedRows, error: compErr } = await supabase
        .from('internships')
        .select('id')
        .eq('status', 'COMPLETED');

      if (compErr) {
        console.error('Error fetching completed internships:', compErr.message);
        throw compErr;
      }

      const completedCount = completedRows?.length || 0;

      // 3. PPO Offered Count (status = 'Offered')
      const { data: ppoRows, error: ppoErr } = await supabase
        .from('ppo_records')
        .select('id')
        .eq('status', 'Offered');

      if (ppoErr) {
        console.error('Error fetching PPO records:', ppoErr.message);
        throw ppoErr;
      }

      const ppoOfferedCount = ppoRows?.length || 0;
      const ppoConversionRate = completedCount > 0
        ? Math.round((ppoOfferedCount / completedCount) * 1000) / 10
        : 0.0;

      // 4. Stipend Text Analytics (BLK-2 Decision: Real text strings from live DB)
      const { data: postings, error: postErr } = await supabase
        .from('internship_postings')
        .select('id, title, stipend, company_id, companies:company_id(company_name)');

      if (postErr) {
        console.error('Error fetching postings for stipend analytics:', postErr.message);
        throw postErr;
      }

      const stipendDistribution = {};
      (postings || []).forEach((p) => {
        const val = p.stipend || 'Unspecified';
        stipendDistribution[val] = (stipendDistribution[val] || 0) + 1;
      });

      // 5. Placement Readiness (BLK-1 Decision: Formula Not Defined)
      const placementReadiness = {
        isDefined: false,
        message: 'Placement Readiness — Formula Not Defined',
      };

      return {
        activeInternshipCount,
        completedCount,
        ppoOfferedCount,
        ppoConversionRate,
        stipendAnalytics: {
          distribution: stipendDistribution,
          postingsCount: postings?.length || 0,
          samplePostings: postings || [],
        },
        placementReadiness,
      };
    } catch (err) {
      console.error('tpoService.getInstitutionalAnalytics error:', err.message || err);
      throw err;
    }
  },
};

