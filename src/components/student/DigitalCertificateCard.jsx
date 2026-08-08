import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../common/Button';
import { Award, Download, Printer, ShieldCheck, CheckCircle2, Calendar, Building, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const DigitalCertificateCard = ({ internship, certificate }) => {
  const printRef = useRef(null);

  if (!internship || !certificate) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://portal.internship.edu';
  const verificationUrl = `${origin}/verify-certificate/${certificate.certificateId}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    toast.success('Certificate PDF download initiated!');
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#171717]">Verified Completion Certificate</h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Official Document
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Certificate ID: <strong className="font-mono text-[#171717]">{certificate.certificateId}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="text-xs py-2 px-4 gap-2"
          >
            <Printer size={14} />
            <span>Print Certificate</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleDownloadPdf}
            className="text-xs py-2 px-4 gap-2"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Printable Certificate Card */}
      <div
        ref={printRef}
        className="bg-white border-8 border-[#F3EDFF] p-8 sm:p-12 rounded-3xl shadow-lg relative overflow-hidden text-center print:border-4 print:shadow-none print:m-0 print:p-8"
      >
        {/* Certificate Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award size={400} />
        </div>

        {/* Institution & Company Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-6 mb-8 gap-4">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 text-[#A874F7] font-bold text-lg tracking-wide">
              <Award size={24} />
              <span>G. H. RAISONI COLLEGE OF ENGINEERING</span>
            </div>
            <p className="text-xs text-[#6B7280] font-medium">Department of Computer Science & Engineering</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] block">Host Organization</span>
            <span className="text-sm font-bold text-[#171717]">{internship.companyName}</span>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A874F7] bg-[#F3EDFF] px-4 py-1.5 rounded-full border border-[#E9DDFE]">
            CERTIFICATE OF INTERNSHIP COMPLETION
          </span>
          <p className="text-xs text-[#6B7280] pt-3">This is to officially certify that</p>
        </div>

        {/* Student Name */}
        <div className="space-y-1 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] underline decoration-[#A874F7]/40 decoration-2 underline-offset-8">
            {internship.studentName}
          </h1>
          <p className="text-xs text-[#6B7280] pt-1">
            Roll No: <strong className="text-[#171717]">{internship.rollNumber}</strong> | Department: <strong className="text-[#171717]">{internship.department}</strong>
          </p>
        </div>

        {/* Certificate Body */}
        <div className="max-w-2xl mx-auto space-y-3 mb-10 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
          <p>
            has successfully completed the formal internship program as{' '}
            <strong className="text-[#171717] font-semibold">{internship.title}</strong> at{' '}
            <strong className="text-[#171717] font-semibold">{internship.companyName}</strong>.
          </p>
          <p className="text-xs text-[#6B7280]">
            Duration: <strong className="text-[#171717]">{formatDate(internship.startDate)}</strong> to{' '}
            <strong className="text-[#171717]">{formatDate(internship.endDate)}</strong>
          </p>
          <p className="text-xs text-[#6B7280] pt-2 italic">
            During this period, the candidate demonstrated outstanding professional performance, completed assigned deliverables, and satisfied all institutional evaluation requirements.
          </p>
        </div>

        {/* Signatures & Real QR Code Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end border-t border-[#E9DDFE] pt-8">
          {/* Faculty Mentor Signature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 border-b border-[#171717] pb-1 mb-1 font-serif text-sm italic text-[#171717]">
              {internship.facultyMentorName}
            </div>
            <span className="text-[11px] font-semibold text-[#171717]">Faculty Supervisor</span>
            <span className="text-[10px] text-[#6B7280]">GHRCEM Academic Board</span>
          </div>

          {/* Real QR Code Verification */}
          <div className="flex flex-col items-center text-center">
            <div className="p-2 bg-white border border-[#E9DDFE] rounded-xl shadow-2xs mb-1">
              <QRCodeSVG value={verificationUrl} size={84} level="M" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#171717]">{certificate.certificateId}</span>
            <span className="text-[9px] text-[#6B7280]">Scan to Verify Authenticity</span>
          </div>

          {/* Company Mentor Signature */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 border-b border-[#171717] pb-1 mb-1 font-serif text-sm italic text-[#171717]">
              {internship.companyMentorName}
            </div>
            <span className="text-[11px] font-semibold text-[#171717]">Industry Supervisor</span>
            <span className="text-[10px] text-[#6B7280]">{internship.companyName}</span>
          </div>
        </div>

        {/* Certificate Issue Date Footer */}
        <div className="mt-8 pt-4 border-t border-[#F3EDFF] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#6B7280]">
          <span>Issued Date: {formatDate(certificate.issuedAt)}</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 size={12} /> System Authenticated & Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};
