import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { evaluationService } from '../../services/evaluationService';
import { EvaluationSummaryCard } from '../../components/shared/EvaluationSummaryCard';
import { Award, RefreshCw, AlertCircle, FileText } from 'lucide-react';

export const StudentFeedbackPage = () => {
  const { user } = useAuth();
  const [evalState, setEvalState] = useState({ companyEval: null, facultyEval: null, dualAverage: null, internship: null });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await evaluationService.getStudentEvaluations(user.id);
      setEvalState(data);
    } catch (err) {
      console.error('Error loading student feedback:', err);
      setErrorMsg(err.message || 'Failed to load evaluation feedback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <PortalLayout title="Mentor Feedback & Dual Evaluations" roleLabel="Student Candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <Award className="w-4 h-4" />
              <span>Dual Performance Validation</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">My Mentor Feedback & Ratings</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Read-only view of independent Company Mentor and Faculty Mentor evaluation scores, ratings, and qualitative feedback.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh evaluations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            Loading mentor feedback...
          </div>
        ) : !evalState.internship ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">No Active Internship Found</h3>
            <p className="text-xs text-[#66706A]">
              Mentor evaluations will appear here once an active internship is established and evaluated by mentors.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <EvaluationSummaryCard
              companyEval={evalState.companyEval}
              facultyEval={evalState.facultyEval}
              dualAverage={evalState.dualAverage}
              title={`Dual Feedback: ${evalState.internship.internship_title || 'Active Internship'}`}
            />
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
