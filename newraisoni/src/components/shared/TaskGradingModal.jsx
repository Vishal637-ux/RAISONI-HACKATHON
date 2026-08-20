import { useState, useEffect } from 'react';
import { X, Star, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

export const TaskGradingModal = ({ isOpen, onClose, task, submission, onGradeSubmission }) => {
  const [gradeRating, setGradeRating] = useState('5.00');
  const [feedbackRemarks, setFeedbackRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (submission) {
      setGradeRating(submission.grade_rating ? String(submission.grade_rating) : '5.00');
      setFeedbackRemarks(submission.remarks || '');
    }
  }, [submission]);

  if (!isOpen || !task || !submission) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numGrade = parseFloat(gradeRating);
    if (isNaN(numGrade) || numGrade < 1.0 || numGrade > 5.0) {
      setErrorMsg('Grade rating must be a numeric value between 1.00 and 5.00.');
      return;
    }

    try {
      setLoading(true);
      await onGradeSubmission(submission.id, {
        gradeRating: numGrade,
        feedbackRemarks: feedbackRemarks.trim(),
      });

      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save grade rating and feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#D97706]" />
            <h3 className="text-lg font-bold text-[#18201B]">Review & Grade Deliverable</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverable Review Summary */}
        <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] space-y-2 text-xs">
          <div className="font-bold text-[#18201B]">{task.title}</div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[#66706A]">Submitted File / Link:</span>
            {submission.file_url ? (
              <a
                href={submission.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#2F8F46] hover:underline"
              >
                <span>View Deliverable</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[#991B1B]">No file link</span>
            )}
          </div>
          {submission.remarks && (
            <div className="text-[11px] text-[#66706A] italic pt-1 border-t border-[#E1E7E2]">
              Student Notes: "{submission.remarks}"
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Grade Rating (1.00 - 5.00) */}
          <div>
            <label className="block font-bold text-[#18201B] mb-1.5">Grade Rating (1.00 to 5.00 Scale) *</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={gradeRating}
                onChange={(e) => setGradeRating(e.target.value)}
                className="w-32 p-3 rounded-lg border border-[#E1E7E2] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] text-[#18201B] font-bold text-sm"
              />
              <div className="flex items-center gap-1 text-[#D97706]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      parseFloat(gradeRating) >= star ? 'fill-[#D97706]' : 'text-[#E1E7E2]'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#66706A] mt-1">1.0 = Unsatisfactory | 3.0 = Satisfactory | 5.0 = Excellent</p>
          </div>

          {/* Feedback & Remarks */}
          <div>
            <label className="block font-bold text-[#18201B] mb-1.5">Mentor Feedback / Remarks *</label>
            <textarea
              value={feedbackRemarks}
              onChange={(e) => setFeedbackRemarks(e.target.value)}
              rows={3}
              placeholder="Provide constructive feedback, code quality evaluation, or remarks for the student..."
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
              {loading ? 'Saving Grade...' : 'Save Grade & Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
