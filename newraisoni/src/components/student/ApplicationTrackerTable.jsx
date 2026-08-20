import React, { useState } from 'react';
import { Calendar, Building2, Briefcase, CheckCircle2, Clock, XCircle, FileText, Download, Eye, Loader2, AlertCircle } from 'lucide-react';
import { internshipService } from '../../services/internshipService';

export const ApplicationTrackerTable = ({ applications = [] }) => {
  const [loadingOfferId, setLoadingOfferId] = useState(null);
  const [actionError, setActionError] = useState('');

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Applications Submitted</h3>
        <p className="text-xs text-[#66706A]">
          You have not applied for any internship postings yet. Browse open opportunities to apply.
        </p>
      </div>
    );
  }

  const handleOpenOffer = async (offer, isDownload = false) => {
    if (!offer?.file_url) return;
    try {
      setLoadingOfferId(offer.id);
      setActionError('');
      const signedUrl = await internshipService.getSignedOfferUrl(offer.file_url);
      if (!signedUrl) {
        throw new Error('Could not generate secure access link for offer letter PDF.');
      }
      if (isDownload) {
        const link = document.createElement('a');
        link.href = signedUrl;
        link.target = '_blank';
        link.download = `Offer_Letter_${offer.id.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error opening offer letter:', err);
      setActionError(err.message || 'Failed to open offer letter document.');
    } finally {
      setLoadingOfferId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selected
          </span>
        );
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3.5 h-3.5" />
            Shortlisted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'Applied':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Clock className="w-3.5 h-3.5" />
            Applied
          </span>
        );
    }
  };

  const renderOfferCell = (app) => {
    const offerList = Array.isArray(app.offer_letters)
      ? app.offer_letters
      : (app.offer_letters ? [app.offer_letters] : []);
    const offer = offerList.length > 0 ? offerList[offerList.length - 1] : null;

    if (!offer) {
      if (app.status === 'Selected') {
        return (
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
              <Clock className="w-3 h-3 text-[#6B7280]" />
              Awaiting Company Offer Letter
            </span>
          </div>
        );
      }
      return <span className="text-[#9CA3AF] text-xs">—</span>;
    }

    const isVerified = offer.verification_status === 'TPO_VERIFIED';
    const isLoadingThis = loadingOfferId === offer.id;

    return (
      <div className="flex flex-col items-end gap-1.5">
        {/* Status Badge */}
        {isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
            <CheckCircle2 className="w-3 h-3 text-[#2F8F46]" />
            TPO VERIFIED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3 h-3 text-[#D97706]" />
            OFFER RECEIVED / AWAITING TPO VERIFICATION
          </span>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-0.5">
          <button
            onClick={() => handleOpenOffer(offer, false)}
            disabled={isLoadingThis}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#1F6B32] bg-[#EAF4EC] hover:bg-[#D5EAD8] rounded-lg border border-[#C5E3CC] transition-colors disabled:opacity-50 cursor-pointer"
            title={isVerified ? "View Verified Offer Letter PDF" : "View Offer Letter PDF"}
          >
            {isLoadingThis ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-[#2F8F46]" />
            )}
            <span>{isVerified ? 'View Verified Offer' : 'View Offer Letter'}</span>
          </button>

          <button
            onClick={() => handleOpenOffer(offer, true)}
            disabled={isLoadingThis}
            className="inline-flex items-center gap-1 p-1 text-xs font-bold text-[#66706A] bg-[#F8FAF9] hover:bg-[#E1E7E2] rounded-lg border border-[#E1E7E2] transition-colors disabled:opacity-50 cursor-pointer"
            title="Download Offer Letter PDF"
          >
            <Download className="w-3.5 h-3.5 text-[#66706A]" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-[#E1E7E2] overflow-hidden shadow-xs space-y-0">
      {actionError && (
        <div className="p-3 bg-[#FEF2F2] border-b border-[#FCA5A5] text-xs text-[#991B1B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
              <th className="py-3.5 px-4">Internship Opportunity</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Mode / Stipend</th>
              <th className="py-3.5 px-4">Date Applied</th>
              <th className="py-3.5 px-4">Application Status</th>
              <th className="py-3.5 px-4 text-right">Offer Letter & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
            {applications.map((app) => {
              const posting = app.internship_postings || {};
              const companyName = posting.companies?.company_name || 'Company';

              return (
                <tr key={app.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-sm text-[#18201B]">{posting.title || 'Internship Role'}</div>
                    <div className="text-[11px] text-[#66706A] mt-0.5">
                      Duration: {posting.duration || 'N/A'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#2F8F46] shrink-0" />
                      <span>{companyName}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#18201B]">{posting.mode || 'On-site'}</div>
                    <div className="text-[11px] text-[#2F8F46] font-semibold">{posting.stipend || 'Unpaid'}</div>
                  </td>

                  <td className="py-3.5 px-4 text-[#66706A]">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(app.status)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {renderOfferCell(app)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
