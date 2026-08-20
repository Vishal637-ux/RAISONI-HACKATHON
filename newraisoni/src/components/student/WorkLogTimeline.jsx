import React from 'react';
import { Calendar, Clock, FileText, User } from 'lucide-react';

export const WorkLogTimeline = ({ logs = [], loading = false, showStudentInfo = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
        Loading work log history records...
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Work Logs Found</h3>
        <p className="text-xs text-[#66706A]">
          There are no daily work log entries recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E1E7E2] p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#2F8F46]" />
          <h3 className="text-base font-bold text-[#18201B]">Daily Work Log History ({logs.length})</h3>
        </div>
        <span className="text-xs font-semibold text-[#1F6B32] bg-[#EAF4EC] px-2.5 py-1 rounded-full">
          Chronological Audit Log
        </span>
      </div>

      <div className="space-y-4">
        {logs.map((log) => {
          const submittedAt = new Date(log.submitted_at).toLocaleString();
          const internship = log.internships || {};
          const studentUser = internship.users || {};
          const studentProfile = internship.student_profile || {};
          const studentName = studentUser.full_name || studentUser.email || '';
          const rollNo = studentProfile.roll_number || '';
          const deptName = studentProfile.departments?.department_name || '';

          return (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-[#E1E7E2] bg-[#F8FAF9] hover:bg-white hover:border-[#2F8F46] transition-all space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E2] pb-2 text-xs">
                {showStudentInfo ? (
                  <div className="flex items-center gap-2 font-bold text-[#18201B]">
                    <User className="w-3.5 h-3.5 text-[#2F8F46]" />
                    <span>{studentName}</span>
                    {rollNo && <span className="font-mono text-[#66706A]">({rollNo})</span>}
                    {deptName && <span className="text-[#1F6B32] bg-[#EAF4EC] px-2 py-0.5 rounded text-[11px]">{deptName}</span>}
                  </div>
                ) : (
                  <div className="font-bold text-[#18201B] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2F8F46]" />
                    <span>{internship.internship_title || 'Internship Work Log Entry'}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-[#66706A]">
                  <Clock className="w-3.5 h-3.5 text-[#2F8F46]" />
                  <span>Submitted: {submittedAt}</span>
                </div>
              </div>

              <p className="text-sm text-[#18201B] leading-relaxed whitespace-pre-line pt-1">
                {log.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
