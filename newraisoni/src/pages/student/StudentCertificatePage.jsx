import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { certificateService } from '../../services/certificateService';
import { ppoService } from '../../services/ppoService';
import { certificateVerificationService } from '../../services/certificateVerificationService';
import { DigitalCertificateCard } from '../../components/student/DigitalCertificateCard';
import { ExternalCertificateUploadModal } from '../../components/student/ExternalCertificateUploadModal';
import { Award, RefreshCw, AlertCircle, TrendingUp, Upload, FileText, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';

export const StudentCertificatePage = () => {
  const { user, profile } = useAuth();
  const [certData, setCertData] = useState(null);
  const [ppoRecord, setPpoRecord] = useState(null);
  const [extCerts, setExtCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const cert = await certificateService.getCertificateForStudent(user.id);
      const ppo = await ppoService.getPPOForStudent(user.id);
      const externalList = await certificateVerificationService.getUserExternalCertificates(user.id);

      setCertData(cert);
      setPpoRecord(ppo);
      setExtCerts(externalList);
    } catch (err) {
      console.error('Error loading student certificate page:', err);
      setErrorMsg(err.message || 'Failed to load digital certificate data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const activeInternshipId = certData?.internship_id || ppoRecord?.internship_id || '3257bae8-6720-4c69-aa70-a31685478c43';

  return (
    <PortalLayout title="Digital Certificate & Verification" roleLabel="Student Candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <Award className="w-4 h-4" />
              <span>Official Institutional Document Engine</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">My Digital Internship Certificates</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Download your verified PDF certificate with dynamic QR code public verification, submit external certificates, and view PPO outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2.5 bg-[#1F6B32] hover:bg-[#185427] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload External Certificate</span>
            </button>

            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
              title="Refresh certificate data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            Loading digital certificate and verification records...
          </div>
        ) : (
          <div className="space-y-6">
            {/* PPO Outcome Summary Banner */}
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#18201B]">
                <TrendingUp className="w-4 h-4 text-[#2F8F46]" />
                <span>Pre-Placement Offer (PPO) Outcome</span>
              </div>

              {ppoRecord ? (
                <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#18201B] text-sm block">
                      {ppoRecord.designation} at {ppoRecord.companies?.company_name || 'Host Organization'}
                    </span>
                    <span className="text-[#66706A]">
                      Package CTC: <strong className="text-[#1F6B32]">₹{Number(ppoRecord.ctc).toFixed(2)} LPA</strong>
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full border border-[#C5E3CC] bg-[#EAF4EC] text-xs font-bold text-[#1F6B32]">
                    PPO Status: {ppoRecord.status}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] text-xs text-[#66706A]">
                  No PPO recorded yet for your internship.
                </div>
              )}
            </div>

            {/* External Certificate Submissions */}
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#18201B]">
                  <FileText className="w-4 h-4 text-[#2F8F46]" />
                  <span>External Certificate Submissions & AI Trust Scores</span>
                </div>
                <span className="text-xs text-[#66706A]">
                  {extCerts.length} document{extCerts.length !== 1 ? 's' : ''} submitted
                </span>
              </div>

              {extCerts.length === 0 ? (
                <div className="p-6 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A] space-y-2">
                  <p>No external certificates uploaded yet.</p>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="text-[#1F6B32] font-bold hover:underline inline-block"
                  >
                    + Submit your external internship certificate for verification
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extCerts.map((cert) => (
                    <div key={cert.id} className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs text-[#18201B] block">{cert.file_name}</span>
                          <span className="text-[10px] font-mono text-[#66706A] truncate max-w-[180px] block" title={cert.document_hash}>
                            SHA-256: {cert.document_hash.slice(0, 16)}...
                          </span>
                        </div>
                        <span className="text-sm font-black text-[#1F6B32]">{cert.overall_trust_score}% Trust</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#E1E7E2]">
                        <span className="text-[#66706A] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D97706]" />
                          AI Advisory: <strong className="text-[#18201B]">{cert.ai_recommendation}</strong>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          cert.human_review_status === 'APPROVED' ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]' :
                          cert.human_review_status === 'REJECTED' ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]' :
                          'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                        }`}>
                          Human: {cert.human_review_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Institutional Digital Certificate Card */}
            <DigitalCertificateCard
              certificate={certData}
              studentName={profile?.full_name || user?.email}
            />
          </div>
        )}

        {/* External Upload Modal */}
        <ExternalCertificateUploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          studentUserId={user?.id}
          internshipId={activeInternshipId}
          onUploadSuccess={loadData}
        />
      </div>
    </PortalLayout>
  );
};
