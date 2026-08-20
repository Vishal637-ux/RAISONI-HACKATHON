import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { internshipService } from '../../services/internshipService';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceMarker } from '../../components/student/AttendanceMarker';
import { AttendanceHistoryTable } from '../../components/shared/AttendanceHistoryTable';
import { Compass, RefreshCw, AlertCircle } from 'lucide-react';

export const StudentAttendancePage = () => {
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAttendanceData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');

      const masterRow = await internshipService.getMyInternship(user.id);
      setInternship(masterRow);

      if (masterRow) {
        const historyLogs = await attendanceService.getStudentAttendance(user.id);
        setLogs(historyLogs);
      }
    } catch (err) {
      console.error('Error loading student attendance:', err);
      setErrorMsg(err.message || 'Failed to load attendance record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [user]);

  return (
    <PortalLayout title="GPS Attendance Portal" roleLabel="Student">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1F6B32] mb-1">
              <Compass className="w-4 h-4" />
              <span>Phase 6 — Real-Time Geofenced Operations</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Daily GPS Check-In</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Record daily GPS attendance verified against your company's configured geofence location.
            </p>
          </div>

          <button
            onClick={loadAttendanceData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh attendance status"
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

        {/* GPS Marker Card */}
        {internship ? (
          <AttendanceMarker internship={internship} onAttendanceMarked={loadAttendanceData} />
        ) : (
          <div className="bg-white p-8 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            No verified internship record found for current student account.
          </div>
        )}

        {/* Attendance History */}
        <AttendanceHistoryTable logs={logs} role="student" loading={loading} />
      </div>
    </PortalLayout>
  );
};
