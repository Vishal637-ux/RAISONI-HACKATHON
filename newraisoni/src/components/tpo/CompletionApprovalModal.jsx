import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertCircle, Building2, GraduationCap, FileCheck } from 'lucide-react';
import { completionService } from '../../services/completionService';

export const CompletionApprovalModal = ({ isOpen, onClose, queueItem, tpoUserId, onSuccess }) => {
  const [approving, setApproving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !queueItem) return null;

  const internship = queueItem.internship;
  const eligibility = queueItem.eligibility;
  const studentName = internship?.users?.full_name || 'Student Candidate';
  const companyName = internship?.companies?.company_name || 'Host Organization';

  const handleApprove = async () => {
    setErrorMsg('');
    try {
      setApproving(true);
      await completionService.approveInternshipCompletion(tpoUserId, internship.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Completion approval failed:', err);
      setErrorMsg(err.message || 'Failed to approve internship completion.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E1E7E2] overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-[#F8FAF9] p-5 border-b border-[#E1E7E2] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1F6B32]">
            <FileCheck className="w-5 h-5 text-[#2F8F46]" />
            <span>TPO Completion Sign-Off & Certificate Issuance</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706A] hover:bg-[#E1E7E2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#18201B]">
              Candidate: {studentName}
            </h3>
            <p className="text-xs text-[#66706A] mt-0.5">
              Internship: {internship.internship_title} at {companyName}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Eligibility Audit Checklist */}
          <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-3 text-xs">
            <h4 className="font-bold text-[#18201B] border-b border-[#E1E7E2] pb-2">
              Completion Eligibility Verification
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-[#66706A]">Company Mentor Evaluation:</span>
              {eligibility?.companyEval ? (
                <span className="font-bold text-[#1F6B32] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submitted ({eligibility.companyEval.performance_category})</span>
                </span>
              ) : (
                <span className="font-bold text-[#991B1B]">Pending</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#66706A]">Faculty Mentor Sign-Off:</span>
              {eligibility?.facultyEval ? (
                <span className="font-bold text-[#1F6B32] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{eligibility.facultyEval.academic_status}</span>
                </span>
              ) : (
                <span className="font-bold text-[#991B1B]">Pending</span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#E1E7E2] pt-2">
              <span className="font-bold text-[#18201B]">Completion Status:</span>
              {eligibility?.isEligible ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#EAF4EC] border border-[#C5E3CC] text-[11px] font-extrabold text-[#1F6B32]">
                  ELIGIBLE FOR SIGN-OFF
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] text-[11px] font-extrabold text-[#991B1B]">
                  INELIGIBLE
                </span>
              )}
            </div>
          </div>

          {!eligibility?.isEligible && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] space-y-1">
              <span className="font-bold block">Blocking Issues:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {eligibility?.reasons?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E1E7E2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#66706A] hover:bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={approving || !eligibility?.isEligible}
              className="px-5 py-2 text-xs font-bold text-white bg-[#2F8F46] hover:bg-[#1F6B32] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {approving ? 'Processing Sign-Off...' : 'Approve Completion & Issue Certificate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
