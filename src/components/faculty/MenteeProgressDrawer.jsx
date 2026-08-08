import React, { useEffect } from 'react';
import { TrendingUp, CheckCircle2, AlertTriangle, ShieldAlert, X, History, Clock, FileText, Award } from 'lucide-react';

export const MenteeProgressDrawer = ({ isOpen, onClose, mentee, onOpenReviewModal }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mentee) return null;

  // Read-Only Dynamically Calculated Progress Score
  const attendanceScore = mentee.attendanceScore || 85;
  const workLogScore = mentee.workLogScore || 80;
  const overallProgress = Math.round(attendanceScore * 0.4 + workLogScore * 0.4 + 20);

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'High Risk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert size={12} />
            High Risk ⚠️
          </span>
        );
      case 'Moderate Risk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={12} />
            Moderate Risk ⚡
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            On Track ✅
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-progress-title"
    >
      <div className="w-full sm:w-[480px] bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-[#E9DDFE] flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="drawer-progress-title" className="text-base font-bold text-[#171717]">
                  Academic Progress Report
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#A874F7] text-white tracking-wider uppercase">
                  READ ONLY Academic Metrics
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                {mentee.studentName} ({mentee.rollNumber})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          {/* Top 4 Compact Read-Only Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-1">
              <span className="text-[#6B7280] text-[11px] block">Attendance %</span>
              <span className="text-lg font-bold text-emerald-700 block">{attendanceScore}%</span>
              <span className="text-[10px] text-emerald-600 font-semibold block">Regularity Baseline</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-1">
              <span className="text-[#6B7280] text-[11px] block">Work Log %</span>
              <span className="text-lg font-bold text-blue-700 block">{workLogScore}%</span>
              <span className="text-[10px] text-blue-600 font-semibold block">Submission Consistency</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-1">
              <span className="text-[#6B7280] text-[11px] block">Overall Progress %</span>
              <span className="text-lg font-bold text-[#A874F7] block">{overallProgress}%</span>
              <span className="text-[10px] text-[#A874F7] font-semibold block">Calculated Read-Only</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-1">
              <span className="text-[#6B7280] text-[11px] block">Academic Risk</span>
              <div className="pt-0.5">{getRiskBadge(mentee.riskStatus)}</div>
            </div>
          </div>

          {/* Progress Bar Container with Tooltip */}
          <div
            className="p-4 rounded-2xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-2 cursor-help"
            title={`Attendance: ${attendanceScore}% | Work Log: ${workLogScore}% | Status: ${mentee.status} | Company Feedback: Satisfactory | Overall Progress: ${overallProgress}%`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#171717]">Overall Academic Progress Bar</span>
              <span className="text-[#A874F7]">{overallProgress}%</span>
            </div>
            <div className="w-full bg-[#F3EDFF] rounded-full h-2.5 border border-[#E9DDFE]">
              <div
                className="bg-[#A874F7] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-[#6B7280] block text-center">
              Hover to view detailed metric calculation breakdown
            </span>
          </div>

          {/* Read-Only Multi-Metric Breakdown */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Multi-Metric Academic Breakdown
            </h5>

            <div className="p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Internship Status:</span>
                <span className="font-semibold text-[#171717]">{mentee.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Task Completion Rate (Read-Only):</span>
                <span className="font-bold text-[#171717]">90% Completed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Company Mentor Feedback:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Satisfactory
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280]">Host Organization:</span>
                <span className="font-semibold text-[#171717]">{mentee.companyName}</span>
              </div>
            </div>
          </div>

          {/* Chronological Mid-Term Review History */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Mid-Term Review History
            </h5>

            <div className="p-4 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-[#171717]">
                <History size={15} className="text-[#A874F7]" />
                <span>Recorded Supervisor Reviews</span>
              </div>

              <div className="space-y-2.5 relative pl-4 border-l-2 border-[#E9DDFE] ml-2">
                <div className="relative space-y-0.5">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#A874F7]" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171717]">Mid-Term Evaluation Completed</span>
                    <span className="text-[11px] text-[#6B7280]">Recorded</span>
                  </div>
                  <p className="text-[11px] text-[#4B5563]">
                    Academic progress on track. Attendance regularity and work log consistency satisfy degree requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E9DDFE] bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E9DDFE] text-xs font-semibold text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            Close Drawer
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenReviewModal) onOpenReviewModal(mentee);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#A874F7] text-white text-xs font-semibold hover:bg-[#965BEB] transition-colors cursor-pointer shadow-2xs"
          >
            {mentee.hasMidTermReview ? 'View Review' : 'Record Mid-Term Review'}
          </button>
        </div>
      </div>
    </div>
  );
};
