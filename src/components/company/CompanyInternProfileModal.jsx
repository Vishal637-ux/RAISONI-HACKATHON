import React, { useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { User, Briefcase, GraduationCap, Calendar, X, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

export const CompanyInternProfileModal = ({ isOpen, onClose, intern }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !intern) return null;

  const attScore = intern.attendanceScore || 94;
  const taskScore = intern.taskCompletionRate || 85;
  const wlScore = intern.workLogScore || 90;
  const overallProgress = Math.round(attScore * 0.4 + taskScore * 0.4 + wlScore * 0.2);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-intern-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-extrabold text-base shrink-0">
              {intern.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-intern-title" className="text-base font-bold text-[#171717]">
                  {intern.studentName}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#A874F7] text-white uppercase tracking-wider">
                  Technical Intern
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                {intern.rollNumber} • {intern.department} ({intern.year || '4th Year'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Technical Project Details */}
        <div className="p-4 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[#171717]">
              <Briefcase size={16} className="text-[#A874F7]" />
              <span>{intern.title}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#A874F7] border border-[#E9DDFE]">
              {intern.duration || '12 Weeks'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B7280] text-[11px] block">Technology Stack:</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {(intern.techStack || ['React', 'Node.js', 'SQL']).map((tech, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-[#E9DDFE] text-[11px] font-semibold text-[#171717]">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-[#6B7280] border-t border-[#E9DDFE]">
            <div>Start Date: <strong className="text-[#171717] font-semibold">{intern.startDate}</strong></div>
            <div>End Date: <strong className="text-[#171717] font-semibold">{intern.endDate}</strong></div>
          </div>
        </div>

        {/* Read-Only Academic Summary Section (Requirement #5) */}
        <div className="p-4 rounded-xl border border-[#E9DDFE] bg-gray-50/70 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center gap-2 font-bold text-[#171717]">
              <GraduationCap size={16} className="text-[#A874F7]" />
              <span>Institutional Academic Summary</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              READ ONLY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div>
              <span className="text-[#6B7280] block">College / University:</span>
              <span className="font-bold text-[#171717]">{intern.collegeName || 'G.H. Raisoni College of Engineering'}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">Faculty Academic Supervisor:</span>
              <span className="font-bold text-[#171717]">{intern.facultyMentorName || 'Dr. A. K. Sharma'}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">Department & Semester:</span>
              <span className="font-semibold text-[#171717]">{intern.department} (Sem {intern.semester || 7})</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">Internship Status:</span>
              <span className="font-semibold text-[#171717]">{intern.status}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">Host Organization:</span>
              <span className="font-bold text-[#A874F7]">{intern.companyName}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block">Academic Standing:</span>
              <span className="font-semibold text-emerald-700">Satisfying Degree Progress</span>
            </div>
          </div>
        </div>

        {/* 4 Technical Progress Metrics Breakdown */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <span className="text-[#6B7280] text-[10px] block">Attendance</span>
            <span className="font-bold text-emerald-700 text-xs">{attScore}%</span>
          </div>
          <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50">
            <span className="text-[#6B7280] text-[10px] block">Task %</span>
            <span className="font-bold text-blue-700 text-xs">{taskScore}%</span>
          </div>
          <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
            <span className="text-[#6B7280] text-[10px] block">Work Log %</span>
            <span className="font-bold text-[#A874F7] text-xs">{wlScore}%</span>
          </div>
          <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
            <span className="text-[#6B7280] text-[10px] block">Overall Score</span>
            <span className="font-bold text-indigo-700 text-xs">{overallProgress}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9DDFE]">
          <Button type="button" variant="primary" onClick={onClose} className="text-xs px-5">
            Close Profile
          </Button>
        </div>
      </Card>
    </div>
  );
};
