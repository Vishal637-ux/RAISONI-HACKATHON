import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { workLogService } from '../../services/workLogService';
import { WorkLogTimeline } from '../../components/student/WorkLogTimeline';
import { BookOpen, RefreshCw, AlertCircle, Filter } from 'lucide-react';

export const FacultyWorkLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const menteeLogs = await workLogService.getFacultyWorkLogs(user.id);
      setLogs(menteeLogs || []);
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

  // Extract list of unique assigned mentees from loaded logs
  const menteeMap = new Map();
  (logs || []).forEach((log) => {
    const sId = log.internships?.student_id;
    if (sId && !menteeMap.has(sId)) {
      const sUser = log.internships?.users || {};
      const sProf = log.internships?.student_profile || {};
      const name = sUser.full_name || sUser.email || 'Student Candidate';
      const dept = sProf.departments?.department_name || '';
      menteeMap.set(sId, { id: sId, name, dept });
    }
  });

  const menteeList = Array.from(menteeMap.values());

  const filteredLogs = selectedStudentId === 'ALL'
    ? logs
    : logs.filter((log) => log.internships?.student_id === selectedStudentId);

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
              Review daily work logs, deliverables, and learnings recorded by your assigned student candidates.
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

        {/* Student Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#18201B]">
            <Filter className="w-4 h-4 text-[#2F8F46]" />
            <span>Filter Work Logs by Mentee:</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 text-xs bg-white border border-[#E1E7E2] rounded-lg font-semibold text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
            >
              <option value="ALL">All Assigned Mentees ({logs.length} Total Entries)</option>
              {menteeList.map((m) => (
                <option key={m.id} value={m.id}>
                  👤 {m.name} {m.dept ? `(${m.dept})` : ''}
                </option>
              ))}
            </select>

            {selectedStudentId !== 'ALL' && (
              <button
                onClick={() => setSelectedStudentId('ALL')}
                className="text-xs font-bold text-[#2F8F46] hover:underline shrink-0"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Work Log Timeline with Filtered Mentee Information */}
        <WorkLogTimeline logs={filteredLogs} loading={loading} showStudentInfo={true} />
      </div>
    </PortalLayout>
  );
};
