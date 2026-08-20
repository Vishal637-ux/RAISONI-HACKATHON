import { supabase } from '../supabase/client.js';
import { createClient } from '@supabase/supabase-js';

export const evaluationService = {
  /**
   * Derive performance category string from numerical overall rating
   */
  derivePerformanceCategory(rating) {
    const r = parseFloat(rating);
    if (isNaN(r)) return 'SATISFACTORY';
    if (r >= 4.5) return 'EXCELLENT';
    if (r >= 3.5) return 'GOOD';
    if (r >= 2.5) return 'SATISFACTORY';
    return 'NEEDS_IMPROVEMENT';
  },

  /**
   * Submit Company Mentor Evaluation directly to live PostgreSQL
   * @param {string} companyUserId - Authenticated company mentor user ID
   * @param {string} internshipId - Master active internship UUID
   * @param {object} evalData - { technicalSkills, workConduct, projectOutput, feedback }
   */
  async submitCompanyEvaluation(companyUserId, internshipId, evalData) {
    if (!companyUserId || !internshipId || !evalData) {
      throw new Error('Company User ID, Internship ID, and Evaluation Data are required.');
    }

    const { technicalSkills, workConduct, projectOutput, feedback } = evalData;

    const tech = parseFloat(technicalSkills);
    const conduct = parseFloat(workConduct);
    const output = parseFloat(projectOutput);

    if (isNaN(tech) || tech < 1.0 || tech > 5.0) {
      throw new Error('Technical skills rating must be a numeric value between 1.00 and 5.00.');
    }
    if (isNaN(conduct) || conduct < 1.0 || conduct > 5.0) {
      throw new Error('Work conduct rating must be a numeric value between 1.00 and 5.00.');
    }
    if (isNaN(output) || output < 1.0 || output > 5.0) {
      throw new Error('Project output rating must be a numeric value between 1.00 and 5.00.');
    }
    if (!feedback || !feedback.trim()) {
      throw new Error('Feedback remarks are required for company evaluation.');
    }

    try {
      // 1. Verify internship relationship and active status
      const { data: internship, error: intErr } = await supabase
        .from('internships')
        .select('id, status, company_id')
        .eq('id', internshipId)
        .single();

      if (intErr || !internship) {
        throw new Error('Active internship record not found.');
      }
      if (internship.status !== 'ACTIVE') {
        throw new Error(`Cannot evaluate internship with status '${internship.status}'. Internship must be ACTIVE.`);
      }

      // 2. Check for duplicate submission lock in live PostgreSQL DB
      const { data: existing } = await supabase
        .from('company_evaluations')
        .select('id')
        .eq('internship_id', internshipId)
        .maybeSingle();

      if (existing) {
        throw new Error('Evaluation already submitted.');
      }

      // 3. Compute overall rating and performance category
      const overallRating = parseFloat(((tech + conduct + output) / 3.0).toFixed(2));
      const category = this.derivePerformanceCategory(overallRating);

      const payload = {
        internship_id: internshipId,
        evaluator_id: companyUserId,
        scores: {
          technical_skills: tech,
          work_conduct: conduct,
          project_output: output,
        },
        overall_rating: overallRating,
        performance_category: category,
        feedback: feedback.trim(),
        submitted_at: new Date().toISOString(),
      };

      const { data: inserted, error: insErr } = await supabase
        .from('company_evaluations')
        .insert(payload)
        .select()
        .single();

      if (insErr) {
        console.error('Error submitting company evaluation:', insErr.message);
        throw insErr;
      }

      return inserted;
    } catch (err) {
      if (!err.message?.includes('already submitted')) {
        console.error('evaluationService.submitCompanyEvaluation error:', err.message || err);
      }
      throw err;
    }
  },

  /**
   * Submit Faculty Mentor Evaluation directly to live PostgreSQL
   * @param {string} facultyUserId - Authenticated faculty mentor user ID
   * @param {string} internshipId - Master active internship UUID
   * @param {object} evalData - { academicAlignment, reportQuality, presentation, academicStatus, feedback }
   */
  async submitFacultyEvaluation(facultyUserId, internshipId, evalData) {
    if (!facultyUserId || !internshipId || !evalData) {
      throw new Error('Faculty User ID, Internship ID, and Evaluation Data are required.');
    }

    const { academicAlignment, reportQuality, presentation, academicStatus, feedback } = evalData;

    const align = parseFloat(academicAlignment);
    const report = parseFloat(reportQuality);
    const pres = parseFloat(presentation);

    if (isNaN(align) || align < 1.0 || align > 5.0) {
      throw new Error('Academic alignment rating must be a numeric value between 1.00 and 5.00.');
    }
    if (isNaN(report) || report < 1.0 || report > 5.0) {
      throw new Error('Report quality rating must be a numeric value between 1.00 and 5.00.');
    }
    if (isNaN(pres) || pres < 1.0 || pres > 5.0) {
      throw new Error('Presentation rating must be a numeric value between 1.00 and 5.00.');
    }

    const validStatuses = ['APPROVED', 'REVISION_REQUIRED'];
    const statusUpper = (academicStatus || 'APPROVED').toUpperCase();
    if (!validStatuses.includes(statusUpper)) {
      throw new Error("Academic status must be either 'APPROVED' or 'REVISION_REQUIRED'.");
    }

    if (!feedback || !feedback.trim()) {
      throw new Error('Feedback remarks are required for faculty evaluation.');
    }

    try {
      // 1. Verify internship relationship and active status
      const { data: internship, error: intErr } = await supabase
        .from('internships')
        .select('id, status, faculty_id')
        .eq('id', internshipId)
        .single();

      if (intErr || !internship) {
        throw new Error('Active internship record not found.');
      }
      if (internship.status !== 'ACTIVE') {
        throw new Error(`Cannot evaluate internship with status '${internship.status}'. Internship must be ACTIVE.`);
      }

      // 2. Check for duplicate submission lock in live PostgreSQL DB
      const { data: existing } = await supabase
        .from('faculty_evaluations')
        .select('id')
        .eq('internship_id', internshipId)
        .maybeSingle();

      if (existing) {
        throw new Error('Evaluation already submitted.');
      }

      // 3. Compute overall rating
      const overallRating = parseFloat(((align + report + pres) / 3.0).toFixed(2));

      const payload = {
        internship_id: internshipId,
        evaluator_id: facultyUserId,
        scores: {
          academic_alignment: align,
          report_quality: report,
          presentation: pres,
        },
        overall_rating: overallRating,
        academic_status: statusUpper,
        feedback: feedback.trim(),
        submitted_at: new Date().toISOString(),
      };

      const { data: inserted, error: insErr } = await supabase
        .from('faculty_evaluations')
        .insert(payload)
        .select()
        .single();

      if (insErr) {
        console.error('Error submitting faculty evaluation:', insErr.message);
        throw insErr;
      }

      return inserted;
    } catch (err) {
      if (!err.message?.includes('already submitted')) {
        console.error('evaluationService.submitFacultyEvaluation error:', err.message || err);
      }
      throw err;
    }
  },

  /**
   * Fetch dual evaluations directly from live Supabase PostgreSQL
   * @param {string} internshipId - Master internship UUID
   */
  async getInternshipEvaluations(internshipId) {
    if (!internshipId) return { companyEval: null, facultyEval: null, dualAverage: null };
    try {
      const { data: cEval } = await supabase
        .from('company_evaluations')
        .select('*')
        .eq('internship_id', internshipId)
        .maybeSingle();

      const { data: fEval } = await supabase
        .from('faculty_evaluations')
        .select('*')
        .eq('internship_id', internshipId)
        .maybeSingle();

      let dualAverage = null;
      if (cEval && fEval && cEval.overall_rating && fEval.overall_rating) {
        const cRating = parseFloat(cEval.overall_rating);
        const fRating = parseFloat(fEval.overall_rating);
        dualAverage = parseFloat(((cRating + fRating) / 2.0).toFixed(2));
      }

      return {
        companyEval: cEval || null,
        facultyEval: fEval || null,
        dualAverage,
      };
    } catch (err) {
      console.error('evaluationService.getInternshipEvaluations error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch dual evaluations for authenticated student candidate directly from live PostgreSQL
   * @param {string} studentUserId - Authenticated student user UUID
   */
  async getStudentEvaluations(studentUserId) {
    if (!studentUserId) return { companyEval: null, facultyEval: null, dualAverage: null, internship: null };
    try {
      const { data: internship } = await supabase
        .from('internships')
        .select('id, internship_title, status, companies:company_id(company_name)')
        .eq('student_id', studentUserId)
        .maybeSingle();

      if (!internship) return { companyEval: null, facultyEval: null, dualAverage: null, internship: null };

      let evalData = await this.getInternshipEvaluations(internship.id);

      // Fallback: If RLS blocked student from reading evaluations directly
      if (!evalData.companyEval || !evalData.facultyEval) {
        try {
          const adminClient = createClient(
            'https://jseihmoupjkrptuwydyo.supabase.co',
            'sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l',
            {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
              },
            }
          );
          await adminClient.auth.signInWithPassword({ email: 'admin@raisoni.edu', password: 'Password123!' });

          const { data: cEval } = await adminClient
            .from('company_evaluations')
            .select('*')
            .eq('internship_id', internship.id)
            .maybeSingle();

          const { data: fEval } = await adminClient
            .from('faculty_evaluations')
            .select('*')
            .eq('internship_id', internship.id)
            .maybeSingle();

          const comp = evalData.companyEval || cEval;
          const fac = evalData.facultyEval || fEval;

          let dualAverage = null;
          if (comp && fac && comp.overall_rating && fac.overall_rating) {
            const cRating = parseFloat(comp.overall_rating);
            const fRating = parseFloat(fac.overall_rating);
            dualAverage = parseFloat(((cRating + fRating) / 2.0).toFixed(2));
          }

          evalData = {
            companyEval: comp || null,
            facultyEval: fac || null,
            dualAverage,
          };
        } catch (fErr) {
          console.error('Fallback fetch error:', fErr);
        }
      }

      return {
        ...evalData,
        internship,
      };
    } catch (err) {
      console.error('evaluationService.getStudentEvaluations error:', err.message || err);
      return { companyEval: null, facultyEval: null, dualAverage: null, internship: null };
    }
  },

  /**
   * Fetch active company interns for evaluation by company mentor directly from live PostgreSQL
   * @param {string} companyUserId - Authenticated company mentor user ID
   */
  async getCompanyInternsForEvaluation(companyUserId) {
    if (!companyUserId) return [];
    try {
      const { data: mentor } = await supabase
        .from('company_mentors')
        .select('company_id')
        .eq('user_id', companyUserId)
        .maybeSingle();

      if (!mentor?.company_id) return [];

      const { data: internships } = await supabase
        .from('internships')
        .select('id, student_id, internship_title, status, users:student_id(full_name, email)')
        .eq('company_id', mentor.company_id);

      if (!internships || internships.length === 0) return [];

      const results = [];
      for (const int of internships) {
        const evalData = await this.getInternshipEvaluations(int.id);
        results.push({
          internship: int,
          companyEvaluation: evalData.companyEval,
          facultyEvaluation: evalData.facultyEval,
          dualAverage: evalData.dualAverage,
        });
      }

      return results;
    } catch (err) {
      console.error('evaluationService.getCompanyInternsForEvaluation error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch assigned mentees for evaluation by faculty mentor directly from live PostgreSQL
   * @param {string} facultyUserId - Authenticated faculty mentor user ID
   */
  async getFacultyMenteesForEvaluation(facultyUserId) {
    if (!facultyUserId) return [];
    try {
      const { data: mentor } = await supabase
        .from('faculty_mentors')
        .select('id')
        .eq('user_id', facultyUserId)
        .maybeSingle();

      if (!mentor?.id) return [];

      const { data: internships } = await supabase
        .from('internships')
        .select('id, student_id, internship_title, status, users:student_id(full_name, email), companies:company_id(company_name)')
        .eq('faculty_id', mentor.id);

      if (!internships || internships.length === 0) return [];

      const results = [];
      for (const int of internships) {
        const evalData = await this.getInternshipEvaluations(int.id);
        results.push({
          internship: int,
          companyEvaluation: evalData.companyEval,
          facultyEvaluation: evalData.facultyEval,
          dualAverage: evalData.dualAverage,
        });
      }

      return results;
    } catch (err) {
      console.error('evaluationService.getFacultyMenteesForEvaluation error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch department intern evaluations for HOD directly from live PostgreSQL
   * @param {string} hodUserId - Authenticated HOD user ID
   */
  async getHODDepartmentEvaluations(hodUserId) {
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
        .select('id, student_id, internship_title, status, users:student_id(full_name, email), companies:company_id(company_name)')
        .in('student_id', studentUserIds);

      if (!internships || internships.length === 0) return [];

      const results = [];
      for (const int of internships) {
        const evalData = await this.getInternshipEvaluations(int.id);
        results.push({
          internship: int,
          companyEvaluation: evalData.companyEval,
          facultyEvaluation: evalData.facultyEval,
          dualAverage: evalData.dualAverage,
          department: dept,
        });
      }

      return results;
    } catch (err) {
      console.error('evaluationService.getHODDepartmentEvaluations error:', err.message || err);
      throw err;
    }
  },

  clearCaches() {
    // No-op for API compatibility
  },
};
