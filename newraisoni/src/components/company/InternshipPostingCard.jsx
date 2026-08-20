import React from 'react';
import { Briefcase, MapPin, Calendar, Users, DollarSign, Award, CheckCircle, XCircle, Clock } from 'lucide-react';

export const InternshipPostingCard = ({
  posting,
  isCompanyView = false,
  isEligible = true,
  eligibilityReasons = [],
  hasApplied = false,
  onApply,
  onToggleStatus,
  applying = false,
}) => {
  if (!posting) return null;

  const companyName = posting.companies?.company_name || 'Company';
  const isExpired = posting.deadline && new Date(posting.deadline) < new Date(new Date().toDateString());
  const isOpen = posting.status === 'Open' && !isExpired;

  return (
    <div className="bg-white rounded-xl border border-[#E1E7E2] p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-xs font-semibold text-[#2F8F46] bg-[#EAF4EC] px-2.5 py-0.5 rounded-full mb-1.5">
              {posting.mode || 'On-site'}
            </span>
            <h3 className="text-lg font-bold text-[#18201B] tracking-tight">{posting.title}</h3>
            <p className="text-sm font-medium text-[#66706A] mt-0.5">{companyName}</p>
          </div>

          {/* Status Badge */}
          <div>
            {isCompanyView ? (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  posting.status === 'Open'
                    ? 'bg-[#EAF4EC] text-[#2F8F46] border border-[#C5E3CC]'
                    : 'bg-[#F3F4F6] text-[#66706A] border border-[#E5E7EB]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${posting.status === 'Open' ? 'bg-[#2F8F46]' : 'bg-[#66706A]'}`}></span>
                {posting.status}
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  hasApplied
                    ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]'
                    : isEligible
                    ? 'bg-[#EAF4EC] text-[#2F8F46]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                }`}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Applied
                  </>
                ) : isEligible ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-[#2F8F46]" />
                    Eligible
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                    Not Eligible
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#66706A] line-clamp-2 mt-3 leading-relaxed">
          {posting.description}
        </p>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#F0F4F1] text-xs">
        <div className="flex items-center gap-1.5 text-[#18201B]">
          <DollarSign className="w-3.5 h-3.5 text-[#2F8F46] shrink-0" />
          <span className="truncate">{posting.stipend || 'Unpaid'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#18201B]">
          <Clock className="w-3.5 h-3.5 text-[#2F8F46] shrink-0" />
          <span className="truncate">{posting.duration || '3 Months'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#18201B]">
          <MapPin className="w-3.5 h-3.5 text-[#2F8F46] shrink-0" />
          <span className="truncate">{posting.work_location || 'Office'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#18201B]">
          <Users className="w-3.5 h-3.5 text-[#2F8F46] shrink-0" />
          <span>{posting.vacancies || 1} Openings</span>
        </div>
      </div>

      {/* Eligibility Requirements */}
      <div className="bg-[#F8FAF9] p-2.5 rounded-lg border border-[#E1E7E2] text-xs space-y-1">
        <div className="flex items-center justify-between text-[#66706A]">
          <span>Min CGPA required:</span>
          <span className="font-semibold text-[#18201B]">{posting.min_cgpa || '0.0'}</span>
        </div>
        <div className="flex items-center justify-between text-[#66706A]">
          <span>Departments:</span>
          <span className="font-semibold text-[#18201B] truncate max-w-[180px]">
            {posting.eligible_departments || 'All'}
          </span>
        </div>
        {posting.deadline && (
          <div className="flex items-center justify-between text-[#66706A]">
            <span>Deadline:</span>
            <span className={`font-semibold ${isExpired ? 'text-[#DC2626]' : 'text-[#18201B]'}`}>
              {new Date(posting.deadline).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Ineligibility Warning if student view */}
      {!isCompanyView && !isEligible && eligibilityReasons.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-2.5 rounded-lg text-xs">
          <p className="font-semibold mb-1 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Eligibility Criteria Not Met:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {eligibilityReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-2">
        {isCompanyView ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#66706A]">
              Posted {posting.created_at ? new Date(posting.created_at).toLocaleDateString() : ''}
            </span>
            <button
              onClick={() => onToggleStatus && onToggleStatus(posting)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                posting.status === 'Open'
                  ? 'bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]'
                  : 'bg-[#EAF4EC] text-[#1F6B32] hover:bg-[#D5EAD8]'
              }`}
            >
              {posting.status === 'Open' ? 'Close Posting' : 'Reopen Posting'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onApply && onApply(posting.id)}
            disabled={!isEligible || hasApplied || !isOpen || applying}
            className={`w-full py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
              hasApplied
                ? 'bg-[#EAF4EC] text-[#1F6B32] cursor_default border border-[#C5E3CC]'
                : !isOpen
                ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                : !isEligible
                ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                : 'bg-[#2F8F46] text-white hover:bg-[#1F6B32] shadow-xs'
            }`}
          >
            {hasApplied
              ? 'Application Submitted'
              : !isOpen
              ? isExpired ? 'Deadline Passed' : 'Posting Closed'
              : !isEligible
              ? 'Ineligible to Apply'
              : applying
              ? 'Submitting...'
              : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
};
