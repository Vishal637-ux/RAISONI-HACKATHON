import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle, FileCheck } from 'lucide-react';

export const TaskSubmissionModal = ({ isOpen, onClose, task, onSubmitDeliverable }) => {
  const [fileUrl, setFileUrl] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fileUrl.trim()) {
      setErrorMsg('Deliverable file URL or submission repository link is required.');
      return;
    }

    try {
      setLoading(true);
      await onSubmitDeliverable(task.id, {
        fileUrl: fileUrl.trim(),
        remarks: remarks.trim(),
      });

      setFileUrl('');
      setRemarks('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit task deliverable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#2F8F46]" />
            <h3 className="text-lg font-bold text-[#18201B]">Submit Task Deliverable</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="p-3.5 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] space-y-1">
          <div className="text-xs font-bold text-[#18201B]">{task.title}</div>
          <p className="text-xs text-[#66706A] line-clamp-2">{task.description}</p>
          <div className="text-[11px] text-[#1F6B32] font-semibold pt-1">
            Due Date: {task.due_date}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#18201B] mb-1.5">Deliverable File URL / Repository Link *</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://github.com/username/project or https://drive.google.com/..."
              className="w-full p-3 rounded-lg border border-[#E1E7E2] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] text-[#18201B]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#18201B] mb-1.5">Submission Notes / Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add any technical implementation notes or highlights for your mentor..."
              className="w-full p-3 rounded-lg border border-[#E1E7E2] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] text-[#18201B] resize-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-bold transition-all shadow-xs"
            >
              {loading ? 'Submitting...' : 'Upload Deliverable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
