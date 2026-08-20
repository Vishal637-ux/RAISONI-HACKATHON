import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { certificateVerificationService } from '../../services/certificateVerificationService';

export const ExternalCertificateUploadModal = ({ isOpen, onClose, studentUserId, internshipId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setErrorMsg('Only PDF certificate files are allowed.');
        setSelectedFile(null);
        return;
      }
      setErrorMsg('');
      setSuccessMsg('');
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a PDF certificate file to upload.');
      return;
    }
    if (!studentUserId || !internshipId) {
      setErrorMsg('Student candidate or active internship record not resolved.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg('');

      // 1. Compute SHA-256 Hash
      const documentHash = await certificateVerificationService.computeSHA256(selectedFile);

      // 2. Submit to external_certificates table
      await certificateVerificationService.submitExternalCertificate({
        studentId: studentUserId,
        internshipId: internshipId,
        fileName: selectedFile.name,
        filePath: `certificates/external_${documentHash.slice(0, 8)}.pdf`,
        documentHash: documentHash,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type || 'application/pdf',
        fileData: selectedFile,
      });

      setSuccessMsg(`Certificate '${selectedFile.name}' submitted successfully for TPO adjudication!`);
      setSelectedFile(null);
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Upload Error:', err);
      setErrorMsg(err.message || 'Failed to upload external certificate.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E1E7E2] space-y-5">
        <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EAF4EC] rounded-lg text-[#1F6B32]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#18201B]">Upload External Certificate</h3>
              <p className="text-xs text-[#66706A]">Submit third-party completion certificate for AI verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#66706A] hover:bg-[#F8FAF9] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-[#EAF4EC] border border-[#C5E3CC] rounded-xl text-xs text-[#1F6B32] flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Upload Box */}
        <div className="border-2 border-dashed border-[#E1E7E2] hover:border-[#1F6B32] bg-[#F8FAF9] rounded-xl p-6 text-center transition-colors">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="ext-cert-file-input"
          />
          <label htmlFor="ext-cert-file-input" className="cursor-pointer space-y-2 block">
            <FileText className="w-8 h-8 text-[#1F6B32] mx-auto" />
            <div className="text-xs font-bold text-[#18201B]">
              {selectedFile ? selectedFile.name : 'Click to select PDF document'}
            </div>
            <p className="text-[11px] text-[#66706A]">Maximum 10MB PDF format only</p>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#66706A] hover:bg-[#F8FAF9] rounded-xl border border-[#E1E7E2]"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-[#1F6B32] hover:bg-[#185427] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {uploading ? 'Hashing & Uploading...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
};
