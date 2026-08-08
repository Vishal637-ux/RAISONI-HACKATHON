import React, { useEffect } from 'react';
import { Card } from '../common/Card';
import { FileText, Download, CheckCircle2, AlertTriangle, X, ShieldCheck, FileCheck, Clock } from 'lucide-react';

export const OfferLetterModal = ({ isOpen, onClose, mentee }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mentee) return null;

  const metadata = mentee.offerLetterMetadata || {
    filename: 'OfferLetter_Document.pdf',
    filesize: '245 KB',
    uploadDate: '2026-05-15',
    documentType: 'PDF Document',
    verificationStatus: 'Verified',
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} />
            Verified & Authentic
          </span>
        );
      case 'Readable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <FileCheck size={13} />
            Readable Document
          </span>
        );
      case 'Missing Signature':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={13} />
            Missing Signature
          </span>
        );
      case 'Invalid Format':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={13} />
            Invalid Format
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
            <Clock size={13} />
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-offer-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <FileText size={22} />
            </div>
            <div>
              <h3 id="modal-offer-title" className="text-lg font-bold text-[#171717]">Offer Letter Document Verification</h3>
              <p className="text-xs text-[#6B7280]">
                Mentee: <strong className="font-semibold text-[#171717]">{mentee.studentName}</strong> ({mentee.rollNumber})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#A874F7]" />
            <span className="text-xs font-bold text-[#171717]">Verification Status:</span>
          </div>
          {getStatusBadge(metadata.verificationStatus)}
        </div>

        {/* Document Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80 text-xs">
          <div>
            <span className="text-[#6B7280] text-[11px] block">Filename</span>
            <span className="font-semibold text-[#171717] truncate block">{metadata.filename}</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">File Size</span>
            <span className="font-semibold text-[#171717] block">{metadata.filesize}</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">Upload Date</span>
            <span className="font-semibold text-[#171717] block">{metadata.uploadDate}</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">Format</span>
            <span className="font-semibold text-[#171717] block">{metadata.documentType}</span>
          </div>
        </div>

        {/* Preview Frame / Placeholder */}
        <div className="bg-[#F3EDFF]/20 border border-[#E9DDFE] rounded-xl p-8 text-center min-h-[220px] flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E9DDFE] text-[#A874F7] flex items-center justify-center shadow-xs">
            <FileText size={30} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#171717]">{metadata.filename}</p>
            <p className="text-xs text-[#6B7280]">Official Internship Offer Letter issued by {mentee.companyName}</p>
          </div>
          {mentee.offerLetterUrl ? (
            <a
              href={mentee.offerLetterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A874F7] text-white text-xs font-semibold hover:bg-[#965BEB] transition-colors shadow-xs"
            >
              <Download size={14} />
              <span>Download Official Offer Letter PDF</span>
            </a>
          ) : (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
              No Document Uploaded Yet
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#E9DDFE]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-[#E9DDFE] text-xs font-semibold text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            Close Document Preview
          </button>
        </div>
      </Card>
    </div>
  );
};
