import React, { useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { X, Briefcase, Calendar, Clock, ExternalLink, FileText, CheckCircle2, AlertTriangle, User, History, MessageSquare } from 'lucide-react';

export const TaskDetailsModal = ({ isOpen, onClose, task, onApproveTask }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const getOverdueIndicator = () => {
    if (!task.dueDate) return null;
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (task.status === 'Completed') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 size={12} />
          Completed
        </span>
      );
    }

    if (diffDays < 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
          <AlertTriangle size={12} />
          Overdue by {Math.abs(diffDays)} Day(s)
        </span>
      );
    }

    if (diffDays === 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <Clock size={12} />
          Due Today
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
        <Clock size={12} />
        {diffDays} Day(s) Remaining
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-details-modal-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="task-details-modal-title" className="text-base font-bold text-[#171717]">
                  {task.title}
                </h3>
              </div>
              <p className="text-xs text-[#6B7280]">
                Assigned to: <strong className="text-[#171717]">{task.studentName}</strong> ({task.rollNumber})
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

        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#6B7280]">Priority:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
              task.priority === 'High' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              {task.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#6B7280]">Timeline Status:</span>
            {getOverdueIndicator()}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 text-xs">
          <span className="font-bold text-[#171717]">Task Specification & Requirements:</span>
          <p className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[#6B7280] leading-relaxed">
            {task.description || 'Implement technical deliverable per sprint backlog specifications.'}
          </p>
        </div>

        {/* Tech Stack Tags */}
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-[#6B7280]">Technology Stack:</span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {(task.techStack || ['React', 'Node.js']).map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] text-[11px] font-bold">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Deliverable Submission Link */}
        <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#171717]">Student Submission Artifact:</span>
            {task.submittedAt && (
              <span className="text-[10px] text-[#6B7280]">
                Submitted: {new Date(task.submittedAt).toLocaleDateString('en-GB')}
              </span>
            )}
          </div>

          {task.submittedFileUrl ? (
            <a
              href={task.submittedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E9DDFE] text-[#A874F7] font-semibold hover:underline break-all"
            >
              <ExternalLink size={14} className="shrink-0" />
              <span>{task.submittedFileUrl}</span>
            </a>
          ) : (
            <p className="text-xs text-[#6B7280] italic">No submission link uploaded yet by student.</p>
          )}
        </div>

        {/* Task Activity Timeline */}
        <div className="space-y-2 border-t border-[#E9DDFE] pt-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#171717]">
            <History size={14} className="text-[#A874F7]" />
            <span>Task Activity Timeline</span>
          </div>

          <div className="space-y-1 text-[11px] text-[#6B7280]">
            <div className="flex items-center justify-between p-1.5 rounded-md bg-white border border-[#E9DDFE]">
              <span>Task Created & Assigned</span>
              <strong className="text-[#171717]">{task.createdAt}</strong>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-md bg-white border border-[#E9DDFE]">
              <span>Target Due Date</span>
              <strong className="text-[#171717]">{task.dueDate}</strong>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE]">
          {onApproveTask && task.status !== 'Completed' ? (
            <button
              type="button"
              onClick={() => onApproveTask(task)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle2 size={15} />
              <span>Approve Deliverable & Mark Completed</span>
            </button>
          ) : <div />}

          <Button type="button" variant="outline" onClick={onClose} className="text-xs px-5 font-semibold">
            Close Task Details
          </Button>
        </div>
      </Card>
    </div>
  );
};
