import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, ExternalLink, ShieldCheck, AlertCircle, Building2, User, Clock } from 'lucide-react';
import { tpoService } from '../../services/tpoService';

export const OfferVerificationDrawer = ({ offer, isOpen, onClose, tpoUserId, onDecisionComplete }) => {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadPdf() {
      if (!offer?.file_url) return;
      try {
        setLoadingPdf(true);
        setErrorMsg('');
        const url = await tpoService.getSignedOfferUrl(offer.file_url);
        setSignedUrl(url);
      } catch (err) {
        setErrorMsg('Failed to generate secure URL for offer letter PDF.');
      } finally {
        setLoadingPdf(false);
      }
    }

    if (isOpen && offer) {
      loadPdf();
    }
  }, [isOpen, offer]);

  if (!isOpen || !offer) return null;

  const studentUser = offer.users || {};
  const studentProfile = offer.student_profile || {};
  const company = offer.companies || {};
  const posting = offer.internship_applications?.internship_postings || {};

  const handleDecision = async (decision) => {
    if (!tpoUserId) {
      setErrorMsg('TPO user session error.');
      return;
    }

    const confirmMsg = decision === 'TPO_VERIFIED'
      ? 'Approve and verify this offer letter? This will create a verified master internship record.'
      : 'Reject this offer letter? The company and student will be notified.';

    if (!window.confirm(confirmMsg)) return;

    try {
      setSubmitting(true);
      setErrorMsg('');

      await tpoService.verifyOfferLetter(offer.id, decision, tpoUserId);

      if (onDecisionComplete) {
        onDecisionComplete(decision);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record TPO offer decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#E1E7E2]">
        {/* Header */}
        <div className="p-5 border-b border-[#E1E7E2] flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18201B]">Offer Letter Verification</h3>
              <p className="text-xs text-[#66706A]">Institutional TPO Review Queue</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#66706A] hover:bg-[#E1E7E2] font-bold text-lg"
          >
            ×
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-3.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student & Company Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Info Card */}
            <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#2F8F46] font-bold">
                <User className="w-4 h-4" />
                <span>Student Details</span>
              </div>
              <p className="text-sm font-bold text-[#18201B]">{studentUser.full_name || 'Student'}</p>
              <p className="text-[#66706A]">{studentUser.email}</p>
              <p className="text-[#66706A]">
                Dept: <span className="font-semibold text-[#18201B]">{studentProfile.department || 'CSE'}</span> • CGPA:{' '}
                <span className="font-semibold text-[#18201B]">{studentProfile.cgpa ?? 'N/A'}</span>
              </p>
            </div>

            {/* Company Info Card */}
            <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#2F8F46] font-bold">
                <Building2 className="w-4 h-4" />
                <span>Company & Role</span>
              </div>
              <p className="text-sm font-bold text-[#18201B]">{company.company_name || 'Company'}</p>
              <p className="text-[#66706A] font-medium">{posting.title || 'Internship Position'}</p>
              <p className="text-[#66706A]">
                Stipend: <span className="font-semibold text-[#2F8F46]">{posting.stipend || 'Unpaid'}</span> • Mode:{' '}
                <span className="font-semibold text-[#18201B]">{posting.mode || 'On-site'}</span>
              </p>
            </div>
          </div>

          {/* PDF Viewer Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#18201B]">Offer Document Preview</span>
              {signedUrl && (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#2F8F46] font-bold hover:underline"
                >
                  <span>Open Full PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="border border-[#E1E7E2] rounded-xl overflow-hidden bg-[#F8FAF9] h-[360px] flex items-center justify-center">
              {loadingPdf ? (
                <p className="text-xs text-[#66706A]">Generating secure PDF signed URL...</p>
              ) : signedUrl ? (
                <iframe
                  src={signedUrl}
                  title="Offer Letter PDF Preview"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="text-center space-y-2">
                  <FileText className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                  <p className="text-xs text-[#66706A]">PDF Preview unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-5 border-t border-[#E1E7E2] bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#E1E7E2] text-xs font-semibold text-[#66706A] hover:bg-[#F8FAF9]"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleDecision('REJECTED')}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FEE2E2] text-xs font-bold transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Offer</span>
            </button>

            <button
              type="button"
              onClick={() => handleDecision('TPO_VERIFIED')}
              disabled={submitting}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold transition-all shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Verifying...' : 'Approve & Verify Offer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
