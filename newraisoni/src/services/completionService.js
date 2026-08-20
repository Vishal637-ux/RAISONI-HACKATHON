import { supabase } from '../supabase/client.js';
import { certificateService } from './certificateService.js';
import { evaluationService } from './evaluationService.js';

export const completionService = {
  /**
   * Evaluate eligibility and resolution state of an internship for completion sign-off
   * @param {string} internshipId - Master internship UUID
   */
  async checkCompletionEligibility(internshipId) {
    if (!internshipId) {
      return {
        isEligible: false,
        hasApprovedEvaluations: false,
        reasons: ['Internship ID is required.'],
        companyEval: null,
        facultyEval: null,
        internship: null,
      };
    }

    try {
      const { data: internship, error: intErr } = await supabase
        .from('internships')
        .select('id, student_id, company_id, faculty_id, internship_title, status, users:student_id(full_name, email), companies:company_id(company_name)')
        .eq('id', internshipId)
        .maybeSingle();

      if (intErr || !internship) {
        return {
          isEligible: false,
          hasApprovedEvaluations: false,
          reasons: ['Active internship record not found.'],
          companyEval: null,
          facultyEval: null,
          internship: null,
        };
      }

      // Delegate evaluation resolution to evaluationService for 100% Phase 9 integration consistency
      const { companyEval: cEval, facultyEval: fEval } = await evaluationService.getInternshipEvaluations(internshipId);

      const hasCompanyEval = Boolean(cEval);
      const hasFacultyEval = Boolean(fEval && (fEval.academic_status || '').toUpperCase() === 'APPROVED');
      const hasApprovedEvaluations = hasCompanyEval && hasFacultyEval;

      const reasons = [];
      if (!cEval) {
        reasons.push('Company Mentor evaluation is pending.');
      }

      if (!fEval) {
        reasons.push('Faculty Mentor evaluation is pending.');
      } else if ((fEval.academic_status || '').toUpperCase() !== 'APPROVED') {
        reasons.push(`Faculty Academic Status must be 'APPROVED'. Current status is '${fEval.academic_status}'.`);
      }

      if (internship.status === 'COMPLETED') {
        reasons.push('Internship is already COMPLETED.');
      } else if (internship.status !== 'ACTIVE') {
        reasons.push(`Internship status must be 'ACTIVE'. Current status is '${internship.status}'.`);
      }

      const isEligible = internship.status === 'ACTIVE' && hasApprovedEvaluations;

      return {
        isEligible,
        hasApprovedEvaluations,
        reasons,
        companyEval: cEval || null,
        facultyEval: fEval || null,
        internship,
      };
    } catch (err) {
      console.error('completionService.checkCompletionEligibility error:', err.message || err);
      throw err;
    }
  },

  /**
   * Execute one-way completion approval transition: ACTIVE -> COMPLETED
   * @param {string} tpoUserId - Authenticated TPO / Admin user ID
   * @param {string} internshipId - Master internship UUID
   */
  async approveInternshipCompletion(tpoUserId, internshipId) {
    if (!tpoUserId || !internshipId) {
      throw new Error('TPO User ID and Internship ID are required for completion approval.');
    }

    const eligibility = await this.checkCompletionEligibility(internshipId);

    if (!eligibility.isEligible) {
      throw new Error(`Cannot approve completion: ${eligibility.reasons.join(' ')}`);
    }

    try {
      // 1. One-way transition ACTIVE -> COMPLETED
      const { data: updatedInternship, error: upErr } = await supabase
        .from('internships')
        .update({ status: 'COMPLETED' })
        .eq('id', internshipId)
        .eq('status', 'ACTIVE')
        .select()
        .single();

      if (upErr || !updatedInternship) {
        throw new Error('Failed to update internship status to COMPLETED.');
      }

      // 2. Issue Digital QR Certificate
      const certificate = await certificateService.generateCertificate(internshipId);

      return {
        internship: updatedInternship,
        certificate,
      };
    } catch (err) {
      console.error('completionService.approveInternshipCompletion error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch all active & completed internships for TPO completion queue
   */
  async getTPOCompletionQueue() {
    try {
      const { data: internships, error } = await supabase
        .from('internships')
        .select('id, student_id, company_id, faculty_id, internship_title, status, created_at, users:student_id(full_name, email), companies:company_id(company_name)')
        .in('status', ['ACTIVE', 'COMPLETED']);

      if (error) throw error;
      if (!internships || internships.length === 0) return [];

      const queue = [];
      for (const int of internships) {
        const elig = await this.checkCompletionEligibility(int.id);
        const { data: cert } = await supabase.from('certificates').select('*').eq('internship_id', int.id).maybeSingle();
        queue.push({
          internship: int,
          eligibility: elig,
          certificate: cert || null,
        });
      }

      return queue;
    } catch (err) {
      console.error('completionService.getTPOCompletionQueue error:', err.message || err);
      throw err;
    }
  },
};
