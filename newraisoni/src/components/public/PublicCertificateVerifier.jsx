import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import { ShieldCheck, ShieldAlert, Award, Calendar, Building2, CheckCircle2, ArrowLeft } from 'lucide-react';

export const PublicCertificateVerifier = () => {
  const { certificateId } = useParams();
  const [result, setResult] = useState({ loading: true, isValid: false, certDetails: null });

  useEffect(() => {
    async function verify() {
      if (!certificateId) {
        setResult({ loading: false, isValid: false, certDetails: null });
        return;
      }
      const data = await certificateService.getPublicCertificateVerification(certificateId);
      setResult({ loading: false, ...data });
    }
    verify();
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#18201B] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#E1E7E2] px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2F8F46] text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-xs">
            IT
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#18201B]">INTERTRACK</h1>
            <p className="text-xs text-[#66706A] font-medium">Public Digital Certificate Verification Engine</p>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs font-bold text-[#1F6B32] hover:text-[#2F8F46] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6 my-8">
        {result.loading ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E1E7E2] text-center text-xs text-[#66706A] shadow-xs">
            Verifying digital certificate authenticity against live database...
          </div>
        ) : result.isValid && result.certDetails ? (
          <div className="bg-white rounded-2xl border border-[#E1E7E2] shadow-sm overflow-hidden space-y-6">
            {/* Success Banner */}
            <div className="bg-[#EAF4EC] p-6 border-b border-[#C5E3CC] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1F6B32] text-white flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Officially Verified & Authentic</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#18201B] mt-0.5">
                  Valid Certificate: {result.certDetails.certificateId}
                </h2>
              </div>
            </div>

            {/* Certificate Verification Body */}
            <div className="p-6 space-y-6 text-xs">
              <div className="text-center space-y-2 border-b border-[#E1E7E2] pb-6">
                <span className="text-xs font-semibold text-[#66706A] block">CERTIFIED CANDIDATE</span>
                <h3 className="text-2xl font-extrabold text-[#1F6B32]">
                  {result.certDetails.studentName}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-1">
                  <span className="font-semibold text-[#66706A] block">Internship Position</span>
                  <span className="text-sm font-bold text-[#18201B]">{result.certDetails.internshipTitle}</span>
                </div>

                <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-1">
                  <span className="font-semibold text-[#66706A] block">Host Organization</span>
                  <span className="text-sm font-bold text-[#18201B] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#2F8F46]" />
                    <span>{result.certDetails.companyName}</span>
                  </span>
                </div>

                <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-1">
                  <span className="font-semibold text-[#66706A] block">Date of Issuance</span>
                  <span className="text-sm font-bold text-[#18201B] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#2F8F46]" />
                    <span>{result.certDetails.issueDate}</span>
                  </span>
                </div>

                <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-1">
                  <span className="font-semibold text-[#66706A] block">Verification Status</span>
                  <span className="text-xs font-extrabold text-[#1F6B32]">
                    {result.certDetails.status}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] text-center text-[#66706A]">
                This digital certificate record is verified by InterTrack live database authentication.
              </div>
            </div>
          </div>
        ) : (
          /* Error Banner for Fake / Invalid QR Scans */
          <div className="bg-white rounded-2xl border border-[#FCA5A5] shadow-xs p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FEF2F2] text-[#991B1B] flex items-center justify-center mx-auto border border-[#FCA5A5]">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#991B1B]">Invalid / Unverified Certificate ID</h2>
              <p className="text-xs text-[#66706A] mt-1 max-w-md mx-auto">
                No active institutional certificate record was found for Certificate ID <span className="font-mono font-bold text-[#18201B]">{certificateId || 'UNKNOWN'}</span>.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
