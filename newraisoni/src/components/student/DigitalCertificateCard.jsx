import React from 'react';
import { Award, Download, CheckCircle2, FileText, QrCode, ExternalLink, Calendar, Building2 } from 'lucide-react';

export const DigitalCertificateCard = ({ certificate, studentName }) => {
  if (!certificate) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Certificate Issued</h3>
        <p className="text-xs text-[#66706A]">
          Your digital QR certificate will be issued automatically upon formal internship completion sign-off by the TPO.
        </p>
      </div>
    );
  }

  const certId = certificate.certificate_id;
  const issueDate = new Date(certificate.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const companyName = certificate.internships?.companies?.company_name || 'Host Organization';
  const internshipTitle = certificate.internships?.internship_title || 'Software Engineering Intern';
  const verifyUrl = `/verify-certificate/${certId}`;

  const handleDownload = () => {
    if (!certificate.pdf_url) return;
    const link = document.createElement('a');
    link.href = certificate.pdf_url;
    link.download = `${certId}_Certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E1E7E2] shadow-sm overflow-hidden space-y-6">
      {/* Certificate Header Banner */}
      <div className="bg-gradient-to-r from-[#1F6B32] to-[#2F8F46] p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#C5E3CC] uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-[#C5E3CC]" />
            <span>Official Institutional Document</span>
          </div>
          <h2 className="text-xl font-extrabold">{certificate.certificate_id}</h2>
          <p className="text-xs text-white/80 mt-1">
            Verified Digital Internship Certificate of Completion
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2.5 bg-white text-[#1F6B32] hover:bg-[#F8FAF9] text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-[#2F8F46]" />
          <span>Download PDF Certificate</span>
        </button>
      </div>

      {/* Certificate Metadata Body */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-1">
            <span className="font-semibold text-[#66706A] block">Candidate Name</span>
            <span className="text-sm font-bold text-[#18201B]">{studentName || 'Student Candidate'}</span>
          </div>

          <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-1">
            <span className="font-semibold text-[#66706A] block">Host Organization</span>
            <span className="text-sm font-bold text-[#18201B] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#2F8F46]" />
              <span>{companyName}</span>
            </span>
          </div>

          <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-1">
            <span className="font-semibold text-[#66706A] block">Internship Position</span>
            <span className="text-sm font-bold text-[#18201B]">{internshipTitle}</span>
          </div>

          <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-1">
            <span className="font-semibold text-[#66706A] block">Date of Issuance</span>
            <span className="text-sm font-bold text-[#18201B] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#2F8F46]" />
              <span>{issueDate}</span>
            </span>
          </div>
        </div>

        {/* Public Verification Link Bar */}
        <div className="bg-[#EAF4EC] p-4 rounded-xl border border-[#C5E3CC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-[#2F8F46] flex items-center justify-center font-bold shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#1F6B32] block">Public QR Code Verification Active</span>
              <span className="text-[11px] text-[#66706A]">Anyone can verify this certificate authenticity online.</span>
            </div>
          </div>

          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Verify Certificate Online</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
