import React, { useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Award, FileCheck, Download, X } from 'lucide-react';

export const CertificatePreviewModal = ({ isOpen, onClose, mentee }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mentee) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cert-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-xl w-full p-6 rounded-2xl shadow-2xl space-y-5 text-center animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <FileCheck size={22} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 id="modal-cert-title" className="text-base font-bold text-[#171717]">
                  Academic Certificate Recommendation
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#A874F7] text-white uppercase tracking-wider">
                  READ ONLY
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">Official Internship Completion Certificate Preview</p>
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

        {/* Certificate Frame Display */}
        <div className="border-4 border-double border-[#A874F7] p-6 rounded-2xl bg-[#F3EDFF]/20 space-y-4 shadow-inner">
          <div className="w-12 h-12 rounded-full bg-white border border-[#E9DDFE] text-[#A874F7] flex items-center justify-center mx-auto shadow-xs">
            <Award size={28} />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#A874F7]">
              G.H. RAISONI COLLEGE OF ENGINEERING
            </span>
            <h4 className="text-lg font-bold text-[#171717]">CERTIFICATE OF INTERNSHIP COMPLETION</h4>
            <p className="text-[11px] text-[#6B7280]">Recommended for Degree Academic Completion</p>
          </div>

          <div className="py-2 text-xs text-[#171717] space-y-1.5">
            <p className="text-[#6B7280]">This certifies that student mentee</p>
            <p className="text-base font-bold text-[#171717]">{mentee.studentName}</p>
            <p className="text-[11px] text-[#6B7280]">Roll No: <strong>{mentee.rollNumber}</strong> • Department of <strong>{mentee.department}</strong></p>
            <p className="pt-2 text-[#4B5563] leading-relaxed">
              Has successfully completed <strong>{mentee.duration || '12 Weeks'}</strong> of Industry Internship as <strong className="font-bold text-[#171717]">{mentee.title || 'Software Developer Intern'}</strong> at <strong className="font-bold text-[#171717]">{mentee.companyName}</strong> with final grade <strong className="font-bold text-[#A874F7]">{mentee.finalGrade || 'A+ (Excellent)'}</strong>.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E9DDFE] flex items-center justify-between text-[11px] text-[#6B7280]">
            <div className="text-left">
              <span className="block font-semibold text-[#171717]">Issue Date</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="text-right">
              <span className="block font-semibold text-[#A874F7]">Recommended By</span>
              <span>Faculty Academic Supervisor</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9DDFE]">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            Close Preview
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              window.print();
            }}
            className="text-xs gap-1.5"
          >
            <Download size={14} />
            <span>Download Certificate PDF</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
