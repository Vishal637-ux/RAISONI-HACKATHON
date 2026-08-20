import React, { useEffect, useState } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { AnalyticsStatCard } from '../../components/shared/AnalyticsStatCard';
import { DepartmentChart } from '../../components/shared/DepartmentChart';
import { Shield, Users, Building, FileText, Activity, AlertCircle, RefreshCw, Clock } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { profile, user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, logsData] = await Promise.all([
        adminService.getSystemAnalytics(),
        adminService.getAuditLogs(20),
      ]);
      setAnalytics(statsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('AdminDashboardPage data error:', err);
      setError('Unable to load system analytics or audit logs from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const roleChartData = analytics?.roleCounts ? [
    { name: 'Students', count: analytics.roleCounts.student },
    { name: 'Faculty', count: analytics.roleCounts.faculty_mentor },
    { name: 'Company Mentors', count: analytics.roleCounts.company_mentor },
    { name: 'HODs', count: analytics.roleCounts.hod },
    { name: 'TPOs', count: analytics.roleCounts.tpo },
    { name: 'Admins', count: analytics.roleCounts.admin },
  ] : [];

  return (
    <PortalLayout title="Admin Dashboard" roleLabel="College Administrator">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#18201B]">
            Welcome, {profile?.full_name || 'System Admin'}!
          </h2>
          <p className="text-sm text-[#66706A] mt-1">
            Global system governance, platform user metrics, company engagement statistics, and real PostgreSQL audit log inspection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2.5 text-[#1F6B32] hover:bg-[#EAF4EC] rounded-xl border border-[#C5E3CC] transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Refresh System Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAdminData}
            className="px-3 py-1 bg-white border border-[#FCA5A5] text-[#991B1B] font-bold rounded-lg hover:bg-[#FEE2E2]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#E1E7E2] rounded-xl" />
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <AnalyticsStatCard
              title="Total Platform Users"
              value={analytics.roleCounts.total}
              subtitle="Registered User Accounts"
              icon={Users}
              color="emerald"
            />
            <AnalyticsStatCard
              title="Registered Companies"
              value={analytics.companyCount}
              subtitle="Host Organization Partners"
              icon={Building}
              color="blue"
            />
            <AnalyticsStatCard
              title="Internship Postings"
              value={analytics.postingCount}
              subtitle="Live Opportunity Postings"
              icon={FileText}
              color="amber"
            />
            <AnalyticsStatCard
              title="Master Internships"
              value={analytics.internshipCount}
              subtitle="Created Master Records"
              icon={Activity}
              color="purple"
            />
          </div>

          {/* User Role Distribution & Audit Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentChart
              title="Platform User Distribution by Role"
              data={roleChartData}
              dataKey="count"
              nameKey="name"
            />

            {/* Real Audit Log Inspection Stream */}
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1F6B32]" />
                  <span>Real Audit Log Stream (public.audit_logs)</span>
                </h4>
                <span className="text-[11px] font-mono text-[#66706A] bg-[#F8FAF9] px-2 py-0.5 rounded border border-[#E1E7E2]">
                  {auditLogs.length} Events
                </span>
              </div>

              {auditLogs.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#18201B]">{log.action}</span>
                        <span className="text-[10px] font-mono text-[#66706A]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#66706A]">
                        <span>User: {log.users?.full_name || log.user_id || 'System'}</span>
                        <span className="font-semibold text-[#1F6B32]">{log.module || 'SYSTEM'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#66706A] bg-[#F8FAF9] rounded-xl border border-[#E1E7E2]">
                  No audit log entries currently recorded in PostgreSQL database.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </PortalLayout>
  );
};
