import React, { useState } from 'react';
import { profileService } from '../../services/profileService';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ResumeUploader = ({ userId, currentResumeUrl, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMsg(null);

    // 1. Client-side File Format Validation (PDF Only)
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Invalid file type! Only PDF format (.pdf) resumes are allowed.');
      e.target.value = '';
      return;
    }

    // 2. Client-side File Size Validation (Max 5 MB)
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit.`);
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      const result = await profileService.uploadResume(userId, file);
      setSuccessMsg('Resume PDF uploaded and linked successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(result.resumeUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E2] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#2F8F46]" />
          <h3 className="text-sm font-bold text-[#18201B]">Student Verified Resume</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF4EC] text-[#1F6B32]">
          PDF Only (Max 5MB)
        </span>
      </div>

      {currentResumeUrl ? (
        <div className="flex items-center justify-between p-3.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-lg mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <CheckCircle2 className="w-5 h-5 text-[#2F8F46] shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-[#18201B] truncate">Resume Document Active</p>
              <a
                href={currentResumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#2F8F46] hover:underline font-medium truncate block"
              >
                View Uploaded PDF Document
              </a>
            </div>
          </div>
          <span className="text-xs text-[#1F6B32] bg-white px-2 py-1 rounded border border-[#E1E7E2] font-semibold shrink-0">
            Verified
          </span>
        </div>
      ) : (
        <div className="p-3.5 bg-[#F8FAF9] border border-dashed border-[#E1E7E2] rounded-lg mb-4 text-center">
          <p className="text-xs text-[#66706A]">No resume uploaded yet. PDF upload required for eligibility.</p>
        </div>
      )}

      {/* Upload Box */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E1E7E2] hover:border-[#2F8F46] bg-[#F8FAF9] hover:bg-[#F5FAF6] rounded-xl p-4 cursor-pointer transition-colors group">
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-[#2F8F46] font-semibold py-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Uploading to Private Bucket...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <UploadCloud className="w-8 h-8 text-[#66706A] group-hover:text-[#2F8F46] mb-1.5 transition-colors" />
            <span className="text-xs font-bold text-[#18201B] group-hover:text-[#2F8F46]">
              Click to browse or upload updated Resume PDF
            </span>
            <span className="text-[11px] text-[#66706A] mt-0.5">Strictly PDF files under 5.0 MB</span>
          </div>
        )}
      </label>

      {/* Status Messages */}
      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-3 flex items-center gap-2 p-3 text-xs bg-[#EAF4EC] text-[#1F6B32] border border-[#2F8F46]/20 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2F8F46]" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
