import React, { useEffect } from 'react';
import { X, User, Building2, Calendar, CheckCircle2, Clock, Award, AlertTriangle, ShieldCheck, Briefcase, FileText, Activity } from 'lucide-react';

export const CompanyInternProfileDrawer = ({ isOpen, onClose, intern }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !intern) return null;

  const att = intern.attendanceScore || 85;
  const task = intern.taskCompletionRate || 80;
  const wl = intern.workLogScore || 80;
  const techEvalScore = ['Completed', 'Evaluation Submitted'].includes(intern.evaluationStatus) ? 90 : 60;
  const overallProgress = Math.round(att * 0.3 + task * 0.4 + wl * 0.2 + techEvalScore * 0.1);

  // Risk Level Calculation
  const riskLevel = overallProgress >= 85 ? 'Low Risk' : overallProgress >= 70 ? 'Medium Risk' : 'High Risk';

  const timelineSteps = [
    { title: 'Internship Assigned', date: intern.startDate || '15 Jan 2026', done: true },
    { title: 'Technical Task Assigned', date: '20 Jan 2026', done: true },
    { title: 'Work Log Submitted', date: intern.lastWorkLogDate || '03 Aug 2026', done: true },
    { title: 'Industry Attendance Verified', date: '01 Aug 2026', done: true },
    { title: 'Technical Evaluation Submitted', date: '04 Aug 2026', done: ['Completed', 'Evaluation Submitted'].includes(intern.evaluationStatus) },
    { title: 'Internship Completion Certificate Granted', date: 'Pending Final Audit', done: intern.status === 'Completed' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-[#E9DDFE] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#E9DDFE] flex items-center justify-between bg-[#F3EDFF]/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#A874F7] text-white flex items-center justify-center font-bold text-base shadow-xs">
                {intern.studentName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-[#171717] text-base">{intern.studentName}</h3>
                <span className="text-xs text-[#6B7280]">{intern.rollNumber} • {intern.department}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Risk Indicator & Overall Score */}
            <div className="p-4 rounded-2xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B7280]">Risk Assessment Level:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  riskLevel === 'Low Risk' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  riskLevel === 'Medium Risk' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {riskLevel}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>Overall Technical Performance</span>
                  <span className="text-[#A874F7]">{overallProgress}%</span>
                </div>
                <div className="w-full bg-[#F3EDFF] rounded-full h-2.5 border border-[#E9DDFE]">
                  <div className="bg-[#A874F7] h-2.5 rounded-full" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>

              {/* Requirement #4: Overall Progress Contribution Breakdown */}
              <div className="pt-2 border-t border-[#E9DDFE]/60 text-[10px] text-[#6B7280] grid grid-cols-2 gap-1.5 font-medium">
                <span>• Attendance (30% Weight): <strong className="text-[#171717]">{att}%</strong></span>
                <span>• Task Completion (40% Weight): <strong className="text-[#171717]">{task}%</strong></span>
                <span>• Work Logs (20% Weight): <strong className="text-[#171717]">{wl}%</strong></span>
                <span>• Technical Eval (10% Weight): <strong className="text-[#171717]">{techEvalScore}%</strong></span>
              </div>
            </div>

            {/* Student & Mentor Details */}
            <div className="p-4 rounded-2xl border border-[#E9DDFE] bg-white space-y-2 text-xs">
              <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider border-b border-[#E9DDFE] pb-1.5">
                Internship & Mentorship Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#6B7280] block">Host Organization</span>
                  <span className="font-semibold text-[#171717]">{intern.companyName}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Project Title</span>
                  <span className="font-semibold text-[#A874F7]">{intern.title}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Faculty Mentor (Read-Only)</span>
                  <span className="font-semibold text-[#171717]">Prof. Vikram Deshmukh</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Company Mentor</span>
                  <span className="font-semibold text-[#171717]">Rajesh Malhotra (Lead)</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Internship Period</span>
                  <span className="font-semibold text-[#171717]">{intern.startDate || '15 Jan 2026'} - {intern.endDate || '15 Jul 2026'}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block">Current Milestone</span>
                  <span className="font-semibold text-purple-700">Sprint 4 • API Integration</span>
                </div>
              </div>
            </div>

            {/* Attendance & Work Logs Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Industry Attendance</span>
                <p className="text-lg font-black text-emerald-900">{att}%</p>
                <span className="text-[9px] text-emerald-700 block">{intern.presentDays || 45} Present • {intern.lateDays || 0} Late</span>
              </div>

              <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-1">
                <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">Task & Work Logs</span>
                <p className="text-lg font-black text-purple-900">{task}% Completed</p>
                <span className="text-[9px] text-purple-700 block">{intern.completedTasksCount || 45} / {intern.totalTasksCount || 50} Tasks</span>
              </div>
            </div>

            {/* Requirement #9: Chronological Internship Timeline */}
            <div className="p-4 rounded-2xl border border-[#E9DDFE] bg-white space-y-3">
              <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider border-b border-[#E9DDFE] pb-1.5">
                Chronological Internship Lifecycle Timeline
              </h4>
              <div className="space-y-3 text-xs">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      step.done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${step.done ? 'text-[#171717]' : 'text-gray-400'}`}>{step.title}</p>
                      <span className="text-[10px] text-[#6B7280]">{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-3 border-t border-[#E9DDFE] text-center text-[10px] text-[#6B7280] bg-gray-50">
            Read-Only Student Summary • Faculty & Academic Records Strictly Preserved
          </div>
        </div>
      </div>
    </div>
  );
};
