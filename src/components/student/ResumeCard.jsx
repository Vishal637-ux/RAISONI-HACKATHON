import React, { useRef, useState } from 'react';
import { Card } from '../common/Card';
import { FileText, Upload, Eye, RefreshCw, Loader2, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResumeCard = ({ resumeUrl, onResumeUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOC, DOCX)
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      toast.error('Invalid resume format. Allowed formats: PDF, DOC, DOCX.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error('Resume file size exceeds the allowed limit (5MB).');
      return;
    }

    try {
      setIsUploading(true);
      await onResumeUploaded(file);
    } catch (err) {
      toast.error(err?.message || 'Resume upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFileName = (url) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'Student_Resume.pdf';
    } catch {
      return 'Student_Resume.pdf';
    }
  };

  return (
    <Card className="p-7 rounded-2xl border border-[#E9DDFE] bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out h-full flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-[#171717] flex items-center gap-2.5">
              <FileText size={20} className="text-[#A874F7]" />
              Resume / Curriculum Vitae
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Upload your official resume for internship applications and mentor reviews</p>
          </div>
          <div className="shrink-0">
            {resumeUrl ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileCheck size={13} />
                Uploaded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Upload Required
              </span>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Resume Content View / Upload Container */}
        {resumeUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#F3EDFF]/40 border border-[#E9DDFE] rounded-xl my-auto">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#A874F7]/10 text-[#A874F7] flex items-center justify-center font-bold shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#171717] block truncate max-w-xs sm:max-w-sm">
                  {getFileName(resumeUrl)}
                </span>
                <span className="text-xs text-[#6B7280]">Supported Formats: PDF, DOC, DOCX (Max 5 MB)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#A874F7] bg-white hover:bg-[#F3EDFF] border border-[#E9DDFE] rounded-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <Eye size={14} />
                Preview Resume
              </a>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#A874F7] hover:bg-[#965be3] rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <RefreshCw size={14} />
                )}
                Replace Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-6 min-h-[220px] border-2 border-dashed border-[#E9DDFE] rounded-xl bg-[#F3EDFF]/20 text-center gap-3.5 my-auto">
            <div className="w-13 h-13 rounded-full bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center shadow-2xs">
              <Upload size={26} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#171717]">No Resume Uploaded</p>
              <p className="text-xs text-[#6B7280] mt-1">
                Supported Formats: <span className="font-semibold text-[#171717]">PDF, DOC, DOCX</span> | Maximum Size: <span className="font-semibold text-[#171717]">5 MB</span>
              </p>
            </div>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#A874F7] hover:bg-[#965be3] rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={15} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Upload Resume
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
