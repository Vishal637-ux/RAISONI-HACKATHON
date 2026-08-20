import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { progressService } from '../../services/progressService';
import { ProgressSummaryCard } from '../../components/shared/ProgressSummaryCard';
import { Award, RefreshCw, AlertCircle, Users } from 'lucide-react';

export const FacultyStudentProgressPage = () => {
  const { user } = useAuth();
  const [menteeProgress, setMenteeProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await progressService.getFacultyMenteeProgress(user.id);
      setMenteeProgress(data || []);
    } catch (err) {
      console.error('Error loading mentee progress:', err);
      setErrorMsg(err.message || 'Failed to load mentee progress overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <PortalLayout title="Assigned Mentee Progress" roleLabel="Faculty Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <Award className="w-4 h-4" />
              <span>Mentorship Oversight Engine</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Assigned Mentee Progress Overview</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Real-time evidence-driven progress scores and risk classifications for student candidates assigned to your mentorship.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh progress data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            Loading mentee progress records...
          </div>
        ) : menteeProgress.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">No Mentee Progress Records Found</h3>
            <p className="text-xs text-[#66706A]">
              Progress metrics will appear here automatically once assigned mentees engage in active internship activities.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {menteeProgress.map((snap, idx) => {
              const studentName = snap.internship?.users?.full_name || 'Assigned Mentee';
              const companyName = snap.internship?.companies?.company_name || 'Host Organization';
              const uniqueKey = snap.id || snap.internship_id || `mentee-progress-${idx}`;

              return (
                <div key={uniqueKey} className="space-y-2">
                  <div className="px-2 text-xs font-bold text-[#1F6B32] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2F8F46]" />
                    <span>Mentee: {studentName} ({companyName})</span>
                  </div>
                  <ProgressSummaryCard progress={snap} title={`Mentee: ${studentName}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
