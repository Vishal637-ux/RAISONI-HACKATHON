import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Award, CheckCircle2, ShieldCheck, X, Check, FileCheck, AlertCircle } from 'lucide-react';

export const FinalEvaluationModal = ({ isOpen, onClose, mentee, onEvaluationSubmit }) => {
  const [finalGrade, setFinalGrade] = useState('A+ (Excellent)');
  const [evaluationScore, setEvaluationScore] = useState(92);
  const [certificateRecommended, setCertificateRecommended] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mentee) {
      if (mentee.finalGrade) setFinalGrade(mentee.finalGrade);
      if (mentee.evaluationScore) setEvaluationScore(mentee.evaluationScore);
      if (mentee.certificateRecommended !== undefined) setCertificateRecommended(mentee.certificateRecommended);
      setRemarks(mentee.remarks || 'Final academic internship evaluation approved for degree sign-off.');
      setInternalNotes(mentee.academicNotes || 'Internal faculty degree evaluation records archived.');
      setErrors({});
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

  const isLocked = ['Approved & Signed Off', 'Final Approved', 'Completed'].includes(mentee.evaluationStatus) || mentee.status === 'Completed';

  // Read-Only Computed Metrics
  const attScore = mentee.attendanceScore || 88;
  const wlScore = mentee.workLogScore || 85;
  const progressScore = Math.round(attScore * 0.4 + wlScore * 0.4 + 20);

  // Standing calculation
  const getAcademicStanding = (grade) => {
    if (grade.includes('O')) return 'Outstanding';
    if (grade.includes('A+')) return 'Excellent';
    if (grade.includes('A')) return 'Very Good';
    if (grade.includes('B+')) return 'Good';
    return 'Satisfactory';
  };

  const validate = () => {
    const newErr = {};
    if (!finalGrade) newErr.finalGrade = 'Grade selection is required.';
    if (evaluationScore === '' || evaluationScore === null || isNaN(evaluationScore)) {
      newErr.evaluationScore = 'Evaluation score is required.';
    } else if (evaluationScore < 0 || evaluationScore > 100) {
      newErr.evaluationScore = 'Score must be between 0 and 100.';
    }
    if (!remarks.trim()) {
      newErr.remarks = 'Student-visible academic remarks are required.';
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (isLocked || submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onEvaluationSubmit({
        menteeId: mentee.id,
        finalGrade,
        evaluationScore,
        certificateRecommended,
        remarks,
        internalNotes,
        studentName: mentee.studentName,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-eval-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-eval-title" className="text-base font-bold text-[#171717]">
                  {isLocked ? 'Final Academic Sign-Off Record' : 'Final Academic Evaluation & Degree Sign-Off'}
                </h3>
                {isLocked && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#A874F7] text-white uppercase tracking-wider">
                    READ ONLY SIGN-OFF
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

        {/* Requirement #2: 4 Compact Read-Only Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-0.5">
            <span className="text-[#6B7280] text-[11px] block">Attendance %</span>
            <span className="text-sm font-bold text-emerald-700 block">{attScore}% Present</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-0.5">
            <span className="text-[#6B7280] text-[11px] block">Work Log %</span>
            <span className="text-sm font-bold text-blue-700 block">{wlScore}% Logged</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-0.5">
            <span className="text-[#6B7280] text-[11px] block">Progress %</span>
            <span className="text-sm font-bold text-[#A874F7] block">{progressScore}% Score</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-0.5">
            <span className="text-[#6B7280] text-[11px] block">Final Score</span>
            <span className="text-sm font-bold text-[#171717] block">
              {mentee.evaluationScore ? `${mentee.evaluationScore} / 100` : 'Pending'}
            </span>
          </div>
        </div>

        {/* Requirement #3: Live Grade Preview Card */}
        <div className="p-4 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A874F7] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              {finalGrade.split(' ')[0]}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                Live Academic Standing Preview
              </span>
              <p className="font-bold text-[#171717] text-sm mt-0.5">
                Grade: <strong className="text-[#A874F7]">{finalGrade}</strong> • Score: <strong>{evaluationScore}/100</strong>
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            Standing: {getAcademicStanding(finalGrade)}
          </span>
        </div>

        {/* Grade Assignment & Score Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#171717] block">Official Letter Grade</label>
            {isLocked ? (
              <p className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] font-bold">
                {finalGrade}
              </p>
            ) : (
              <div>
                <select
                  value={finalGrade}
                  onChange={(e) => {
                    setFinalGrade(e.target.value);
                    if (errors.finalGrade) setErrors((prev) => ({ ...prev, finalGrade: null }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                >
                  <option value="O (Outstanding)">O (Outstanding)</option>
                  <option value="A+ (Excellent)">A+ (Excellent)</option>
                  <option value="A (Very Good)">A (Very Good)</option>
                  <option value="B+ (Good)">B+ (Good)</option>
                  <option value="Pass">Pass</option>
                </select>
                {errors.finalGrade && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.finalGrade}</p>}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#171717] block">Total Evaluation Marks (0 - 100)</label>
            {isLocked ? (
              <p className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] font-bold">
                {evaluationScore} / 100 Marks
              </p>
            ) : (
              <div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={evaluationScore}
                  onChange={(e) => {
                    setEvaluationScore(Number(e.target.value));
                    if (errors.evaluationScore) setErrors((prev) => ({ ...prev, evaluationScore: null }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
                {errors.evaluationScore && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.evaluationScore}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Certificate Recommendation Option */}
        <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <FileCheck size={18} className="text-[#A874F7]" />
            <div>
              <span className="font-bold text-[#171717] block">Recommend Completion Certificate</span>
              <span className="text-[11px] text-[#6B7280]">Recommend formal degree completion certificate generation</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={certificateRecommended}
            onChange={(e) => !isLocked && setCertificateRecommended(e.target.checked)}
            disabled={isLocked}
            className="w-4 h-4 rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7] cursor-pointer"
          />
        </div>

        {/* Remarks Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-[#171717] block">
              Student-Visible Academic Remarks <span className="text-[#6B7280] font-normal">(Public)</span>
            </label>
            {isLocked ? (
              <p className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] text-xs">
                {remarks}
              </p>
            ) : (
              <div>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if (errors.remarks) setErrors((prev) => ({ ...prev, remarks: null }));
                  }}
                  placeholder="Enter academic feedback visible on final student transcript record..."
                  className="w-full p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
                {errors.remarks && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.remarks}</p>}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#171717] block">
              Faculty Confidential Evaluation Notes <span className="text-[#A874F7] font-normal">(Private)</span>
            </label>
            {isLocked ? (
              <p className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 text-[#171717] text-xs">
                {internalNotes}
              </p>
            ) : (
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Enter confidential faculty evaluation notes for department records..."
                className="w-full p-3 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            )}
          </div>
        </div>

        {/* Read-Only Evaluator Metadata (Requirement #1) */}
        {isLocked && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Evaluated By: <strong className="font-bold text-[#171717]">Faculty Academic Supervisor</strong></span>
            <span>Evaluation Date: <strong className="font-bold text-[#171717]">{new Date().toLocaleDateString()}</strong></span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9DDFE]">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="text-xs">
            {isLocked ? 'Close Sign-Off Record' : 'Cancel'}
          </Button>
          {!isLocked && (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={submitting}
              className="text-xs gap-1.5"
            >
              <Check size={14} />
              <span>Issue Final Degree Approval</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
