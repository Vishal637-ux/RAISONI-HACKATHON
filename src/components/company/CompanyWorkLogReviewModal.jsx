import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  X,
  FileText,
  User,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  History,
  ShieldCheck,
  Download,
  Lock,
  MessageSquare,
  Building2,
  CheckSquare,
  Square,
  ListTodo,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyWorkLogReviewModal = ({ isOpen, onClose, log, onVerify, onFlag }) => {
  const [studentFeedback, setStudentFeedback] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirement #1: Mandatory Technical Review Checklist
  const [checklist, setChecklist] = useState({
    gitReviewed: false,
    demoVerified: false,
    deliverablesVerified: false,
    requirementsCompleted: false,
    docsReviewed: false,
  });

  useEffect(() => {
    if (log) {
      setStudentFeedback(log.studentFeedback || '');
      setInternalNotes(log.mentorNotes || '');
      // Reset or auto-check if already verified
      const isVerified = log.status === 'Verified';
      setChecklist({
        gitReviewed: isVerified,
        demoVerified: isVerified,
        deliverablesVerified: isVerified,
        requirementsCompleted: isVerified,
        docsReviewed: isVerified,
      });
    }
  }, [log]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !log) return null;

  const isVerified = log.status === 'Verified';
  const allChecklistItemsCompleted = Object.values(checklist).every(Boolean);

  const toggleChecklistItem = (key) => {
    if (isVerified) return;
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVerify = async () => {
    if (!allChecklistItemsCompleted) {
      toast.error('Please complete all technical review checklist items before verification');
      return;
    }
    setIsSubmitting(true);
    try {
      await onVerify(log.id, { feedback: studentFeedback, internalNotes });
      toast.success(`Work Log #${log.id} Verified & Signed Off`);
      onClose();
    } catch {
      toast.error('Failed to verify work log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlagRevision = async () => {
    if (!studentFeedback.trim()) {
      toast.error('Please enter technical feedback explaining the revision requested');
      return;
    }
    setIsSubmitting(true);
    try {
      await onFlag(log.id, { feedback: studentFeedback, internalNotes });
      toast.success(`Requested revision for Work Log #${log.id}`);
      onClose();
    } catch {
      toast.error('Failed to flag work log');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Requirement #4: Due Date vs Submission Date Comparison Badge
  const getDeadlineBadge = () => {
    const dueDateStr = log.dueDate || log.date || '2026-08-03';
    const subDateStr = log.submittedAt ? log.submittedAt.slice(0, 10) : log.date || '2026-08-03';

    const due = new Date(dueDateStr);
    const sub = new Date(subDateStr);
    const diffDays = Math.ceil((sub - due) / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
          <AlertTriangle size={12} />
          Submitted Late by {diffDays} Day(s)
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
        <CheckCircle2 size={12} />
        On Time Submission
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-log-review-modal-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="work-log-review-modal-title" className="text-base font-bold text-[#171717]">
                  {isVerified ? 'View Technical Sign-Off' : 'Review Technical Work Log'}
                </h3>
                {isVerified && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={10} />
                    Verified & Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Submitted by: <strong className="text-[#171717]">{log.studentName}</strong> ({log.rollNumber})
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

        {/* Requirement #5: Task Completion Summary Context Cards */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl border border-blue-200 bg-blue-50/50">
            <span className="text-[#6B7280] text-[10px] block">Assigned Tasks</span>
            <span className="font-bold text-blue-700 text-xs">10</span>
          </div>
          <div className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <span className="text-[#6B7280] text-[10px] block">Completed</span>
            <span className="font-bold text-emerald-700 text-xs">8 (80%)</span>
          </div>
          <div className="p-2 rounded-xl border border-amber-200 bg-amber-50/50">
            <span className="text-[#6B7280] text-[10px] block">Pending Tasks</span>
            <span className="font-bold text-amber-700 text-xs">2</span>
          </div>
          <div className="p-2 rounded-xl border border-purple-200 bg-purple-50/50">
            <span className="text-[#6B7280] text-[10px] block">Task Completion</span>
            <span className="font-bold text-[#A874F7] text-xs">80%</span>
          </div>
        </div>

        {/* Requirement #4: Due Date vs Submission Date Comparison Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] text-xs">
          <div className="space-y-0.5">
            <span className="text-[#6B7280] block text-[11px]">Deadline Comparison:</span>
            <p className="font-semibold text-[#171717]">
              Due: <strong>{log.dueDate || log.date || '2026-08-03'}</strong> • Submitted: <strong>{log.date || '2026-08-03'}</strong>
            </p>
          </div>
          <div>{getDeadlineBadge()}</div>
        </div>

        {/* Work Log Description & Details */}
        <div className="p-4 rounded-xl border border-[#E9DDFE] bg-white space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[#171717]">
              <Building2 size={16} className="text-[#A874F7]" />
              <span>{log.taskName || 'Daily Technical Work Log'}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#A874F7] border border-[#E9DDFE]">
              {log.hoursLogged || 8} Hours Logged
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[#6B7280] font-semibold text-[11px] block">Work Log Description:</span>
            <p className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-[#171717] leading-relaxed">
              {log.description}
            </p>
          </div>

          {log.challenges && (
            <div className="space-y-1 text-[11px]">
              <span className="text-amber-700 font-semibold block">Engineering Obstacles & Challenges:</span>
              <p className="p-2 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900">
                {log.challenges}
              </p>
            </div>
          )}

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#E9DDFE]">
            {log.gitLink && (
              <a
                href={log.gitLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#E9DDFE] text-[#A874F7] font-semibold hover:underline text-[11px] truncate"
              >
                <ExternalLink size={13} className="shrink-0" />
                <span className="truncate">Git Repo: {log.gitLink}</span>
              </a>
            )}

            {log.liveLink && (
              <a
                href={log.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#E9DDFE] text-blue-600 font-semibold hover:underline text-[11px] truncate"
              >
                <ExternalLink size={13} className="shrink-0" />
                <span className="truncate">Live Demo: {log.liveLink}</span>
              </a>
            )}
          </div>
        </div>

        {/* Requirement #1: Mandatory Technical Review Checklist */}
        <div className="p-4 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[#171717]">
              <ListTodo size={16} className="text-[#A874F7]" />
              <span>Mandatory Technical Review Checklist</span>
            </div>
            {allChecklistItemsCompleted ? (
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Checklist Complete
              </span>
            ) : (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Required for Sign-Off
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {[
              { key: 'gitReviewed', label: 'GitHub Repository Reviewed' },
              { key: 'demoVerified', label: 'Live Demo Verified' },
              { key: 'deliverablesVerified', label: 'Deliverables Verified' },
              { key: 'requirementsCompleted', label: 'Task Requirements Completed' },
              { key: 'docsReviewed', label: 'Documentation Reviewed' },
            ].map((item) => {
              const isChecked = checklist[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleChecklistItem(item.key)}
                  disabled={isVerified}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isChecked ? 'bg-white border-[#A874F7] text-[#A874F7] font-bold shadow-2xs' : 'bg-white/70 border-[#E9DDFE] text-[#6B7280]'
                  }`}
                >
                  {isChecked ? <CheckSquare size={15} className="text-[#A874F7] shrink-0" /> : <Square size={15} className="text-[#6B7280] shrink-0" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Requirement #2 & #3: Revision History & Previous Technical Reviews */}
        <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-gray-50/70 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#171717]">
            <History size={14} className="text-[#A874F7]" />
            <span>Technical Review & Revision History</span>
          </div>

          <div className="space-y-1 text-[11px] max-h-28 overflow-y-auto">
            <div className="p-2 rounded-md bg-white border border-[#E9DDFE] space-y-0.5">
              <div className="flex items-center justify-between font-bold text-[#171717]">
                <span>Review #1 – Needs Revision</span>
                <span className="text-[10px] text-[#6B7280]">01 Aug 2026</span>
              </div>
              <p className="text-[#6B7280]">Feedback: Please add unit test assertions for missing data imputation edge cases.</p>
            </div>

            {isVerified && (
              <div className="p-2 rounded-md bg-white border border-emerald-200 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-emerald-800">
                  <span>Review #2 – Verified & Signed Off</span>
                  <span className="text-[10px] text-emerald-700">03 Aug 2026</span>
                </div>
                <p className="text-emerald-700">Feedback: Deliverables verified against sprint requirements. Technical sign-off issued.</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Inputs */}
        <div className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">Technical Feedback (Visible to Student Intern)</label>
            <textarea
              rows={2}
              value={studentFeedback}
              onChange={(e) => setStudentFeedback(e.target.value)}
              disabled={isVerified}
              placeholder="Provide technical feedback, code review remarks, or revision suggestions..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">Internal Mentor Notes (Private to Organization)</label>
            <input
              type="text"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              disabled={isVerified}
              placeholder="Private notes regarding engineering competence or internal evaluation..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Requirement #6: Expanded Technical Audit Timeline */}
        <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50/70 space-y-1.5 text-xs">
          <span className="font-bold text-[#171717] block">Technical Audit Timeline (Read-Only):</span>
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pt-0.5">
            <span className="px-2 py-0.5 rounded bg-white border border-[#E9DDFE] text-[#6B7280]">Task Assigned</span>
            <span className="text-[#6B7280]">→</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold">Work Submitted</span>
            <span className="text-[#6B7280]">→</span>
            <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-bold">Viewed by Mentor</span>
            <span className="text-[#6B7280]">→</span>
            {isVerified ? (
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">Verified & Signed Off</span>
            ) : log.status === 'Needs Revision' ? (
              <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold">Revision Requested</span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-bold">Pending Decision</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE] text-xs">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs px-4">
            Close
          </Button>

          {isVerified ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 size={15} />
              Technical Sign-Off Locked
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleFlagRevision}
                isLoading={isSubmitting}
                className="text-xs px-3 text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                Request Revision
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleVerify}
                isLoading={isSubmitting}
                disabled={!allChecklistItemsCompleted}
                className="text-xs px-5 shadow-xs disabled:opacity-50"
              >
                Verify & Sign Off
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
