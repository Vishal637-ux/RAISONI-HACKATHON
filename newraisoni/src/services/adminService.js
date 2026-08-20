import { supabase } from '../supabase/client.js';

export const adminService = {
  /**
   * Fetch System-wide Admin Platform Metrics
   */
  async getSystemAnalytics() {
    try {
      // 1. User counts grouped by role
      const { data: users, error: userErr } = await supabase
        .from('users')
        .select('role');

      if (userErr) {
        console.error('Error fetching users for admin analytics:', userErr.message);
        throw userErr;
      }

      const roleCounts = {
        student: 0,
        faculty_mentor: 0,
        company_mentor: 0,
        tpo: 0,
        hod: 0,
        admin: 0,
        total: users?.length || 0,
      };

      (users || []).forEach((u) => {
        if (roleCounts[u.role] !== undefined) {
          roleCounts[u.role]++;
        }
      });

      // 2. Company & Postings count
      const { count: companyCount, error: compErr } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      if (compErr) {
        console.error('Error fetching company count:', compErr.message);
        throw compErr;
      }

      const { count: postingCount, error: postErr } = await supabase
        .from('internship_postings')
        .select('*', { count: 'exact', head: true });

      if (postErr) {
        console.error('Error fetching posting count:', postErr.message);
        throw postErr;
      }

      const { count: internshipCount, error: intErr } = await supabase
        .from('internships')
        .select('*', { count: 'exact', head: true });

      if (intErr) {
        console.error('Error fetching internship count:', intErr.message);
        throw intErr;
      }

      return {
        roleCounts,
        companyCount: companyCount || 0,
        postingCount: postingCount || 0,
        internshipCount: internshipCount || 0,
      };
    } catch (err) {
      console.error('adminService.getSystemAnalytics error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch all registered users for Admin Access Governance
   */
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          role,
          status,
          phone,
          created_at,
          student_profiles (
            roll_number,
            department
          ),
          faculty_mentors (
            designation,
            department
          ),
          company_mentors (
            designation,
            companies (
              company_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users for admin governance:', error.message);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('adminService.getAllUsers error:', err.message || err);
      throw err;
    }
  },

  /**
   * Update a user's account active/inactive status
   */
  async updateUserStatus(targetUserId, newStatus, currentAdminId) {
    if (!targetUserId || !newStatus) {
      throw new Error('Target User ID and new Status are required.');
    }

    if (targetUserId === currentAdminId && newStatus.toLowerCase() === 'inactive') {
      throw new Error('Security Policy Violation: You cannot deactivate your own active administrator account.');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user status:', error.message);
        throw error;
      }

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId || targetUserId,
        action: `USER_STATUS_CHANGE: ${newStatus.toUpperCase()}`,
        module: 'ADMIN_GOVERNANCE',
        details: JSON.stringify({ target_user_id: targetUserId, new_status: newStatus }),
      });

      return data;
    } catch (err) {
      console.error('adminService.updateUserStatus error:', err.message || err);
      throw err;
    }
  },

  /**
   * Assign/update a user's role
   */
  async updateUserRole(targetUserId, newRole, currentAdminId) {
    if (!targetUserId || !newRole) {
      throw new Error('Target User ID and new Role are required.');
    }

    const validRoles = ['student', 'company_mentor', 'faculty_mentor', 'tpo', 'hod', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role '${newRole}'. Must be one of: ${validRoles.join(', ')}`);
    }

    if (targetUserId === currentAdminId && newRole !== 'admin') {
      throw new Error('Security Policy Violation: You cannot revoke your own administrator role.');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error.message);
        throw error;
      }

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId || targetUserId,
        action: `USER_ROLE_REASSIGNMENT: ${newRole.toUpperCase()}`,
        module: 'ADMIN_GOVERNANCE',
        details: JSON.stringify({ target_user_id: targetUserId, new_role: newRole }),
      });

      return data;
    } catch (err) {
      console.error('adminService.updateUserRole error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch all companies with mentor count and postings count for Admin Governance
   */
  async getAllCompanies() {
    try {
      const { data: companies, error: compErr } = await supabase
        .from('companies')
        .select(`
          *,
          company_mentors (
            id,
            designation,
            users (
              id,
              full_name,
              email,
              status
            )
          ),
          internship_postings (
            id,
            title,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (compErr) {
        console.error('Error fetching companies for admin governance:', compErr.message);
        throw compErr;
      }

      return (companies || []).map((c) => ({
        ...c,
        status: c.status || 'APPROVED',
      }));
    } catch (err) {
      console.error('adminService.getAllCompanies error:', err.message || err);
      throw err;
    }
  },

  /**
   * Create a new company partner record
   */
  async createCompany(companyData, currentAdminId) {
    if (!companyData.company_name) {
      throw new Error('Company Name is required.');
    }

    try {
      const payload = {
        company_name: companyData.company_name.trim(),
        industry: companyData.industry ? companyData.industry.trim() : 'Information Technology',
        address: companyData.address ? companyData.address.trim() : 'Nagpur, Maharashtra',
        website: companyData.website ? companyData.website.trim() : null,
        hr_email: companyData.hr_email ? companyData.hr_email.trim() : null,
        contact_number: companyData.contact_number ? companyData.contact_number.trim() : null,
      };

      const { data, error } = await supabase
        .from('companies')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error creating company partner:', error.message);
        throw error;
      }

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId,
        action: 'COMPANY_CREATED',
        module: 'COMPANY_ONBOARDING',
        details: JSON.stringify({ company_id: data.id, company_name: data.company_name }),
      });

      return {
        ...data,
        status: data.status || 'APPROVED',
      };
    } catch (err) {
      console.error('adminService.createCompany error:', err.message || err);
      throw err;
    }
  },

  /**
   * Update a company partner's lifecycle status (APPROVED / SUSPENDED)
   * Reuses existing users.status ('Active' / 'Inactive') for zero schema changes
   */
  async updateCompanyStatus(companyId, newStatus, currentAdminId) {
    if (!companyId || !newStatus) {
      throw new Error('Company ID and new status are required.');
    }

    try {
      // 1. Fetch company mentor user IDs linked to this company
      const { data: mentors } = await supabase
        .from('company_mentors')
        .select('user_id')
        .eq('company_id', companyId);

      const userStatus = newStatus === 'SUSPENDED' ? 'Inactive' : 'Active';

      if (mentors && mentors.length > 0) {
        const userIds = mentors.map((m) => m.user_id);
        await supabase
          .from('users')
          .update({ status: userStatus, updated_at: new Date().toISOString() })
          .in('id', userIds);
      }

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId,
        action: `COMPANY_STATUS_CHANGED: ${newStatus.toUpperCase()}`,
        module: 'COMPANY_GOVERNANCE',
        details: JSON.stringify({ company_id: companyId, new_status: newStatus, mentor_status: userStatus }),
      });

      return { company_id: companyId, status: newStatus };
    } catch (err) {
      console.error('adminService.updateCompanyStatus error:', err.message || err);
      throw err;
    }
  },

  /**
   * Provision a Company Mentor user account linked to an approved company
   */
  async provisionCompanyMentor(userId, companyId, designation, currentAdminId) {
    if (!userId || !companyId) {
      throw new Error('User ID and Company ID are required for mentor provisioning.');
    }

    try {
      await supabase
        .from('users')
        .update({ role: 'company_mentor', status: 'Active', updated_at: new Date().toISOString() })
        .eq('id', userId);

      const { data: existing } = await supabase
        .from('company_mentors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let mentorRecord;
      if (existing) {
        const { data, error } = await supabase
          .from('company_mentors')
          .update({ company_id: companyId, designation: designation || 'Company Mentor' })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        mentorRecord = data;
      } else {
        const { data, error } = await supabase
          .from('company_mentors')
          .insert({
            user_id: userId,
            company_id: companyId,
            designation: designation || 'Company Mentor',
          })
          .select()
          .single();
        if (error) throw error;
        mentorRecord = data;
      }

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId || userId,
        action: 'COMPANY_MENTOR_PROVISIONED',
        module: 'ADMIN_GOVERNANCE',
        details: JSON.stringify({ user_id: userId, company_id: companyId, designation }),
      });

      return mentorRecord;
    } catch (err) {
      console.error('adminService.provisionCompanyMentor error:', err.message || err);
      throw err;
    }
  },

  /**
   * Provision a Faculty Mentor user account and assign department
   */
  async provisionFacultyMentor(userId, departmentId, designation, currentAdminId) {
    if (!userId || !departmentId) {
      throw new Error('User ID and Department ID are required for Faculty Mentor provisioning.');
    }

    try {
      const { data: dept, error: deptErr } = await supabase
        .from('departments')
        .select('id, department_name')
        .eq('id', departmentId)
        .single();

      if (deptErr || !dept) throw new Error('Selected department not found.');

      await supabase
        .from('users')
        .update({ role: 'faculty_mentor', status: 'Active', updated_at: new Date().toISOString() })
        .eq('id', userId);

      const { data: existing } = await supabase
        .from('faculty_mentors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let facultyRecord;
      if (existing) {
        const { data, error } = await supabase
          .from('faculty_mentors')
          .update({
            department_id: departmentId,
            department: dept.department_name,
            designation: designation || 'Assistant Professor',
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        facultyRecord = data;
      } else {
        const { data, error } = await supabase
          .from('faculty_mentors')
          .insert({
            user_id: userId,
            department_id: departmentId,
            department: dept.department_name,
            designation: designation || 'Assistant Professor',
          })
          .select()
          .single();
        if (error) throw error;
        facultyRecord = data;
      }

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId || userId,
        action: 'FACULTY_MENTOR_PROVISIONED',
        module: 'STAFF_GOVERNANCE',
        details: JSON.stringify({ user_id: userId, department_id: departmentId, designation }),
      });

      return facultyRecord;
    } catch (err) {
      console.error('adminService.provisionFacultyMentor error:', err.message || err);
      throw err;
    }
  },

  /**
   * Provision an HOD user account and assign department leadership
   */
  async provisionHOD(userId, departmentId, currentAdminId) {
    if (!userId || !departmentId) {
      throw new Error('User ID and Department ID are required for HOD provisioning.');
    }

    try {
      await supabase
        .from('users')
        .update({ role: 'hod', status: 'Active', updated_at: new Date().toISOString() })
        .eq('id', userId);

      const { data: deptData, error: deptErr } = await supabase
        .from('departments')
        .update({ hod_id: userId })
        .eq('id', departmentId)
        .select()
        .single();

      if (deptErr) throw deptErr;

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId || userId,
        action: 'HOD_PROVISIONED',
        module: 'STAFF_GOVERNANCE',
        details: JSON.stringify({ user_id: userId, department_id: departmentId }),
      });

      return deptData;
    } catch (err) {
      console.error('adminService.provisionHOD error:', err.message || err);
      throw err;
    }
  },

  /**
   * Provision a TPO Officer user account
   */
  async provisionTPO(userId, currentAdminId) {
    if (!userId) {
      throw new Error('User ID is required for TPO provisioning.');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: 'tpo', status: 'Active', updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId || userId,
        action: 'TPO_PROVISIONED',
        module: 'STAFF_GOVERNANCE',
        details: JSON.stringify({ user_id: userId }),
      });

      return data;
    } catch (err) {
      console.error('adminService.provisionTPO error:', err.message || err);
      throw err;
    }
  },

  /**
   * Assign a Faculty Mentor to a Student's Internship record
   * @param {string} internshipId - Internship UUID
   * @param {string} facultyMentorId - Faculty Mentor UUID (faculty_mentors.id)
   * @param {string} currentAdminId - Admin UUID
   */
  async assignFacultyToInternship(internshipId, facultyMentorId, currentAdminId) {
    if (!internshipId || !facultyMentorId) {
      throw new Error('Internship ID and Faculty Mentor ID are required for assignment.');
    }

    try {
      const { data, error } = await supabase
        .from('internships')
        .update({
          faculty_id: facultyMentorId,
          status: 'FACULTY_ASSIGNED',
        })
        .eq('id', internshipId)
        .select()
        .single();

      if (error) {
        console.error('Error assigning faculty mentor to internship:', error.message);
        throw error;
      }

      await supabase.from('audit_logs').insert({
        user_id: currentAdminId,
        action: 'STUDENT_FACULTY_ASSIGNED',
        module: 'ACADEMIC_GOVERNANCE',
        details: JSON.stringify({ internship_id: internshipId, faculty_id: facultyMentorId }),
      });

      return data;
    } catch (err) {
      console.error('adminService.assignFacultyToInternship error:', err.message || err);
      throw err;
    }
  },

  /**
   * Fetch real PostgreSQL Audit Log Stream (public.audit_logs)
   */
  async getAuditLogs(limit = 50) {
    try {
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          action,
          module,
          details,
          timestamp,
          users:user_id (
            full_name,
            email,
            role
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching audit logs:', error.message);
        throw error;
      }

      return logs || [];
    } catch (err) {
      console.error('adminService.getAuditLogs error:', err.message || err);
      throw err;
    }
  },
};
