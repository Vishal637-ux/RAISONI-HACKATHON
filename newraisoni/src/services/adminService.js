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
