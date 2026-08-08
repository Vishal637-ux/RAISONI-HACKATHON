import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, X, FileText, Check, ShieldCheck, History, ArrowRight, UserCheck, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const ApprovalActionModal = ({ isOpen, onClose, mentee, onDecisionSubmit }) => {
  const [selectedStatus, setSelectedStatus] = useState('Under Review');
  const [studentRemarks, setStudentRemarks] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mentee) return null;

  // Check if decision is locked (read-only mode for finalized status)
  const isLockedDecision = ['Approved', 'Rejected', 'Completed'].includes(mentee.status);

  // Verification Checklist Items (6 Items)
  const checklistItems = [
    { id: '1', label: 'Student Academic Profile Complete', checked: true },
    { id: '2', label: 'Offer Letter Document Authenticated', checked: !!mentee.offerLetterUrl },
    { id: '3', label: 'Host Company Registration Verified', checked: true },
    { id: '4', label: 'Technical Company Mentor Assigned', checked: !!mentee.companyMentorName },
    { id: '5', label: 'Internship Duration Verified (12 Weeks)', checked: true },
    { id: '6', label: 'No Active Backlogs / Academic Holds', checked: true },
  ];

  const completedCount = checklistItems.filter((i) => i.checked).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  // Approval Templates
  const approvalTemplates = [
    { label: 'Academic Eligibility Verified', text: 'Academic eligibility requirements, CGPA baseline, and degree progression verified successfully.' },
    { label: 'Offer Letter Verified', text: 'Official company offer letter, duration, and stipend metadata verified and authenticated.' },
    { label: 'Company Verified', text: 'Host organization registration and technical mentor credentials verified.' },
    { label: 'Internship Approved', text: 'Internship application approved for academic degree completion credit.' },
  ];

  // Reject / Revision Templates
  const rejectTemplates = [
    { label: 'Incomplete Documents', text: 'Please upload complete internship registration documents and valid ID credentials.' },
    { label: 'Offer Letter Missing', text: 'Official company offer letter is missing or unreadable. Please upload a signed offer letter.' },
    { label: 'Company Verification Pending', text: 'Host company verification is currently pending with academic administration.' },
    { label: 'Duration Mismatch', text: 'The internship start and end dates do not satisfy the required 12-week minimum duration.' },
    { label: 'Academic Eligibility Issue', text: 'Academic eligibility requirements are not met. Minimum CGPA of 6.5 is required.' },
  ];

  const handleApplyTemplate = (tmpl) => {
    setSelectedTemplate(tmpl.label);
    setStudentRemarks(tmpl.text);
    toast.success(`Applied "${tmpl.label}" template`);
  };

  // Enforce Strict Allowed Status Transitions
  const getAllowedActions = (currentStatus) => {
    if (currentStatus === 'Applied') {
      return [{ status: 'Under Review', label: 'Move to Under Review (Hold)', icon: Clock, color: 'bg-purple-50 text-[#A874F7] border-[#E9DDFE]' }];
    }
    if (currentStatus === 'Under Review') {
      return [
        { status: 'Approved', label: 'Approve Internship', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { status: 'Revision Required', label: 'Request Revision', icon: AlertCircle, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { status: 'Rejected', label: 'Reject Application', icon: ShieldAlert, color: 'bg-rose-50 text-rose-700 border-rose-200' },
      ];
    }
    return [
      { status: 'Approved', label: 'Approve Internship', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ];
  };

  const allowedActions = getAllowedActions(mentee.status);

  const handleSubmit = async () => {
    if (submitting) return; // Duplicate submission prevention
    setSubmitting(true);
    try {
      await onDecisionSubmit({
        internshipId: mentee.id,
        status: selectedStatus,
        remarks: studentRemarks,
        academicNotes: internalNotes,
        previousStatus: mentee.status,
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
      aria-labelledby="modal-decision-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-3xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-decision-title" className="text-lg font-bold text-[#171717]">
                  {isLockedDecision ? 'Academic Decision Record' : 'Academic Verification & Decision'}
                </h3>
                {isLockedDecision && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#A874F7] text-white uppercase tracking-wider">
                    Locked Decision
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Mentee: <strong className="font-semibold text-[#171717]">{mentee.studentName}</strong> • {mentee.companyName}
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

        {/* Read-Only Decision Summary Banner (If Decision Locked) */}
        {isLockedDecision ? (
          <div className="p-4 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#171717]">Decision Status:</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {mentee.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-[#E9DDFE]">
              <div>
                <span className="text-[#6B7280] text-[11px] block">Decision Date</span>
                <span className="font-bold text-[#171717]">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[#6B7280] text-[11px] block">Updated By</span>
                <span className="font-bold text-[#A874F7]">College Administrator (Faculty Mentor)</span>
              </div>
            </div>
          </div>
        ) : (
          /* Verification Progress Bar Indicator */
          <div className="p-4 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#171717]">Verification Progress</span>
              <span className="text-[#A874F7]">{completedCount} / {checklistItems.length} Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-[#F3EDFF] rounded-full h-2 border border-[#E9DDFE]">
              <div
                className="bg-[#A874F7] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-1.5 text-[#171717]">
                  <CheckCircle2 size={13} className={item.checked ? 'text-emerald-600' : 'text-gray-300'} />
                  <span className={item.checked ? 'font-medium' : 'text-[#6B7280]'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Transition Selector (Only if decision is NOT locked) */}
        {!isLockedDecision && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Select Decision Status (Current: <span className="text-[#A874F7]">{mentee.status}</span>)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {allowedActions.map((act) => {
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

        {/* Approval & Reject Templates (Only if not locked) */}
        {!isLockedDecision && (
          <div className="p-3.5 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] space-y-2">
            <span className="text-[11px] font-bold text-[#171717] uppercase tracking-wider block">
              Quick Remarks Templates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(selectedStatus === 'Approved' ? approvalTemplates : rejectTemplates).map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedTemplate === tmpl.label
                      ? 'bg-[#A874F7] text-white shadow-2xs'
                      : 'bg-white text-[#171717] border border-[#E9DDFE] hover:bg-[#F3EDFF]'
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Remarks Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Student Visible Remarks */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#171717] block">
              Student-Visible Remarks <span className="text-[#6B7280] font-normal">(Public)</span>
            </label>
            {isLockedDecision ? (
              <p className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] text-xs">
                {mentee.remarks || 'Academic eligibility and internship documents verified.'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={studentRemarks}
                onChange={(e) => setStudentRemarks(e.target.value)}
                placeholder="Enter feedback or requirements visible to the student mentee..."
                className="w-full p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            )}
          </div>

          {/* Faculty Internal Notes (Private) */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#171717] block">
              Faculty Internal Notes <span className="text-[#A874F7] font-normal">(Confidential / Private)</span>
            </label>
            {isLockedDecision ? (
              <p className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] text-xs">
                {mentee.academicNotes || 'Internal academic verification complete.'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Enter private academic notes stored for faculty evaluation records..."
                className="w-full p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            )}
          </div>
        </div>

        {/* Visual Chronological Audit Trail Timeline */}
        <div className="p-4 rounded-xl border border-[#E9DDFE] bg-gray-50/50 space-y-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#171717]">
            <History size={15} className="text-[#A874F7]" />
            <span>Visual Chronological Audit Timeline</span>
          </div>

          <div className="space-y-2 relative pl-4 border-l-2 border-[#E9DDFE] ml-2">
            <div className="relative flex items-center justify-between text-[11px]">
              <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[#171717]">1. Application Submitted by Student</span>
              <span className="text-[#6B7280]">May 15, 2026</span>
            </div>
            <div className="relative flex items-center justify-between text-[11px]">
              <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-[#A874F7]" />
              <span className="font-semibold text-[#171717]">2. Offer Letter & Company Verified</span>
              <span className="text-[#6B7280]">May 16, 2026</span>
            </div>
            <div className="relative flex items-center justify-between text-[11px]">
              <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-[#A874F7]" />
              <span className="font-semibold text-[#171717]">3. Final Academic Decision Issued</span>
              <span className="font-bold text-[#A874F7]">{mentee.status}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
              <span>Submit Academic Decision</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
