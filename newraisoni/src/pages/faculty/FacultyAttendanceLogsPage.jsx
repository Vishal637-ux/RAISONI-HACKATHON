import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceHistoryTable } from '../../components/shared/AttendanceHistoryTable';
import { Calendar, RefreshCw, AlertCircle, UserCheck } from 'lucide-react';

export const FacultyAttendanceLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const menteeLogs = await attendanceService.getFacultyAttendance(user.id);
      setLogs(menteeLogs);
    } catch (err) {
      console.error('Error loading faculty attendance logs:', err);
      setErrorMsg(err.message || 'Failed to load mentee attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <PortalLayout title="Faculty Mentee Attendance Logs" roleLabel="Faculty Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1F6B32] mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Phase 6 — Academic Mentorship Oversight</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Assigned Mentees Attendance Logs</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Read-only monitoring of daily GPS attendance entries recorded by your assigned student mentees.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh attendance records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Shared Attendance Table */}
        <AttendanceHistoryTable logs={logs} role="faculty" loading={loading} />
      </div>
    </PortalLayout>
  );
};
