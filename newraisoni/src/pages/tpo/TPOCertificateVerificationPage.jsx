import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { certificateVerificationService } from '../../services/certificateVerificationService';
import { CertificateReviewQueueCard } from '../../components/tpo/CertificateReviewQueueCard';
import { ExternalCertificateReviewDrawer } from '../../components/tpo/ExternalCertificateReviewDrawer';
import { ShieldCheck, RefreshCw, AlertCircle, Search } from 'lucide-react';

export const TPOCertificateVerificationPage = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await certificateVerificationService.getVerificationQueue();
      setQueue(data);
    } catch (err) {
      console.error('Error loading verification queue:', err);
      setErrorMsg(err.message || 'Failed to load external certificate review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleOpenReview = (certItem) => {
    setSelectedCert(certItem);
    setIsDrawerOpen(true);
  };

  const handleAdjudicate = async (certificateRecordId, decision, comments) => {
    if (!user?.id) return;
    try {
      await certificateVerificationService.submitReviewerDecision({
        reviewerUserId: user.id,
        certificateRecordId,
        decision,
        comments,
      });
      await loadQueue();
    } catch (err) {
      console.error('Error adjudicating certificate:', err);
      throw err;
    }
  };

  const filteredQueue = queue.filter((item) => {
    const sName = (item.users?.full_name || '').toLowerCase();
    const cName = (item.internships?.companies?.company_name || '').toLowerCase();
    const fName = (item.file_name || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return sName.includes(term) || cName.includes(term) || fName.includes(term);
  });

  return (
    <PortalLayout title="External AI Certificate Verification" roleLabel="Institutional Reviewer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Trust Engine & Authoritative Adjudication</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">External Certificate Review Queue</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Inspect Trust Scores, SHA-256 duplicate checks, and anomaly flags to issue authoritative approval or rejection.
            </p>
          </div>

          <button
            onClick={loadQueue}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh verification queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#66706A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate student, host company, or document filename..."
            className="w-full pl-10 pr-4 py-2.5 bg-white text-xs border border-[#E1E7E2] rounded-xl focus:outline-none focus:border-[#1F6B32]"
          />
        </div>

        {/* Queue Grid / Empty State */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            Loading external certificate verification queue...
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            No external certificate submissions found in review queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQueue.map((item) => (
              <CertificateReviewQueueCard
                key={item.id}
                item={item}
                onOpenReview={handleOpenReview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Adjudication Drawer */}
      <ExternalCertificateReviewDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        certItem={selectedCert}
        onAdjudicate={handleAdjudicate}
      />
    </PortalLayout>
  );
};
