import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { workLogService } from '../../services/workLogService';
import { internshipService } from '../../services/internshipService';
import { WorkLogForm } from '../../components/student/WorkLogForm';
import { WorkLogTimeline } from '../../components/student/WorkLogTimeline';
import { Briefcase, AlertCircle } from 'lucide-react';

export const StudentWorkLogsPage = () => {
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');

      // Fetch active internship
      const activeInt = await internshipService.getStudentActiveInternship(user.id);
      setInternship(activeInt);

      if (activeInt) {
        const studentLogs = await workLogService.getStudentWorkLogs(user.id);
        setLogs(studentLogs);
      }
    } catch (err) {
      console.error('Error loading student work logs:', err);
      setErrorMsg(err.message || 'Failed to load daily work log history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmitLog = async (description) => {
    if (!internship?.id) {
      throw new Error('No active verified internship found for daily work log submission.');
    }
    setSubmitting(true);
    try {
      await workLogService.createWorkLog(user.id, internship.id, description);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Daily Work Logs" roleLabel="Student Candidate">
      <div className="space-y-6">
        {/* Active Internship Info Header */}
        {internship ? (
          <div className="bg-[#EAF4EC] p-5 rounded-xl border border-[#C5E3CC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
                <Briefcase className="w-4 h-4" />
                <span>Active Internship Scope</span>
              </div>
              <h2 className="text-lg font-bold text-[#18201B]">{internship.internship_title}</h2>
              <p className="text-xs text-[#66706A]">
                Company: <span className="font-semibold text-[#18201B]">{internship.companies?.company_name || 'N/A'}</span>
              </p>
            </div>
            <span className="px-3 py-1 bg-[#2F8F46] text-white text-xs font-bold rounded-full">
              ACTIVE
            </span>
          </div>
        ) : (
          !loading && (
            <div className="bg-[#FEF2F2] p-5 rounded-xl border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>No active verified internship found. Work log submissions require an ACTIVE internship status.</span>
            </div>
          )
        )}

        {/* Work Log Form */}
        {internship && (
          <WorkLogForm onSubmitLog={handleSubmitLog} loading={submitting} />
        )}

        {/* Work Log Timeline */}
        <WorkLogTimeline logs={logs} loading={loading} showStudentInfo={false} />
      </div>
    </PortalLayout>
  );
};
