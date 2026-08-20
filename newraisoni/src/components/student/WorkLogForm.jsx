import React, { useState } from 'react';
import { Send, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WorkLogForm = ({ onSubmitLog, loading = false }) => {
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const charCount = description.trim().length;
  const isValid = charCount >= 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isValid) {
      setErrorMsg('Work log description must be at least 20 characters long.');
      return;
    }

    try {
      await onSubmitLog(description.trim());
      setDescription('');
      setSuccessMsg('Daily work log submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit daily work log.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#18201B]">Record Daily Work Log</h3>
          <p className="text-xs text-[#66706A]">
            Summarize key tasks, deliverables, and learnings completed during your internship today.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe your daily work tasks in detail (minimum 20 characters required)..."
            className="w-full p-3.5 text-sm rounded-lg border border-[#E1E7E2] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] focus:border-transparent text-[#18201B] resize-none"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-1 text-xs text-[#66706A]">
            <span className={isValid ? 'text-[#2F8F46] font-semibold' : 'text-[#D97706]'}>
              {charCount} / 20 minimum characters required
            </span>
            <span>Formatted plain text log</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#991B1B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-[#EAF4EC] border border-[#C5E3CC] rounded-lg text-xs text-[#1F6B32] flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2F8F46]" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isValid}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${
            loading || !isValid
              ? 'bg-[#A3B8A8] cursor-not-allowed'
              : 'bg-[#2F8F46] hover:bg-[#1F6B32] shadow-xs'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Submitting Log...' : 'Submit Daily Work Log'}</span>
        </button>
      </form>
    </div>
  );
};
