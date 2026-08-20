import React, { useState } from 'react';
import { X, Award, AlertCircle } from 'lucide-react';
import { evaluationService } from '../../services/evaluationService';

export const CompanyEvaluationModal = ({ isOpen, onClose, internship, companyUserId, onSuccess }) => {
  const [technicalSkills, setTechnicalSkills] = useState(4.0);
  const [workConduct, setWorkConduct] = useState(4.0);
  const [projectOutput, setProjectOutput] = useState(4.0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !internship) return null;

  const calculatedOverall = parseFloat(((Number(technicalSkills) + Number(workConduct) + Number(projectOutput)) / 3.0).toFixed(2));
  const categoryPreview = evaluationService.derivePerformanceCategory(calculatedOverall);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!feedback.trim()) {
      setErrorMsg('Please provide qualitative feedback and performance remarks.');
      return;
    }

    try {
      setSubmitting(true);
      await evaluationService.submitCompanyEvaluation(companyUserId, internship.id, {
        technicalSkills: Number(technicalSkills),
        workConduct: Number(workConduct),
        projectOutput: Number(projectOutput),
        feedback: feedback.trim(),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Company evaluation submission failed:', err);
      setErrorMsg(err.message || 'Failed to submit company evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-[#E1E7E2] overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-[#F8FAF9] p-5 border-b border-[#E1E7E2] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1F6B32]">
            <Award className="w-5 h-5 text-[#2F8F46]" />
            <span>Company Mentor Evaluation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706A] hover:bg-[#E1E7E2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#18201B]">
              Evaluate: {internship.users?.full_name || 'Student Candidate'}
            </h3>
            <p className="text-xs text-[#66706A] mt-0.5">
              Internship: {internship.internship_title || 'Software Engineering Intern'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rating Inputs */}
          <div className="space-y-4 text-xs">
            {/* Technical Skills */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[#18201B]">
                <span>Technical Skills & Proficiency (1.00 - 5.00)</span>
                <span className="text-[#2F8F46] font-extrabold">{Number(technicalSkills).toFixed(1)} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={technicalSkills}
                onChange={(e) => setTechnicalSkills(e.target.value)}
                className="w-full accent-[#2F8F46]"
              />
            </div>

            {/* Work Conduct */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[#18201B]">
                <span>Work Conduct & Professionalism (1.00 - 5.00)</span>
                <span className="text-[#2F8F46] font-extrabold">{Number(workConduct).toFixed(1)} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={workConduct}
                onChange={(e) => setWorkConduct(e.target.value)}
                className="w-full accent-[#2F8F46]"
              />
            </div>

            {/* Project Output */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-[#18201B]">
                <span>Project Output & Deliverables (1.00 - 5.00)</span>
                <span className="text-[#2F8F46] font-extrabold">{Number(projectOutput).toFixed(1)} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={projectOutput}
                onChange={(e) => setProjectOutput(e.target.value)}
                className="w-full accent-[#2F8F46]"
              />
            </div>

            {/* Overall Rating & Performance Category Preview */}
            <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#66706A] block">Overall Rating</span>
                <span className="text-xl font-extrabold text-[#18201B]">{calculatedOverall.toFixed(2)} / 5.00</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-[#66706A] block">Derived Performance Category</span>
                <span className="text-xs font-extrabold text-[#1F6B32]">{categoryPreview}</span>
              </div>
            </div>

            {/* Feedback Remarks */}
            <div className="space-y-1">
              <label className="block font-bold text-[#18201B]">
                Mentorship Remarks & Performance Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback on technical growth, work ethic, and achievements..."
                className="w-full p-3 border border-[#E1E7E2] rounded-xl text-xs focus:ring-1 focus:ring-[#2F8F46] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E1E7E2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#66706A] hover:bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#2F8F46] hover:bg-[#1F6B32] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Final Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
