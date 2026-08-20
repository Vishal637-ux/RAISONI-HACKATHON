import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { progressService } from '../../services/progressService';
import { ProgressSummaryCard } from '../../components/shared/ProgressSummaryCard';
import { Award, RefreshCw, AlertCircle, Building2 } from 'lucide-react';

export const HODDepartmentProgressPage = () => {
  const { user } = useAuth();
  const [deptProgress, setDeptProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await progressService.getHODDepartmentProgress(user.id);
      setDeptProgress(data || []);
    } catch (err) {
      console.error('Error loading department progress:', err);
      setErrorMsg(err.message || 'Failed to load department progress overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <PortalLayout title="Department Progress Oversight" roleLabel="Head of Department (HOD)">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <Award className="w-4 h-4" />
              <span>Departmental Performance Engine</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Department Student Progress Overview</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Read-only evidence-driven progress scores and risk indicators for all active student interns within your academic department.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh department progress"
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
            Loading department progress records...
          </div>
        ) : deptProgress.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">No Department Progress Records Found</h3>
            <p className="text-xs text-[#66706A]">
              No active internship progress records exist for students in your department yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {deptProgress.map((snap, idx) => {
              const studentName = snap.internship?.users?.full_name || 'Department Student';
              const companyName = snap.internship?.companies?.company_name || 'Host Organization';
              const uniqueKey = snap.id || snap.internship_id || `dept-progress-${idx}`;

              return (
                <div key={uniqueKey} className="space-y-2">
                  <div className="px-2 text-xs font-bold text-[#1F6B32] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2F8F46]" />
                    <span>Student: {studentName} ({companyName})</span>
                  </div>
                  <ProgressSummaryCard progress={snap} title={`Student: ${studentName}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
