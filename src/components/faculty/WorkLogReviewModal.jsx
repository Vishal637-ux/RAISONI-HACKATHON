import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { FileText, Download, CheckCircle2, AlertTriangle, ShieldAlert, X, Check, History, Calendar, Clock, FileCheck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const WorkLogReviewModal = ({ isOpen, onClose, record, onDecisionSubmit }) => {
  const [selectedStatus, setSelectedStatus] = useState('Verified');
  const [remarks, setRemarks] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const isLockedDecision = ['Verified', 'Rejected', 'Correction Requested'].includes(record.verificationStatus);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onDecisionSubmit({
        workLogId: record.id,
        status: selectedStatus,
        remarks,
        internalNotes,
        studentName: record.studentName,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-wl-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-3xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-wl-title" className="text-base font-bold text-[#171717]">
                  {isLockedDecision ? 'Work Log Decision Record' : 'Work Log Inspection & Verification'}
                </h3>
                {isLockedDecision && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#A874F7] text-white uppercase tracking-wider">
                    Locked Decision
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Mentee: <strong className="font-semibold text-[#171717]">{record.studentName}</strong> ({record.rollNumber})
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

        {/* Metadata Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F3EDFF]/30 p-3.5 rounded-xl border border-[#E9DDFE] text-xs">
          <div>
            <span className="text-[#6B7280] text-[11px] block">Log Date</span>
            <span className="font-bold text-[#171717]">{record.date}</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">Logged Hours</span>
            <span className="font-bold text-[#A874F7]">{record.hoursLogged} Hours</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">Host Company</span>
            <span className="font-semibold text-[#171717]">{record.companyName}</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">Verification Status</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {record.verificationStatus}
            </span>
          </div>
        </div>

        {/* Detailed Work Log Content */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-1.5">
            <h5 className="font-bold text-[#171717] uppercase tracking-wider text-[11px]">Tasks Completed Summary</h5>
            <p className="text-[#4B5563] leading-relaxed font-medium">
              {record.tasksCompleted || 'Integrated API endpoints and updated dashboard interface components.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-gray-200 bg-white space-y-1">
              <h5 className="font-bold text-[#171717] text-[11px] uppercase tracking-wider">Technical Challenges</h5>
              <p className="text-[#6B7280]">{record.challenges || 'Resolved state sync issue during re-rendering.'}</p>
            </div>
            <div className="p-3 rounded-xl border border-gray-200 bg-white space-y-1">
              <h5 className="font-bold text-[#171717] text-[11px] uppercase tracking-wider">Key Learnings</h5>
              <p className="text-[#6B7280]">{record.keyLearnings || 'React state management and clean component structure.'}</p>
            </div>
          </div>
        </div>

        {/* Attachment Download / Preview */}
        <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-[#A874F7]" />
            <div>
              <span className="font-bold text-[#171717] block">{record.attachmentFilename || 'WorkLog_Attachment.pdf'}</span>
              <span className="text-[11px] text-[#6B7280]">Official Work Log Proof Document</span>
            </div>
          </div>
          {record.attachmentUrl ? (
            <a
              href={record.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A874F7] text-white text-xs font-semibold hover:bg-[#965BEB] transition-colors shadow-2xs"
            >
              <Download size={13} />
              <span>Download Attachment</span>
            </a>
          ) : (
            <span className="text-[11px] text-gray-500 font-medium">No File Attached</span>
          )}
        </div>

        {/* Decision Selector (Only if not locked) */}
        {!isLockedDecision && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Verification Decision
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { status: 'Verified', label: 'Verify Work Log', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
                { status: 'Correction Requested', label: 'Request Correction', icon: AlertTriangle, color: 'bg-purple-50 text-[#A874F7]' },
                { status: 'Rejected', label: 'Reject Report', icon: ShieldAlert, color: 'bg-rose-50 text-rose-700' },
              ].map((act) => {
                const Icon = act.icon;
                const isSelected = selectedStatus === act.status;
                return (
                  <button
                    key={act.status}
                    type="button"
                    onClick={() => setSelectedStatus(act.status)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#A874F7] text-white border-[#A874F7] shadow-xs'
                        : 'bg-white text-[#171717] border-[#E9DDFE] hover:bg-[#F3EDFF]/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Remarks Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#171717] block">
              Student-Visible Remarks <span className="text-[#6B7280] font-normal">(Public)</span>
            </label>
            {isLockedDecision ? (
              <p className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] text-xs">
                {record.remarks || 'Daily work log report verified.'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter feedback or correction instructions for the student..."
                className="w-full p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#171717] block">
              Faculty Internal Notes <span className="text-[#A874F7] font-normal">(Private)</span>
            </label>
            {isLockedDecision ? (
              <p className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] text-xs">
                {internalNotes || 'Internal work log evaluation recorded.'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Enter confidential faculty evaluation notes..."
                className="w-full p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            )}
          </div>
        </div>

        {/* Visual Decision History Timeline */}
        <div className="p-4 rounded-xl border border-[#E9DDFE] bg-gray-50/50 space-y-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#171717]">
            <History size={15} className="text-[#A874F7]" />
            <span>Work Log Verification Timeline</span>
          </div>

          <div className="space-y-2 relative pl-4 border-l-2 border-[#E9DDFE] ml-2">
            <div className="relative flex items-center justify-between text-[11px]">
              <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[#171717]">1. Work Log Report Submitted</span>
              <span className="text-[#6B7280]">{record.date}</span>
            </div>
            <div className="relative flex items-center justify-between text-[11px]">
              <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-[#A874F7]" />
              <span className="font-semibold text-[#171717]">2. Faculty Inspection Decision</span>
              <span className="font-bold text-[#A874F7]">{record.verificationStatus}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9DDFE]">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="text-xs">
            {isLockedDecision ? 'Close Record' : 'Cancel'}
          </Button>
          {!isLockedDecision && (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={submitting}
              className="text-xs gap-1.5"
            >
              <Check size={14} />
              <span>Submit Verification</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
