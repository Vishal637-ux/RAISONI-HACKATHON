import { supabase } from '../supabase/client.js';

export const ppoService = {
  /**
   * Record or update PPO placement details (Idempotent per internship)
   * @param {object} ppoData - { internshipId, studentId, companyId, status, designation, ctc }
   */
  async recordPPO(ppoData) {
    if (!ppoData || !ppoData.internshipId || !ppoData.studentId) {
      throw new Error('Internship ID and Student ID are required to record a PPO.');
    }

    let { internshipId, studentId, companyId, status = 'Offered', designation, ctc } = ppoData;

    if (!companyId) {
      const { data: intRec } = await supabase
        .from('internships')
        .select('company_id')
        .eq('id', internshipId)
        .maybeSingle();

      companyId = intRec?.company_id;
    }

    if (!companyId) {
      throw new Error('Company ID could not be resolved for this internship.');
    }

    const validStatuses = ['Offered', 'Accepted', 'Rejected', 'Pending'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid PPO status '${status}'. Must be one of: ${validStatuses.join(', ')}.`);
    }

    if (!designation || !designation.trim()) {
      throw new Error('PPO designation is required.');
    }

    const numericCTC = parseFloat(ctc);
    if (isNaN(numericCTC) || numericCTC <= 0) {
      throw new Error('CTC must be a positive numerical value (in LPA).');
    }

    try {
      // Check for existing PPO record to maintain single record per internship
      const { data: existing } = await supabase
        .from('ppo_records')
        .select('id')
        .eq('internship_id', internshipId)
        .maybeSingle();

      const payload = {
        internship_id: internshipId,
        student_id: studentId,
        company_id: companyId,
        status,
        designation: designation.trim(),
        ctc: numericCTC,
      };

      let result;
      if (existing) {
        // Update existing
        const { data: updated, error: upErr } = await supabase
          .from('ppo_records')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();

        if (upErr) throw upErr;
        result = updated;
      } else {
        // Insert new
        const { data: inserted, error: insErr } = await supabase
          .from('ppo_records')
          .insert(payload)
          .select()
          .single();

        if (insErr) throw insErr;
        result = inserted;
      }

      return result;
    } catch (err) {
      console.error('ppoService.recordPPO error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch PPO record for candidate student (Dual resolution by student_id & internship_id)
   * @param {string} studentUserId - Authenticated student user UUID
   */
  async getPPOForStudent(studentUserId) {
    if (!studentUserId) return null;
    try {
      // 1. Query directly by student_id
      const { data: ppo, error } = await supabase
        .from('ppo_records')
        .select('*, companies:company_id(company_name), internships:internship_id(internship_title)')
        .eq('student_id', studentUserId)
        .maybeSingle();

      if (error) throw error;
      if (ppo) return ppo;

      // 2. Fallback query by student candidate's internship_id
      const { data: internship } = await supabase
        .from('internships')
        .select('id')
        .eq('student_id', studentUserId)
        .maybeSingle();

      if (internship?.id) {
        const { data: ppoByInt, error: intPPOErr } = await supabase
          .from('ppo_records')
          .select('*, companies:company_id(company_name), internships:internship_id(internship_title)')
          .eq('internship_id', internship.id)
          .maybeSingle();

        if (intPPOErr) throw intPPOErr;
        return ppoByInt || null;
      }

      return null;
    } catch (err) {
      console.error('ppoService.getPPOForStudent error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch PPO records for company mentor's company
   * @param {string} companyUserId - Authenticated company mentor user ID
   */
  async getPPOsForCompany(companyUserId) {
    if (!companyUserId) return [];
    try {
      const { data: mentor } = await supabase
        .from('company_mentors')
        .select('company_id')
        .eq('user_id', companyUserId)
        .maybeSingle();

      if (!mentor?.company_id) return [];

      const { data: records, error } = await supabase
        .from('ppo_records')
        .select('*, users:student_id(full_name, email), internships:internship_id(internship_title)')
        .eq('company_id', mentor.company_id);

      if (error) throw error;
      return records || [];
    } catch (err) {
      console.error('ppoService.getPPOsForCompany error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch institutional PPO records for TPO / Admin
   */
  async getAllPPORecords() {
    try {
      const { data: records, error } = await supabase
        .from('ppo_records')
        .select('*, users:student_id(full_name, email), companies:company_id(company_name), internships:internship_id(internship_title)');

      if (error) throw error;
      return records || [];
    } catch (err) {
      console.error('ppoService.getAllPPORecords error:', err.message || err);
      throw err;
    }
  },
};
