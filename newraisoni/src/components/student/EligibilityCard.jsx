import React from 'react';
import { ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';

export const EligibilityCard = ({ evaluation }) => {
  if (!evaluation) return null;

  const { isEligible, score, checks } = evaluation;

  return (
    <div className="bg-white border border-[#E1E7E2] rounded-xl p-6 shadow-xs space-y-5">
      {/* Overall Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isEligible
            ? 'bg-[#EAF4EC] border-[#2F8F46]/30 text-[#1F6B32]'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {isEligible ? (
            <ShieldCheck className="w-8 h-8 text-[#2F8F46]" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-red-600" />
          )}
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold opacity-80 block">
              Academic Eligibility Verdict
            </span>
            <h3 className="text-xl font-extrabold">
              {isEligible ? 'Eligible for Internship Drives' : 'Not Currently Eligible'}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black">{score}%</span>
          <span className="text-xs font-semibold block opacity-80">Criteria Score</span>
        </div>
      </div>

      {/* Detailed Checklist Breakdown */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#66706A] mb-3">
          Rule-Based Criteria Checklist
        </h4>
        <div className="space-y-2.5">
          {checks?.map((check) => (
            <div
              key={check.id}
              className={`p-3.5 rounded-lg border flex items-start justify-between text-xs transition-colors ${
                check.passed
                  ? 'bg-[#F5FAF6] border-[#E1E7E2]'
                  : 'bg-red-50/50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                    check.passed
                      ? 'bg-[#2F8F46] text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {check.passed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="font-bold text-[#18201B] text-sm">{check.title}</h5>
                  <p className="text-[#66706A] mt-0.5">{check.reason}</p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-4">
                <span className="text-[11px] text-[#66706A] block font-medium">Required</span>
                <span className="font-semibold text-[#18201B]">{check.required}</span>
                <span
                  className={`block text-[11px] font-bold mt-0.5 ${
                    check.passed ? 'text-[#2F8F46]' : 'text-red-600'
                  }`}
                >
                  Actual: {check.actual}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
