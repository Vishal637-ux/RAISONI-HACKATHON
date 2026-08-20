import React, { useEffect, useState } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { tpoService } from '../../services/tpoService';
import { AnalyticsStatCard } from '../../components/shared/AnalyticsStatCard';
import { DepartmentChart } from '../../components/shared/DepartmentChart';
import { Briefcase, Award, DollarSign, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const TPODashboardPage = () => {
  const { profile, user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tpoService.getInstitutionalAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('TPODashboardPage analytics error:', err);
      setError('Unable to load institutional analytics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stipendChartData = analytics?.stipendAnalytics?.distribution
    ? Object.entries(analytics.stipendAnalytics.distribution).map(([label, count]) => ({
        name: label,
        count: count,
      }))
    : [];

  return (
    <PortalLayout title="TPO Dashboard" roleLabel="Training & Placement Officer">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#18201B]">
            Welcome, {profile?.full_name || 'TPO Officer'}!
          </h2>
          <p className="text-sm text-[#66706A] mt-1">
            Institutional analytics for active internships, stipend distribution, PPO conversion rates, and company engagement.
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
            <Briefcase className="w-6 h-6" />
          </div>
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

      {/* Loading Skeleton */}
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
              title="Active Internships"
              value={analytics.activeInternshipCount}
              subtitle="Current Live Internships"
              icon={Briefcase}
              color="emerald"
            />
            <AnalyticsStatCard
              title="PPO Conversion Rate"
              value={`${analytics.ppoConversionRate}%`}
              subtitle={`${analytics.ppoOfferedCount} PPOs / ${analytics.completedCount} Completed`}
              icon={Award}
              color="blue"
            />
            <AnalyticsStatCard
              title="Active Postings"
              value={analytics.stipendAnalytics.postingsCount}
              subtitle="Host Company Opportunities"
              icon={DollarSign}
              color="amber"
            />
            <AnalyticsStatCard
              title="Placement Readiness"
              value="Formula Not Defined"
              subtitle="BLK-1 Decision Active"
              icon={HelpCircle}
              color="purple"
            />
          </div>

          {/* Stipend Text Analytics Breakdown & Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentChart
              title="Stipend Distribution (Live DB Text Strings)"
              data={stipendChartData}
              dataKey="count"
              nameKey="name"
            />

            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider">
                Stipend Text Breakdown (Live Database Strings)
              </h4>
              {analytics.stipendAnalytics?.samplePostings?.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {analytics.stipendAnalytics.samplePostings.map((p) => (
                    <div key={p.id} className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#18201B] block">{p.title}</span>
                        <span className="text-[#66706A] text-[11px]">{p.companies?.company_name || 'Host Company'}</span>
                      </div>
                      <span className="font-mono font-bold px-2.5 py-1 bg-white border border-[#E1E7E2] rounded-md text-[#1F6B32]">
                        {p.stipend || 'Unspecified'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#66706A] bg-[#F8FAF9] rounded-xl border border-[#E1E7E2]">
                  No postings currently recorded in database.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </PortalLayout>
  );
};
