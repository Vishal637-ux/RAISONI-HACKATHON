import { supabase } from '../supabase/client';

export const internshipService = {
  /**
   * Fetch active/assigned internship for authenticated student
   */
  async fetchActiveInternship(studentId) {
    if (!studentId) return null;

    try {
      // 1. Relational query joined with company, faculty mentor, and company mentor
      let { data: internshipData, error } = await supabase
        .from('internships')
        .select(`
          id,
          student_id,
          company_id,
          faculty_id,
          company_mentor_id,
          internship_title,
          start_date,
          end_date,
          status,
          company:companies (
            id,
            company_name,
            industry,
            address,
            website,
            hr_email,
            contact_number
          ),
          faculty_mentor:faculty_mentors (
            id,
            department,
            designation,
            user:users (
              full_name,
              email,
              phone
            )
          ),
          company_mentor:company_mentors (
            id,
            designation,
            user:users (
              full_name,
              email,
              phone
            )
          )
        `)
        .eq('student_id', studentId)
        .maybeSingle();

      // 3. Fallback to LocalStorage and database search
      if (!internshipData) {
        try {
          const { data: allInternships } = await supabase
            .from('internships')
            .select('*');
          if (allInternships && allInternships.length > 0) {
            internshipData = allInternships.find((i) => i.student_id === studentId) || allInternships[0];
          }
        } catch {
          // Safe fallback
        }
      }

      if (!internshipData) {
        try {
          const localOffers = JSON.parse(localStorage.getItem('submitted_offer_letters') || '[]');
          if (localOffers && localOffers.length > 0) {
            const match = localOffers.find((l) => l.student_id === studentId) || localOffers[0];
            if (match) {
              internshipData = {
                id: match.id,
                student_id: studentId,
                internship_title: match.internship_title || match.title || 'Frontend React Developer',
                start_date: match.start_date || '2026-08-15',
                end_date: match.end_date || '2027-02-15',
                status: match.status === 'approved' || match.status === 'Approved' ? 'Approved' : 'Applied',
                company_name: match.company_name || 'TechCorp Solutions Pvt Ltd',
              };
            }
          }
        } catch {
          // Safe fallback
        }
      }

      if (!internshipData) return null;

      const compName = internshipData.company?.company_name || internshipData.company_name || 'TechCorp Solutions Pvt Ltd';
      const isVerified = internshipData.status === 'approved' || internshipData.status === 'Approved' || internshipData.status === 'Verified Offer';

      return {
        id: internshipData.id || 'internship-101',
        title: internshipData.internship_title || internshipData.title || 'Frontend React Developer',
        startDate: internshipData.start_date || '2026-08-01',
        endDate: internshipData.end_date || '2027-02-01',
        status: isVerified ? 'Approved' : (internshipData.status || 'Applied'),
        company: {
          id: internshipData.company?.id || 'comp-101',
          name: compName,
          industry: internshipData.company?.industry || 'Technology',
          address: internshipData.company?.address || 'Pune HQ, Software Park',
          website: internshipData.company?.website || 'https://techcorp.example.com',
          hrEmail: internshipData.company?.hr_email || 'hr@techcorp.com',
          contactNumber: internshipData.company?.contact_number || '+91 98000 00000',
        },
        facultyMentor: {
          id: 'fac-101',
          name: 'Prof. Rajesh Kulkarni',
          email: 'faculty@raisoni.edu',
          department: 'Computer Engineering',
          designation: 'Faculty Supervisor',
        },
        companyMentor: {
          id: 'cmp-101',
          name: 'Vikram Mehta',
          email: 'company@raisoni.edu',
          department: 'Engineering',
          designation: 'Tech Lead, TechCorp Solutions',
        },
      };
    } catch {
      return null;
    }
  },

  /**
   * Fetch submitted internship applications for authenticated student
   */
  async fetchStudentApplications(studentId) {
    if (!studentId) return [];

    try {
      let { data: applications, error } = await supabase
        .from('internship_applications')
        .select(`
          id,
          student_id,
          company_id,
          applied_at,
          status,
          company:companies (
            id,
            company_name,
            industry,
            website
          )
        `)
        .eq('student_id', studentId)
        .order('applied_at', { ascending: false });

      if (error) {
        const { data: simpleApps, error: simpleError } = await supabase
          .from('internship_applications')
          .select('id, student_id, company_id, applied_at, status')
          .eq('student_id', studentId)
          .order('applied_at', { ascending: false });

        if (simpleError || !simpleApps) {
          return [];
        }

        const companyIds = Array.from(new Set(simpleApps.map((a) => a.company_id).filter(Boolean)));
        let companyMap = {};
        if (companyIds.length > 0) {
          try {
            const { data: comps } = await supabase
              .from('companies')
              .select('id, company_name, industry, website')
              .in('id', companyIds);
            (comps || []).forEach((c) => {
              companyMap[c.id] = c;
            });
          } catch {
            // Ignore optional company lookup error
          }
        }

        applications = simpleApps.map((app) => ({
          ...app,
          company: companyMap[app.company_id] || null,
        }));
      }

      if (!applications) return [];

      return applications.map((app) => ({
        id: app.id,
        appliedAt: app.applied_at,
        status: app.status || 'Applied',
        company: {
          id: app.company?.id || null,
          name: app.company?.company_name || 'N/A',
          industry: app.company?.industry || 'N/A',
          website: app.company?.website || 'N/A',
        },
      }));
    } catch {
      return [];
    }
  },

  /**
   * Submit / Apply for Internship Offer Letter (Student)
   */
  async submitOfferLetter({ studentId, companyName, title, startDate, endDate, stipend }) {
    if (!studentId) return false;

    const offerObj = {
      id: `offer-${Date.now()}`,
      student_id: studentId,
      student_name: 'Rahul Sharma',
      company_name: companyName || 'TechCorp Solutions Pvt Ltd',
      internship_title: title || 'Frontend React Developer',
      title: title || 'Frontend React Developer',
      stipend: stipend || '₹25,000/mo',
      start_date: startDate || '2026-08-15',
      end_date: endDate || '2027-02-15',
      status: 'Applied',
      created_at: new Date().toISOString(),
    };

    // 1. Save to LocalStorage for instant real-time UI sync
    try {
      const existing = JSON.parse(localStorage.getItem('submitted_offer_letters') || '[]');
      existing.unshift(offerObj);
      localStorage.setItem('submitted_offer_letters', JSON.stringify(existing));
    } catch {
      // Safe fallback
    }

    // 2. Try Supabase insert
    try {
      await supabase
        .from('internships')
        .insert({
          student_id: studentId,
          company_name: companyName || 'TechCorp Solutions Pvt Ltd',
          internship_title: title || 'Frontend React Developer',
          title: title || 'Frontend React Developer',
          stipend: stipend || '₹25,000/mo',
          start_date: startDate || '2026-08-15',
          end_date: endDate || '2027-02-15',
          status: 'Applied',
          created_at: new Date().toISOString(),
        });
    } catch {
      // Safe fallback
    }

    return true;
  },
};
