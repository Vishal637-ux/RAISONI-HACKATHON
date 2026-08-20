import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { progressService } from '../../services/progressService';
import { ProgressSummaryCard } from '../../components/shared/ProgressSummaryCard';
import { ProgressChart } from '../../components/shared/ProgressChart';
import { Award, RefreshCw, AlertCircle } from 'lucide-react';

export const StudentProgressPage = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState({ weekly: [], monthly: [], current: null });
  const [activeTab, setActiveTab] = useState('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await progressService.getStudentProgressHistory(user.id);
      setProgressData(data);
    } catch (err) {
      console.error('Error loading student progress:', err);
      setErrorMsg(err.message || 'Failed to load internship progress metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const activeHistory = activeTab === 'WEEKLY' ? progressData.weekly : progressData.monthly;
  const currentSnapshot = activeHistory && activeHistory.length > 0 ? activeHistory[0] : progressData.current;

  return (
    <PortalLayout title="Internship Progress Aggregator" roleLabel="Student Candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <Award className="w-4 h-4" />
              <span>Evidence-Driven Aggregator</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">My Weekly & Monthly Progress</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Real-time progress score compiled from attendance check-ins (40%), task completion & grades (40%), and work logs (20%).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Selector */}
            <div className="flex items-center bg-[#F8FAF9] p-1 rounded-lg border border-[#E1E7E2]">
              <button
                onClick={() => setActiveTab('MONTHLY')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'MONTHLY'
                    ? 'bg-[#2F8F46] text-white shadow-xs'
                    : 'text-[#66706A] hover:text-[#18201B]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActiveTab('WEEKLY')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'WEEKLY'
                    ? 'bg-[#2F8F46] text-white shadow-xs'
                    : 'text-[#66706A] hover:text-[#18201B]'
                }`}
              >
                Weekly
              </button>
            </div>

            <button
              onClick={loadData}
              className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
              title="Refresh progress metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            Aggregating progress metrics from database...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Progress Summary Card */}
            <ProgressSummaryCard progress={currentSnapshot} title={`${activeTab} Progress Snapshot`} />

            {/* Performance Trend Chart */}
            <ProgressChart history={activeHistory} title={`${activeTab} Progress Score Trend`} periodType={activeTab} />
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
