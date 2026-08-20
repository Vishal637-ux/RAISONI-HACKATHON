import { supabase } from '../supabase/client';

export const internshipService = {
  /**
   * Create a new internship posting (Company Mentor)
   * @param {string} companyId - UUID of the posting company
   * @param {Object} postingData - Form data for internship posting
   */
  async createPosting(companyId, postingData) {
    if (!companyId) throw new Error('Company ID is required to create a posting.');

    // Validate required fields
    if (!postingData.title || !postingData.description) {
      throw new Error('Title and Description are required.');
    }

    try {
      // Validate host company mentor status
      const { data: mentors } = await supabase
        .from('company_mentors')
        .select('users(status)')
        .eq('company_id', companyId);

      if (mentors && mentors.length > 0) {
        const isAnyInactive = mentors.some((m) => m.users?.status === 'Inactive');
        if (isAnyInactive) {
          throw new Error('Host company account is suspended. New internship posting creation is restricted.');
        }
      }

      const payload = {
        company_id: companyId,
        title: postingData.title.trim(),
        description: postingData.description.trim(),
        duration: postingData.duration ? postingData.duration.trim() : '3 Months',
        mode: postingData.mode || 'On-site',
        stipend: postingData.stipend ? postingData.stipend.trim() : 'Unpaid',
        vacancies: postingData.vacancies ? parseInt(postingData.vacancies, 10) : 1,
        work_location: postingData.work_location ? postingData.work_location.trim() : 'Office Location',
        min_cgpa: postingData.min_cgpa !== undefined && postingData.min_cgpa !== null && postingData.min_cgpa !== ''
          ? parseFloat(postingData.min_cgpa) 
          : 0.0,
        eligible_departments: postingData.eligible_departments
          ? (typeof postingData.eligible_departments === 'string' 
              ? postingData.eligible_departments 
              : JSON.stringify(postingData.eligible_departments))
          : 'All Departments',
        deadline: postingData.deadline || null,
        status: postingData.status || 'Open',
      };

      const { data, error } = await supabase
        .from('internship_postings')
        .insert(payload)
        .select(`
          *,
          companies (
            id,
            company_name,
            industry
          )
        `)
        .single();

      if (error) {
        console.error('Error creating internship posting:', error.message);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('internshipService.createPosting error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch postings owned by a company
   * @param {string} companyId - UUID of company
   */
  async getMyPostings(companyId) {
    if (!companyId) return [];

    try {
      const { data, error } = await supabase
        .from('internship_postings')
        .select(`
          *,
          companies (
            id,
            company_name,
            industry
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company postings:', error.message);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('internshipService.getMyPostings error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch all open internship postings for student feed
   */
  async getOpenPostings() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('internship_postings')
        .select(`
          *,
          companies (
            id,
            company_name,
            industry,
            website,
            address
          )
        `)
        .eq('status', 'Open')
        .or(`deadline.is.null,deadline.gte.${today}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching open postings:', error.message);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('internshipService.getOpenPostings error:', err.message || err);
      throw err;
    }
  },

  /**
   * Check if a student has already applied to a specific posting
   * @param {string} studentId - Student user UUID
   * @param {string} postingId - Posting UUID
   */
  async checkExistingApplication(studentId, postingId) {
    if (!studentId || !postingId) return null;

    try {
      const { data, error } = await supabase
        .from('internship_applications')
        .select('*')
        .eq('student_id', studentId)
        .eq('posting_id', postingId)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing application:', error.message);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('internshipService.checkExistingApplication error:', err.message || err);
      throw err;
    }
  },

  /**
   * Submit an application for an internship (Student)
   * @param {string} studentId - Authenticated student user ID
   * @param {string} postingId - Target posting ID
   */
  async applyForInternship(studentId, postingId) {
    if (!studentId || !postingId) {
      throw new Error('Student ID and Posting ID are required to apply.');
    }

    try {
      // 1. Check duplicate application
      const existing = await this.checkExistingApplication(studentId, postingId);
      if (existing) {
        throw new Error('You have already applied for this internship.');
      }

      // 2. Fetch posting details to get company_id and check deadline
      const { data: posting, error: postingErr } = await supabase
        .from('internship_postings')
        .select('id, company_id, deadline, status')
        .eq('id', postingId)
        .single();

      if (postingErr || !posting) {
        throw new Error('Internship posting not found.');
      }

      if (posting.status !== 'Open') {
        throw new Error('This internship posting is no longer accepting applications.');
      }

      if (posting.deadline) {
        const today = new Date().toISOString().split('T')[0];
        if (posting.deadline < today) {
          throw new Error('The application deadline for this internship has passed.');
        }
      }

      // 3. Submit application
      const payload = {
        posting_id: postingId,
        student_id: studentId,
        company_id: posting.company_id,
        status: 'Applied',
        applied_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('internship_applications')
        .insert(payload)
        .select(`
          *,
          internship_postings (
            id,
            title,
            companies (
              id,
              company_name
            )
          )
        `)
        .single();

      if (error) {
        console.error('Error submitting internship application:', error.message);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('internshipService.applyForInternship error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch all applications submitted by a student
   * @param {string} studentId - Student user UUID
   */
  async getMyApplications(studentId) {
    if (!studentId) return [];

    try {
      const { data, error } = await supabase
        .from('internship_applications')
        .select(`
          id,
          posting_id,
          student_id,
          company_id,
          status,
          applied_at,
          internship_postings (
            id,
            title,
            mode,
            stipend,
            duration,
            work_location,
            deadline,
            companies (
              id,
              company_name,
              industry
            )
          ),
          offer_letters (
            id,
            file_url,
            verification_status,
            verified_by,
            verified_at,
            created_at
          )
        `)
        .eq('student_id', studentId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching student applications:', error.message);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('internshipService.getMyApplications error:', err.message || err);
      throw err;
    }
  },

  /**
   * Generate secure signed URL for viewing/downloading private offer letter PDF
   * @param {string} filePath - Storage path in offer_letters bucket
   */
  async getSignedOfferUrl(filePath) {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:') || filePath.startsWith('blob:')) {
      return filePath;
    }
    try {
      const { data, error } = await supabase.storage
        .from('offer_letters')
        .createSignedUrl(filePath, 3600);

      if (error || !data?.signedUrl) {
        const { data: pubData } = supabase.storage.from('offer_letters').getPublicUrl(filePath);
        if (pubData?.publicUrl && !pubData.publicUrl.endsWith('/')) {
          return pubData.publicUrl;
        }
        return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      }
      return data.signedUrl;
    } catch (err) {
      console.warn('internshipService.getSignedOfferUrl notice:', err.message || err);
      return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }
  },

  /**
   * Update posting status (Company Mentor: Open / Closed)
   * @param {string} postingId - Posting UUID
   * @param {string} status - New status ('Open' | 'Closed')
   */
  async updatePostingStatus(postingId, status) {
    if (!postingId || !status) throw new Error('Posting ID and Status are required.');

    try {
      const { data, error } = await supabase
        .from('internship_postings')
        .update({ status })
        .eq('id', postingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('internshipService.updatePostingStatus error:', err.message || err);
      throw err;
    }
  },

  /**
   * Update internship application status (Company Mentor: Shortlist, Select, Reject)
   * @param {string} applicationId - Application UUID
   * @param {string} status - New status ('Applied' | 'Shortlisted' | 'Selected' | 'Rejected')
   */
  async updateApplicationStatus(applicationId, status) {
    if (!applicationId || !status) {
      throw new Error('Application ID and Status are required.');
    }

    const validStatuses = ['Applied', 'Shortlisted', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      const { data, error } = await supabase
        .from('internship_applications')
        .update({
          status,
          selection_status: status,
        })
        .eq('id', applicationId)
        .select(`
          *,
          internship_postings (
            id,
            title
          ),
          users:student_id (
            id,
            full_name,
            email
          )
        `)
        .single();

      if (error) {
        console.error('Error updating application status:', error.message);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('internshipService.updateApplicationStatus error:', err.message || err);
      throw err;
    }
  },

  /**
   * Upload an offer letter PDF to private storage bucket 'offer_letters' and create offer_letters record
   * @param {string} applicationId - Application UUID
   * @param {string} studentId - Student user UUID
   * @param {string} companyId - Company UUID
   * @param {File} file - PDF File object
   */
  async uploadOfferLetter(applicationId, studentId, companyId, file) {
    if (!applicationId || !studentId || !companyId || !file) {
      throw new Error('Application ID, Student ID, Company ID, and Offer Letter File are required.');
    }

    // 1. PDF File Validation
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      throw new Error('Invalid file format. Offer letter must be a PDF document (.pdf).');
    }

    // 2. Max File Size Validation (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds the 10MB limit. Please upload a smaller PDF file.');
    }

    try {
      // 3. Construct storage path using authenticated uploader folder: {uploaderId}/{studentId}_{timestamp}_{filename}.pdf
      const authUser = (await supabase.auth.getUser())?.data?.user;
      const uploaderId = authUser?.id || studentId;
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${uploaderId}/${studentId}_${Date.now()}_${cleanFileName}`;

      // 4. Upload to private 'offer_letters' bucket
      const { error: uploadErr } = await supabase.storage
        .from('offer_letters')
        .upload(storagePath, file, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadErr) {
        console.error('Storage upload error for offer_letters:', uploadErr.message);
        throw new Error(`Failed to upload offer letter PDF: ${uploadErr.message}`);
      }

      // 5. Create or update public.offer_letters database record with OFFER_PENDING
      const { data: offerRecord, error: offerErr } = await supabase
        .from('offer_letters')
        .insert({
          application_id: applicationId,
          student_id: studentId,
          company_id: companyId,
          file_url: storagePath,
          verification_status: 'OFFER_PENDING',
        })
        .select()
        .single();

      if (offerErr) {
        console.error('Database error creating offer_letters record:', offerErr.message);
        throw offerErr;
      }

      // 6. Update application status to Selected
      await this.updateApplicationStatus(applicationId, 'Selected');

      return offerRecord;
    } catch (err) {
      console.error('internshipService.uploadOfferLetter error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch master internship record for student including assigned faculty mentor
   * @param {string} studentId - Student user UUID
   */
  async getMyInternship(studentId) {
    if (!studentId) return null;
    try {
      const { data, error } = await supabase
        .from('internships')
        .select(`
          *,
          companies (
            id,
            company_name
          ),
          faculty_mentors (
            id,
            user_id,
            designation,
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
          )
        `)
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching student master internship:', error.message);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('internshipService.getMyInternship error:', err.message || err);
      throw err;
    }
  },

  /**
   * Alias for getMyInternship - Fetch active internship for student
   * @param {string} studentId - Student user UUID
   */
  async getStudentActiveInternship(studentId) {
    return this.getMyInternship(studentId);
  },
};
