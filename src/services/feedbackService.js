import { supabase } from '../supabase/client';

export const feedbackService = {
  /**
   * Fetch active internship for authenticated student.
   * Returns null if no active internship (Approved or Ongoing) exists.
   */
  async fetchActiveInternship(studentId) {
    if (!studentId) return null;

    try {
      let { data: internshipData, error } = await supabase
        .from('internships')
        .select(`
          id,
          student_id,
          company_id,
          internship_title,
          start_date,
          end_date,
          status,
          company:companies (
            company_name
          )
        `)
        .eq('student_id', studentId)
        .in('status', ['Approved', 'Ongoing'])
        .maybeSingle();

      if (error) {
        const { data: simpleData, error: simpleError } = await supabase
          .from('internships')
          .select('id, student_id, company_id, internship_title, start_date, end_date, status')
          .eq('student_id', studentId)
          .in('status', ['Approved', 'Ongoing'])
          .maybeSingle();

        if (simpleError || !simpleData) return null;
        internshipData = simpleData;

        if (internshipData.company_id) {
          try {
            const { data: comp } = await supabase
              .from('companies')
              .select('company_name')
              .eq('id', internshipData.company_id)
              .maybeSingle();
            if (comp) internshipData.company = comp;
          } catch {
            // Optional fallback
          }
        }
      }

      if (!internshipData) return null;

      return {
        id: internshipData.id,
        title: internshipData.internship_title || 'Internship',
        startDate: internshipData.start_date || null,
        endDate: internshipData.end_date || null,
        status: internshipData.status || 'Ongoing',
        companyName: internshipData.company?.company_name || 'Assigned Company',
      };
    } catch {
      return null;
    }
  },

  /**
   * Fetch feedback entries for authenticated student
   */
  async fetchStudentFeedback(studentId) {
    if (!studentId) return { activeInternship: null, records: [] };

    const activeInternship = await this.fetchActiveInternship(studentId);

    if (!activeInternship) {
      return { activeInternship: null, records: [] };
    }

    try {
      let { data: feedbackData, error } = await supabase
        .from('mentor_feedback')
        .select(`
          id,
          internship_id,
          evaluator_id,
          evaluator_role,
          rating,
          feedback_text,
          submitted_at,
          evaluator:users!mentor_feedback_evaluator_id_fkey (
            full_name
          )
        `)
        .eq('internship_id', activeInternship.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        const { data: simpleFeedback, error: simpleErr } = await supabase
          .from('mentor_feedback')
          .select('id, internship_id, evaluator_id, evaluator_role, rating, feedback_text, submitted_at')
          .eq('internship_id', activeInternship.id)
          .order('submitted_at', { ascending: false });

        if (simpleErr || !simpleFeedback) {
          return { activeInternship, records: [] };
        }
        feedbackData = simpleFeedback;
      }

      const formattedRecords = (feedbackData || []).map((fb) => ({
        id: fb.id,
        internshipId: fb.internship_id,
        evaluatorId: fb.evaluator_id,
        evaluatorName: fb.evaluator?.full_name || (fb.evaluator_role || 'Mentor'),
        evaluatorRole: fb.evaluator_role || 'Mentor',
        rating: fb.rating ? Number(fb.rating) : 5,
        feedbackText: fb.feedback_text || '',
        submittedAt: fb.submitted_at || null,
      }));

      return {
        activeInternship,
        records: formattedRecords,
      };
    } catch {
      return { activeInternship, records: [] };
    }
  },

  /**
   * Fetch feedback summary metrics
   */
  async fetchFeedbackSummary(studentId) {
    const { activeInternship, records } = await this.fetchStudentFeedback(studentId);

    if (!activeInternship || !records || records.length === 0) {
      return {
        avgRating: '0.0',
        facultyReviewsCount: 0,
        companyReviewsCount: 0,
      };
    }

    const totalScore = records.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const avgRating = (totalScore / records.length).toFixed(1);

    const facultyReviewsCount = records.filter(
      (r) => r.evaluatorRole?.toLowerCase().includes('faculty')
    ).length;

    const companyReviewsCount = records.filter(
      (r) => r.evaluatorRole?.toLowerCase().includes('company') || r.evaluatorRole?.toLowerCase().includes('industry')
    ).length;

    return {
      avgRating,
      facultyReviewsCount,
      companyReviewsCount,
    };
  },
};
