import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { tpoService } from '../../services/tpoService';
import { OfferVerificationDrawer } from '../../components/tpo/OfferVerificationDrawer';
import { Briefcase, CheckCircle2, Clock, XCircle, FileText, RefreshCw, AlertCircle, Eye } from 'lucide-react';

export const TPOOfferVerificationPage = () => {
  const { user } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeOffer, setActiveOffer] = useState(null);

  const loadOffers = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const list = await tpoService.getPendingOffers();
      setOffers(list);
    } catch (err) {
      console.error('Error loading offer verification queue:', err);
      setErrorMsg(err.message || 'Failed to load offer verification queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [user]);

  const stats = {
    total: offers.length,
    pending: offers.filter((o) => o.verification_status === 'OFFER_PENDING').length,
    verified: offers.filter((o) => o.verification_status === 'TPO_VERIFIED').length,
    rejected: offers.filter((o) => o.verification_status === 'REJECTED').length,
  };

  const getVerificationStatusBadge = (status) => {
    switch (status) {
      case 'TPO_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8F46]" />
            TPO Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'OFFER_PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3.5 h-3.5" />
            Pending TPO Review
          </span>
        );
    }
  };

  return (
    <PortalLayout title="Offer Verification Queue" roleLabel="Training & Placement Officer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#18201B]">Institutional Offer Letter Verification Queue</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Verify company offer letter documents for selected students to create verified internship records.
            </p>
          </div>

          <button
            onClick={loadOffers}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh verification queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#66706A]">Total Submitted Offers</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.total}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#D97706]">Pending Review</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.pending}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#2F8F46]">TPO Verified</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.verified}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#DC2626]">Rejected Offers</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.rejected}</p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
            Loading institutional offer verification queue...
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">Queue Empty</h3>
            <p className="text-xs text-[#66706A]">
              There are currently no offer letters submitted for TPO verification.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E1E7E2] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
                    <th className="py-3.5 px-4">Student Candidate</th>
                    <th className="py-3.5 px-4">Company & Posting</th>
                    <th className="py-3.5 px-4">Submission Date</th>
                    <th className="py-3.5 px-4">Verification Status</th>
                    <th className="py-3.5 px-4 text-right">Inspect & Decide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
                  {offers.map((offer) => {
                    const studentUser = offer.users || {};
                    const profile = offer.student_profile || {};
                    const company = offer.companies || {};
                    const posting = offer.internship_applications?.internship_postings || {};

                    return (
                      <tr key={offer.id} className="hover:bg-[#F8FAF9] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-sm text-[#18201B]">
                            {studentUser.full_name || 'Student Candidate'}
                          </div>
                          <div className="text-[11px] text-[#66706A] mt-0.5">
                            {studentUser.email} • Dept: {profile.department || 'CSE'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#18201B]">{company.company_name || 'Company'}</div>
                          <div className="text-[11px] text-[#2F8F46] font-medium mt-0.5">
                            {posting.title || 'Internship Position'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#66706A]">
                          {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-3.5 px-4">{getVerificationStatusBadge(offer.verification_status)}</td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setActiveOffer(offer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect & Verify</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inspection Drawer Component */}
        <OfferVerificationDrawer
          offer={activeOffer}
          isOpen={!!activeOffer}
          onClose={() => setActiveOffer(null)}
          tpoUserId={user?.id}
          onDecisionComplete={() => loadOffers()}
        />
      </div>
    </PortalLayout>
  );
};
