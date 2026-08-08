import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert, X, Check, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const MidTermReviewModal = ({ isOpen, onClose, mentee, onReviewSubmit }) => {
  const [riskStatus, setRiskStatus] = useState('On Track');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (mentee) {
      setRiskStatus(mentee.riskStatus || 'On Track');
      setRemarks(mentee.midTermRemarks || 'Academic progress on track. Attendance regularity and work log consistency satisfy degree requirements.');
      setIsEditing(!mentee.hasMidTermReview);
    }
  }, [mentee]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mentee) return null;

  const isViewOnly = mentee.hasMidTermReview && !isEditing;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onReviewSubmit({
        menteeId: mentee.id,
        riskStatus,
        remarks,
        studentName: mentee.studentName,
      });
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-review-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-lg w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-review-title" className="text-base font-bold text-[#171717]">
                  {isViewOnly ? 'Recorded Mid-Term Academic Review' : 'Record Mid-Term Academic Review'}
                </h3>
                {isViewOnly && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#A874F7] text-white uppercase tracking-wider">
                    Read-Only Record
                  </span>
                )}
              </div>
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

        {/* Risk Status Selector / Read-Only View */}
        <div className="space-y-2 text-xs">
          <label className="font-bold text-[#171717] uppercase tracking-wider block">
            Academic Risk Indicator
          </label>
          {isViewOnly ? (
            <div className="p-3.5 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] flex items-center justify-between">
              <span className="text-[#6B7280]">Assigned Academic Risk Status:</span>
              <span className={`font-bold px-3 py-1 rounded-full text-xs border ${
                riskStatus === 'High Risk'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : riskStatus === 'Moderate Risk'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {riskStatus}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { status: 'On Track', label: 'On Track ✅', activeBg: 'bg-emerald-600 text-white' },
                { status: 'Moderate Risk', label: 'Moderate Risk ⚡', activeBg: 'bg-amber-600 text-white' },
                { status: 'High Risk', label: 'High Risk ⚠️', activeBg: 'bg-rose-600 text-white' },
              ].map((opt) => {
                const isSelected = riskStatus === opt.status;
                return (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => setRiskStatus(opt.status)}
                    className={`p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer text-center ${
                      isSelected
                        ? `${opt.activeBg} border-transparent shadow-xs`
                        : 'bg-white text-[#171717] border-[#E9DDFE] hover:bg-[#F3EDFF]/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Remarks Input / Read-Only Display */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-[#171717] block">
            Mid-Term Academic Progress Remarks
          </label>
          {isViewOnly ? (
            <p className="p-3.5 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] leading-relaxed">
              {remarks}
            </p>
          ) : (
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter mid-term academic evaluation observations, attendance guidance, and student recommendations..."
              className="w-full p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE]">
          {isViewOnly ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-[#A874F7] hover:underline cursor-pointer"
              >
                + Record New Review
              </button>
              <Button type="button" variant="primary" onClick={onClose} className="text-xs px-5">
                Close Review
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                isLoading={submitting}
                disabled={submitting}
                className="text-xs gap-1.5"
              >
                <Check size={14} />
                <span>Save Mid-Term Review</span>
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
