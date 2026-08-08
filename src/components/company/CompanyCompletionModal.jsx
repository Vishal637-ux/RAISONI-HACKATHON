import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lock,
  History,
  ShieldCheck,
  Building2,
  FileCheck2,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyCompletionModal = ({ isOpen, onClose, certRecord, onSignOff }) => {
  const [studentFeedback, setStudentFeedback] = useState('');
  const [mentorNotes, setMentorNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (certRecord) {
      setStudentFeedback(certRecord.studentFeedback || '');
      setMentorNotes(certRecord.mentorNotes || '');
      setShowConfirmDialog(false);
    }
  }, [certRecord]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (showConfirmDialog) {
          setShowConfirmDialog(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showConfirmDialog]);

  if (!isOpen || !certRecord) return null;

  // Requirement #5: Decision Locking
  const isSignedOff = certRecord.isSignedOff || certRecord.status === 'Certificate Issued' || certRecord.status === 'Sign-Off Completed';

  // Requirement #1: Completion Eligibility Validation
  const prereqs = certRecord.prerequisites || {
    tasksCompleted: true,
    workLogsApproved: true,
    attendanceVerified: true,
    evalSubmitted: true,
    industryReqsMet: true,
  };

  const allPrereqsMet = Object.values(prereqs).every(Boolean);

  const handleInitiateSignOff = () => {
    if (!allPrereqsMet) {
      toast.error('Cannot issue certificate until all technical prerequisites are completed');
      return;
    }
    if (!studentFeedback.trim()) {
      toast.error('Please enter student feedback remarks before digital sign-off');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleFinalConfirmSignOff = async () => {
    setIsSubmitting(true);
    try {
      await onSignOff(certRecord.id, { studentFeedback, mentorNotes });
      toast.success(`Industry Completion Certificate issued for ${certRecord.studentName}`);
      setShowConfirmDialog(false);
      onClose();
    } catch {
      toast.error('Failed to issue completion certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold">
              <FileCheck2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="completion-modal-title" className="text-base font-bold text-[#171717]">
                  {isSignedOff ? 'Official Industry Completion Certificate' : 'Industry Internship Completion Sign-Off'}
                </h3>
                {isSignedOff && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={10} />
                    Certificate Issued & Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Student Engineer: <strong className="text-[#171717]">{certRecord.studentName}</strong> ({certRecord.rollNumber})
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

        {/* Requirement #1 & #2: Visual Completion Checklist & Eligibility Validation */}
        <div className="p-4 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#171717] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#A874F7]" />
              <span>Completion Prerequisite Checklist</span>
            </span>
            {allPrereqsMet ? (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Prerequisites Met
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                Missing Prerequisites
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            {[
              { key: 'tasksCompleted', label: 'Technical Tasks Completed (100%)' },
              { key: 'workLogsApproved', label: 'Work Logs Approved & Verified' },
              { key: 'attendanceVerified', label: 'Industry Attendance Verified' },
              { key: 'evalSubmitted', label: 'Technical Evaluation Submitted' },
              { key: 'industryReqsMet', label: 'Industry Deliverables Verified' },
            ].map((item) => {
              const isChecked = prereqs[item.key];
              return (
                <div
                  key={item.key}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    isChecked ? 'bg-white border-emerald-200 text-emerald-800 font-semibold' : 'bg-rose-50/60 border-rose-200 text-rose-800'
                  }`}
                >
                  {isChecked ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> : <AlertTriangle size={15} className="text-rose-600 shrink-0" />}
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Requirement #3: Certificate Preview Enhancement */}
        <div className="p-5 rounded-xl border-2 border-[#A874F7]/30 bg-gradient-to-br from-white via-[#F3EDFF]/10 to-purple-50/30 space-y-3 relative text-xs shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#A874F7] text-white flex items-center justify-center font-extrabold text-xs">
                TS
              </div>
              <div>
                <h4 className="font-extrabold text-[#171717] text-sm tracking-tight">{certRecord.companyName}</h4>
                <p className="text-[10px] text-[#6B7280]">Official Industry Internship Completion Certificate</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-[#A874F7] bg-purple-50 px-2.5 py-1 rounded border border-[#E9DDFE]">
              {certRecord.certificateId || 'CERT-TC-2026-8890'}
            </span>
          </div>

          <div className="text-center space-y-1.5 py-2">
            <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">This is to certify that</p>
            <h3 className="text-lg font-black text-[#171717] tracking-tight">{certRecord.studentName}</h3>
            <p className="text-xs text-[#6B7280]">
              Roll No: <strong>{certRecord.rollNumber}</strong> • Dept: <strong>{certRecord.department}</strong>
            </p>
            <p className="text-xs text-[#171717] leading-relaxed max-w-lg mx-auto pt-1">
              has successfully completed the industry internship titled <strong className="text-[#A874F7]">{certRecord.title}</strong> for a duration of <strong>{certRecord.duration}</strong> with an overall technical performance standing of{' '}
              <strong className="text-emerald-700">Grade {certRecord.technicalGrade} ({certRecord.technicalScore}%)</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-[#E9DDFE] pt-3 text-[11px]">
            <div>
              <span className="text-[#6B7280] block text-[10px]">Issued & Authorized By:</span>
              <span className="font-bold text-[#171717]">{certRecord.mentorName}</span>
            </div>
            <div className="text-right">
              <span className="text-[#6B7280] block text-[10px]">Completion Date:</span>
              <span className="font-bold text-[#171717]">{certRecord.completionDate || '03 Aug 2026'}</span>
            </div>
          </div>
        </div>

        {/* Requirement #8: Mentor Feedback Summary (Student Visible vs Private) */}
        <div className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">Industry Feedback Remarks (Student Visible)</label>
            <textarea
              rows={2}
              value={studentFeedback}
              onChange={(e) => setStudentFeedback(e.target.value)}
              disabled={isSignedOff}
              placeholder="Enter official industry feedback, technical accomplishments, and certificate comments..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717] flex items-center justify-between">
              <span>Internal Organization Notes (Private to Mentor)</span>
              <span className="text-[10px] text-[#6B7280]">Hidden from student & faculty</span>
            </label>
            <input
              type="text"
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              disabled={isSignedOff}
              placeholder="e.g. Approved PPO offer letter sent to candidate..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Requirement #7: Timeline */}
        <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50/70 space-y-1.5 text-xs">
          <span className="font-bold text-[#171717] block">Internship Completion Timeline (Read-Only):</span>
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pt-0.5">
            <span className="px-2 py-0.5 rounded bg-white border border-[#E9DDFE] text-[#6B7280]">Internship Started</span>
            <span className="text-[#6B7280]">→</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold">Tasks Completed</span>
            <span className="text-[#6B7280]">→</span>
            <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-bold">Attendance Verified</span>
            <span className="text-[#6B7280]">→</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-bold">Evaluation Submitted</span>
            <span className="text-[#6B7280]">→</span>
            {isSignedOff ? (
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">Certificate Issued</span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 font-bold">Awaiting Sign-Off</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE] text-xs">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs px-4">
            Close
          </Button>

          {isSignedOff ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 size={15} />
              Certificate Signed Off & Issued
            </span>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleInitiateSignOff}
              disabled={!allPrereqsMet}
              className="text-xs px-6 shadow-xs bg-[#A874F7] hover:bg-[#965BEB] text-white disabled:opacity-50"
            >
              Issue Completion Certificate
            </Button>
          )}
        </div>
      </Card>

      {/* Requirement #4: Digital Sign-Off Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <Card className="bg-white border border-[#E9DDFE] max-w-md w-full p-5 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#171717]">Issue Industry Completion Certificate?</h4>
                <p className="text-xs text-[#6B7280]">Confirm digital sign-off and certificate issuance</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] text-xs space-y-1">
              <p className="text-[#171717]">
                Student: <strong>{certRecord.studentName}</strong> ({certRecord.rollNumber})
              </p>
              <p className="text-[#171717]">
                Company: <strong>{certRecord.companyName}</strong>
              </p>
              <p className="text-[#171717]">
                Internship: <strong>{certRecord.title}</strong>
              </p>
              <p className="text-[#171717]">
                Completion Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowConfirmDialog(false)} className="text-xs px-3">
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleFinalConfirmSignOff}
                isLoading={isSubmitting}
                className="text-xs px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirm Sign-Off & Issue
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
