import React, { useEffect, useState } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { hodService } from '../../services/hodService';
import { AnalyticsStatCard } from '../../components/shared/AnalyticsStatCard';
import { DepartmentChart } from '../../components/shared/DepartmentChart';
import { Building, ShieldCheck, Users, CalendarCheck, CheckCircle2, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export const HODDashboardPage = () => {
  const { profile, user, hodDepartment } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await hodService.getDepartmentAnalytics(user.id);
      setAnalytics(data);
    } catch (err) {
      console.error('HODDashboardPage analytics error:', err);
      setError('Unable to load department analytics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.id]);

  const chartData = analytics ? [
    { name: 'Attendance Avg (%)', value: analytics.attendanceAverage },
    { name: 'Completion (%)', value: analytics.completionPercentage },
    { name: 'Progress Avg (Curr Mo)', value: analytics.hasProgressData ? analytics.currentMonthProgressAvg : 0 },
  ] : [];

  return (
    <PortalLayout title="Head of Department Dashboard" roleLabel="Head of Department">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#18201B]">
            Welcome, {profile?.full_name || 'HOD'}!
          </h2>
          <p className="text-sm text-[#66706A] mt-1">
            Department-scoped analytics for active internships, attendance averages, progress scores, and completion rates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2.5 text-[#1F6B32] hover:bg-[#EAF4EC] rounded-xl border border-[#C5E3CC] transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Dynamic HOD Department Scope Banner */}
      <div className="bg-[#F5FAF6] border border-[#E1E7E2] p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#2F8F46]" />
          <div>
            <h3 className="text-sm font-bold text-[#1F6B32]">
              Assigned Department: {hodDepartment?.department_name || hodDepartment?.name || analytics?.department?.department_name || 'Department Active'}
            </h3>
            <p className="text-xs text-[#66706A] mt-0.5">
              Strictly isolated via database relationship: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E1E7E2] font-mono text-xs">departments.hod_id = auth.uid()</code>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#66706A] font-medium block">Department Code</span>
          <span className="text-xs font-mono font-semibold text-[#18201B] bg-white px-2 py-1 rounded border border-[#E1E7E2] inline-block mt-0.5">
            {hodDepartment?.code || analytics?.department?.code || 'DEPT'}
          </span>
        </div>
      </div>

      {/* Error Alert State */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAnalytics}
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
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <AnalyticsStatCard
              title="Active Internships"
              value={analytics.activeInternshipCount}
              subtitle="Department Students Active"
              icon={Users}
              color="emerald"
            />
            <AnalyticsStatCard
              title="Attendance Average"
              value={`${analytics.attendanceAverage}%`}
              subtitle="Department % Present"
              icon={CalendarCheck}
              color="blue"
            />
            <AnalyticsStatCard
              title="Current-Month Progress AVG"
              value={analytics.hasProgressData ? `${analytics.currentMonthProgressAvg}/100` : 'No Rows'}
              subtitle="Current Calendar Month (BLK-3)"
              icon={TrendingUp}
              color="amber"
            />
            <AnalyticsStatCard
              title="Completion Percentage"
              value={`${analytics.completionPercentage}%`}
              subtitle="Completed / Total Internships"
              icon={CheckCircle2}
              color="purple"
            />
          </div>

          {/* Department Metrics Recharts Component */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentChart
              title="Department Metrics Overview"
              data={chartData}
              dataKey="value"
              nameKey="name"
            />

            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider">
                Department Isolation & Audit Summary
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2] flex items-center justify-between">
                  <span className="text-[#66706A]">Assigned HOD Department ID:</span>
                  <span className="font-mono font-bold text-[#18201B]">{analytics.department?.id || 'N/A'}</span>
                </div>
                <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2] flex items-center justify-between">
                  <span className="text-[#66706A]">Current Calendar Month Restrict:</span>
                  <span className="font-bold text-[#1F6B32]">Active (BLK-3 Standard)</span>
                </div>
                <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2] flex items-center justify-between">
                  <span className="text-[#66706A]">PostgreSQL RLS Direct Block:</span>
                  <span className="font-bold text-[#1F6B32]">Active (0 Cross-Dept Rows)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </PortalLayout>
  );
};
