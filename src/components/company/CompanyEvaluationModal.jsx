import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  X,
  Award,
  User,
  Building2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Lock,
  History,
  ShieldCheck,
  Star,
  MessageSquare,
  FileText,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';

// 9 Weighted Technical Competencies (Sum = 100%)
const CRITERIA_WEIGHTS = [
  { key: 'codeQuality', label: 'Code Quality & Architecture', weight: 25 },
  { key: 'taskCompletion', label: 'Task Completion & Timeliness', weight: 20 },
  { key: 'problemSolving', label: 'Problem Solving & Debugging', weight: 15 },
  { key: 'techKnowledge', label: 'Technical Knowledge & Stack', weight: 10 },
  { key: 'communication', label: 'Technical Communication', weight: 10 },
  { key: 'teamCollaboration', label: 'Team Collaboration & Agile', weight: 5 },
  { key: 'learningAbility', label: 'Learning Ability & Adaptability', weight: 5 },
  { key: 'industryAttendance', label: 'Industry Attendance & Discipline', weight: 5 },
  { key: 'professionalism', label: 'Professionalism & Work Ethics', weight: 5 },
];

export const CompanyEvaluationModal = ({ isOpen, onClose, evalRecord, onSubmitEval }) => {
  const [ratings, setRatings] = useState({
    codeQuality: 90,
    taskCompletion: 85,
    problemSolving: 90,
    techKnowledge: 85,
    communication: 80,
    teamCollaboration: 90,
    learningAbility: 90,
    industryAttendance: 95,
    professionalism: 90,
  });

  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [mentorNotes, setMentorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (evalRecord) {
      if (evalRecord.ratings) {
        setRatings({ ...evalRecord.ratings });
      }
      setStrengths(evalRecord.strengths || '');
      setImprovements(evalRecord.improvements || '');
      setMentorNotes(evalRecord.mentorNotes || '');
    }
  }, [evalRecord]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Requirement #2 & #3: Live Weighted Score & Grade Calculation
  const computedMetrics = useMemo(() => {
    let totalScore = 0;
    CRITERIA_WEIGHTS.forEach((c) => {
      const val = Number(ratings[c.key]) || 80;
      totalScore += (val * c.weight) / 100;
    });

    const score = Math.round(totalScore);

    let grade = 'A+';
    let category = 'Outstanding';
    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

    if (score >= 90) {
      grade = 'A+';
      category = 'Outstanding';
      badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (score >= 80) {
      grade = 'A';
      category = 'Excellent';
      badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (score >= 70) {
      grade = 'B';
      category = 'Good';
      badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (score >= 60) {
      grade = 'C';
      category = 'Satisfactory';
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else {
      grade = 'D';
      category = 'Needs Improvement';
      badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
    }

    return { score, grade, category, badgeClass };
  }, [ratings]);

  if (!isOpen || !evalRecord) return null;

  // Requirement #7: Decision Locking (If already submitted/completed, open in Read-Only Mode)
  const isCompleted = evalRecord.status === 'Completed' || evalRecord.status === 'Evaluation Submitted';

  const handleRatingChange = (key, value) => {
    if (isCompleted) return;
    setRatings((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!strengths.trim()) {
      toast.error('Please describe student technical strengths');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitEval(evalRecord.id, {
        ratings,
        overallScore: computedMetrics.score,
        grade: computedMetrics.grade,
        performanceCategory: computedMetrics.category,
        strengths,
        improvements,
        mentorNotes,
      });

      toast.success(`Technical evaluation submitted for ${evalRecord.studentName} (${computedMetrics.grade} - ${computedMetrics.score}%)`);
      onClose();
    } catch {
      toast.error('Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eval-modal-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="eval-modal-title" className="text-base font-bold text-[#171717]">
                  {isCompleted ? 'View Technical Evaluation Sign-Off' : 'Technical Performance Evaluation'}
                </h3>
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={10} />
                    Evaluation Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Student Engineer: <strong className="text-[#171717]">{evalRecord.studentName}</strong> ({evalRecord.rollNumber})
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

        {/* Live Score & Grade Preview Card - Requirements #2, #3, #8 */}
        <div className="p-4 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">
              LIVE TECHNICAL SCORE & GRADE PREVIEW
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-[#171717]">{computedMetrics.score}%</span>
              <span className="text-xs text-[#6B7280] font-semibold">Overall Technical Rating</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border text-center font-bold ${computedMetrics.badgeClass}`}>
              <span className="text-xs block">Grade {computedMetrics.grade}</span>
              <span className="text-[10px] uppercase tracking-wider">{computedMetrics.category}</span>
            </div>
          </div>
        </div>

        {/* 9 Weighted Technical Competencies List - Requirement #1 */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <span className="font-bold text-[#171717] flex items-center justify-between">
              <span>9 Technical Competency Criteria (Weighted Sum = 100%)</span>
              <span className="text-[10px] text-[#6B7280]">Score each criterion (0 - 100)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 rounded-xl border border-[#E9DDFE] bg-gray-50/60">
              {CRITERIA_WEIGHTS.map((c) => {
                const currentVal = ratings[c.key] || 80;
                return (
                  <div key={c.key} className="p-2.5 rounded-lg bg-white border border-[#E9DDFE] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-[11px] text-[#171717]">
                      <span>{c.label}</span>
                      <span className="text-[#A874F7] font-extrabold">
                        {currentVal}% <span className="text-[9px] text-[#6B7280] font-normal">({c.weight}%)</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={currentVal}
                      onChange={(e) => handleRatingChange(c.key, e.target.value)}
                      disabled={isCompleted}
                      className="w-full accent-[#A874F7] cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Strengths & Areas for Improvement - Requirement #4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#171717]">Technical Strengths (Student Visible)</label>
              <textarea
                rows={2}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                disabled={isCompleted}
                placeholder="Highlight engineering capabilities, technical mastery, and key deliverables..."
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#171717]">Areas for Technical Improvement (Student Visible)</label>
              <textarea
                rows={2}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                disabled={isCompleted}
                placeholder="Suggest technical growth areas, testing best practices, or architecture goals..."
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Private Internal Mentor Notes - Requirement #5 */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717] flex items-center justify-between">
              <span>Internal Mentor Notes (Private to Organization)</span>
              <span className="text-[10px] text-[#6B7280]">Hidden from student & faculty</span>
            </label>
            <input
              type="text"
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              disabled={isCompleted}
              placeholder="e.g. Eligible for PPO recommendation, team leadership potential..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Evaluation History Timeline - Requirement #6 */}
          <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50/70 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#171717]">
              <History size={14} className="text-[#A874F7]" />
              <span>Technical Evaluation History</span>
            </div>

            <div className="p-2 rounded-md bg-white border border-[#E9DDFE] flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-[#171717]">
                  {evalRecord.evaluatorName || 'Rahul Patil (Senior Software Engineer)'}
                </span>
                <span className="text-[#6B7280] block text-[10px]">
                  Evaluated on: {evalRecord.evaluationDate || new Date().toLocaleDateString('en-GB')}
                </span>
              </div>
              <span className="font-extrabold text-[#A874F7]">
                Score: {computedMetrics.score}% ({computedMetrics.grade})
              </span>
            </div>
          </div>

          {/* Action Footer - Requirement #7 */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE]">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs px-4">
              Close
            </Button>

            {isCompleted ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <CheckCircle2 size={15} />
                Technical Evaluation Locked
              </span>
            ) : (
              <Button type="submit" variant="primary" isLoading={isSubmitting} className="text-xs px-6 shadow-xs">
                Submit Technical Evaluation
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
