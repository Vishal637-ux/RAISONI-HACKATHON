import React from 'react';
import { Award, CheckCircle2, AlertCircle, Clock, Building2, GraduationCap, Star } from 'lucide-react';

export const EvaluationSummaryCard = ({ companyEval, facultyEval, dualAverage, title = 'Dual Internship Evaluation' }) => {
  const categoryBadges = {
    EXCELLENT: { bg: 'bg-[#EAF4EC]', text: 'text-[#1F6B32]', border: 'border-[#C5E3CC]' },
    GOOD: { bg: 'bg-[#F0FDF4]', text: 'text-[#166534]', border: 'border-[#BBF7D0]' },
    SATISFACTORY: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
    NEEDS_IMPROVEMENT: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', border: 'border-[#FCA5A5]' },
  };

  const statusBadges = {
    APPROVED: { bg: 'bg-[#EAF4EC]', text: 'text-[#1F6B32]', border: 'border-[#C5E3CC]' },
    REVISION_REQUIRED: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', border: 'border-[#FCA5A5]' },
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs space-y-6">
      {/* Header & Combined Dual Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E1E7E2] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
            <Award className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <h2 className="text-xl font-bold text-[#18201B]">Dual Evaluation Summary</h2>
        </div>

        {/* Dual Average Rating Display */}
        <div className="bg-[#F8FAF9] px-4 py-2 rounded-xl border border-[#E1E7E2] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#66706A] uppercase tracking-wider">Dual Evaluation Average</div>
            <div className="text-sm font-extrabold text-[#18201B]">
              {dualAverage !== null 
                ? `${dualAverage.toFixed(2)} / 5.00` 
                : companyEval 
                  ? `${Number(companyEval.overall_rating).toFixed(2)} / 5.00 (Awaiting Faculty)` 
                  : facultyEval 
                    ? `${Number(facultyEval.overall_rating).toFixed(2)} / 5.00 (Awaiting Company)` 
                    : 'Pending Both Evaluations'}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Evaluation Card */}
        <div className="bg-[#F8FAF9] p-5 rounded-xl border border-[#E1E7E2] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#18201B]">
              <Building2 className="w-4 h-4 text-[#2F8F46]" />
              <span>Company Mentor Evaluation</span>
            </div>

            {companyEval ? (
              <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${categoryBadges[companyEval.performance_category]?.bg} ${categoryBadges[companyEval.performance_category]?.border} ${categoryBadges[companyEval.performance_category]?.text}`}>
                {companyEval.performance_category}
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full border border-[#E1E7E2] bg-white text-[11px] font-bold text-[#66706A] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#D97706]" />
                <span>Pending Company Evaluation</span>
              </div>
            )}
          </div>

          {companyEval ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#E1E7E2]">
                <span className="font-semibold text-[#66706A]">Overall Company Rating</span>
                <span className="text-base font-extrabold text-[#18201B]">
                  {Number(companyEval.overall_rating).toFixed(2)} / 5.00
                </span>
              </div>

              {/* Criteria Scores */}
              {companyEval.scores && (
                <div className="space-y-1.5 bg-white p-3 rounded-lg border border-[#E1E7E2]">
                  <div className="flex justify-between">
                    <span className="text-[#66706A]">Technical Skills:</span>
                    <span className="font-bold text-[#18201B]">{companyEval.scores.technical_skills || '-'} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66706A]">Work Conduct & Professionalism:</span>
                    <span className="font-bold text-[#18201B]">{companyEval.scores.work_conduct || '-'} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66706A]">Project Output & Deliverables:</span>
                    <span className="font-bold text-[#18201B]">{companyEval.scores.project_output || '-'} / 5.0</span>
                  </div>
                </div>
              )}

              {/* Feedback Remarks */}
              <div className="bg-white p-3 rounded-lg border border-[#E1E7E2] space-y-1">
                <span className="font-bold text-[#66706A]">Mentor Feedback & Remarks:</span>
                <p className="text-[#18201B] italic">{companyEval.feedback || 'No comments provided.'}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#66706A]">
              Company Mentor evaluation has not been submitted yet.
            </div>
          )}
        </div>

        {/* Faculty Evaluation Card */}
        <div className="bg-[#F8FAF9] p-5 rounded-xl border border-[#E1E7E2] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#18201B]">
              <GraduationCap className="w-4 h-4 text-[#2F8F46]" />
              <span>Faculty Mentor Evaluation</span>
            </div>

            {facultyEval ? (
              <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusBadges[facultyEval.academic_status]?.bg} ${statusBadges[facultyEval.academic_status]?.border} ${statusBadges[facultyEval.academic_status]?.text}`}>
                {facultyEval.academic_status}
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full border border-[#E1E7E2] bg-white text-[11px] font-bold text-[#66706A] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#D97706]" />
                <span>Pending Faculty Evaluation</span>
              </div>
            )}
          </div>

          {facultyEval ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#E1E7E2]">
                <span className="font-semibold text-[#66706A]">Overall Faculty Rating</span>
                <span className="text-base font-extrabold text-[#18201B]">
                  {Number(facultyEval.overall_rating).toFixed(2)} / 5.00
                </span>
              </div>

              {/* Criteria Scores */}
              {facultyEval.scores && (
                <div className="space-y-1.5 bg-white p-3 rounded-lg border border-[#E1E7E2]">
                  <div className="flex justify-between">
                    <span className="text-[#66706A]">Academic Alignment:</span>
                    <span className="font-bold text-[#18201B]">{facultyEval.scores.academic_alignment || '-'} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66706A]">Internship Report Quality:</span>
                    <span className="font-bold text-[#18201B]">{facultyEval.scores.report_quality || '-'} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66706A]">Presentation & Defense:</span>
                    <span className="font-bold text-[#18201B]">{facultyEval.scores.presentation || '-'} / 5.0</span>
                  </div>
                </div>
              )}

              {/* Feedback Remarks */}
              <div className="bg-white p-3 rounded-lg border border-[#E1E7E2] space-y-1">
                <span className="font-bold text-[#66706A]">Faculty Feedback & Remarks:</span>
                <p className="text-[#18201B] italic">{facultyEval.feedback || 'No comments provided.'}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#66706A]">
              Faculty Mentor evaluation has not been submitted yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
