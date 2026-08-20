import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { workLogService } from '../../services/workLogService';
import { WorkLogTimeline } from '../../components/student/WorkLogTimeline';
import { BookOpen, RefreshCw, AlertCircle } from 'lucide-react';

export const FacultyWorkLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const menteeLogs = await workLogService.getFacultyWorkLogs(user.id);
      setLogs(menteeLogs);
    } catch (err) {
      console.error('Error loading faculty mentee work logs:', err);
      setErrorMsg(err.message || 'Failed to load mentee work logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <PortalLayout title="Mentee Daily Work Logs" roleLabel="Faculty Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Academic Mentorship Oversight</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Assigned Mentee Daily Work Logs</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Read-only history of daily work logs submitted by student candidates assigned to your mentorship.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh work logs"
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

        {/* Work Log Timeline with Mentee Information */}
        <WorkLogTimeline logs={logs} loading={loading} showStudentInfo={true} />
      </div>
    </PortalLayout>
  );
};
