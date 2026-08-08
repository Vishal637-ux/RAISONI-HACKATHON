import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import { Card } from '../components/common/Card';
import { Loader } from '../components/common/Loader';
import { Award, ShieldCheck, AlertTriangle, CheckCircle2, Calendar, Building, User, ArrowLeft, ExternalLink } from 'lucide-react';

export const PublicVerifyCertificatePage = () => {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function verify() {
      if (!certificateId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await certificateService.verifyCertificate(certificateId);
        setResult(res);
      } catch (err) {
        console.error('Verification error:', err);
        setResult({ isValid: false, message: 'Verification error occurred.' });
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-[#F3EDFF]/50 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-4 border-b border-[#E9DDFE] mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A874F7] text-white flex items-center justify-center font-bold text-base shadow-sm">
            <Award size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#171717]">Internship Verification Portal</h2>
            <p className="text-xs text-[#6B7280]">Official Academic & Industry Certificate Verification</p>
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A874F7] hover:underline"
        >
          <span>Student Portal Login</span>
          <ExternalLink size={13} />
        </Link>
      </header>

      {/* Main Verification Body */}
      <main className="max-w-3xl mx-auto w-full flex-1">
        {loading ? (
          <Card className="bg-white border border-[#E9DDFE] p-10 text-center rounded-2xl shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader size="lg" />
              <p className="text-xs font-semibold text-[#6B7280]">Verifying Certificate Authenticity...</p>
            </div>
          </Card>
        ) : result?.isValid ? (
          <Card className="bg-white border border-[#E9DDFE] p-6 sm:p-10 rounded-3xl shadow-md space-y-6">
            {/* Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E9DDFE] pb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                    <CheckCircle2 size={13} />
                    <span>VALID & AUTHENTIC CERTIFICATE</span>
                  </div>
                  <h3 className="text-base font-bold text-[#171717]">Official Completion Record Verified</h3>
                </div>
              </div>

              <div className="text-left sm:text-right bg-[#F3EDFF]/50 p-3 rounded-xl border border-[#E9DDFE]">
                <span className="text-[10px] text-[#6B7280] font-semibold uppercase block">Certificate ID</span>
                <span className="text-sm font-mono font-bold text-[#A874F7]">{result.certificateId}</span>
              </div>
            </div>

            {/* Verified Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F3EDFF]/20 p-5 rounded-2xl border border-[#E9DDFE] text-xs">
              <div className="space-y-1">
                <span className="text-[#6B7280] font-semibold block text-[10px] uppercase">Candidate Name</span>
                <p className="font-bold text-[#171717] text-sm flex items-center gap-1.5">
                  <User size={14} className="text-[#A874F7]" /> {result.studentName}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#6B7280] font-semibold block text-[10px] uppercase">Host Organization</span>
                <p className="font-bold text-[#171717] text-sm flex items-center gap-1.5">
                  <Building size={14} className="text-[#A874F7]" /> {result.companyName}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#6B7280] font-semibold block text-[10px] uppercase">Internship Program</span>
                <p className="font-semibold text-[#171717]">{result.internshipTitle}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[#6B7280] font-semibold block text-[10px] uppercase">Academic Institution</span>
                <p className="font-semibold text-[#171717]">G. H. Raisoni College of Engineering</p>
              </div>

              <div className="space-y-1">
                <span className="text-[#6B7280] font-semibold block text-[10px] uppercase">Supervisors</span>
                <p className="text-[#4B5563]">
                  {result.facultyMentorName} (Faculty) / {result.companyMentorName} (Industry)
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#6B7280] font-semibold block text-[10px] uppercase">Issue Record</span>
                <p className="text-[#4B5563] flex items-center gap-1">
                  <Calendar size={13} className="text-[#A874F7]" /> Issued {new Date(result.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Authenticity Notice */}
            <div className="text-center pt-2">
              <p className="text-[11px] text-[#6B7280]">
                This record has been cryptographically verified against the Central Internship Management Database.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="bg-rose-50 border border-rose-200 p-8 sm:p-10 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-rose-900">Certificate Record Not Found</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
              The Certificate ID <strong className="font-mono">{certificateId}</strong> could not be verified. Please check the ID or contact the institution administrator.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#A874F7] rounded-xl hover:bg-[#965be3] transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              Return to Portal Home
            </Link>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full text-center py-6 text-[11px] text-[#6B7280] border-t border-[#E9DDFE] mt-8">
        © 2026 G. H. Raisoni College of Engineering. All rights reserved. Encrypted Verification Portal.
      </footer>
    </div>
  );
};
