import React from 'react';
import { Card } from '../common/Card';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const ProfileCompletionCard = ({ profile }) => {
  const fields = [
    { key: 'fullName', label: 'Full Name', value: profile?.fullName },
    { key: 'rollNumber', label: 'Roll Number', value: profile?.rollNumber },
    { key: 'email', label: 'Email', value: profile?.email },
    { key: 'phone', label: 'Phone Number', value: profile?.phone },
    { key: 'department', label: 'Department', value: profile?.department },
    { key: 'year', label: 'Academic Year', value: profile?.year },
    { key: 'semester', label: 'Semester', value: profile?.semester },
    { key: 'cgpa', label: 'CGPA', value: profile?.cgpa },
    { key: 'skills', label: 'Skills', value: profile?.skills },
    { key: 'linkedinUrl', label: 'LinkedIn', value: profile?.linkedinUrl },
    { key: 'githubUrl', label: 'GitHub', value: profile?.githubUrl },
    { key: 'resumeUrl', label: 'Resume', value: profile?.resumeUrl },
    { key: 'profilePhotoUrl', label: 'Profile Photo', value: profile?.profilePhotoUrl },
  ];

  const completedFields = fields.filter((f) => Boolean(f.value && String(f.value).trim() !== ''));
  const missingFields = fields.filter((f) => !f.value || String(f.value).trim() === '');

  const percentage = Math.round((completedFields.length / fields.length) * 100);

  // Dynamic progress bar color state
  const getProgressBarColor = (pct) => {
    if (pct <= 30) return 'bg-red-500';
    if (pct <= 70) return 'bg-amber-500';
    if (pct < 100) return 'bg-[#A874F7]';
    return 'bg-emerald-500';
  };

  // Show first 5 missing fields + count badge for extra
  const visibleMissingFields = missingFields.slice(0, 5);
  const extraMissingCount = missingFields.length - visibleMissingFields.length;

  return (
    <Card className="p-7 mb-6 rounded-2xl border border-[#E9DDFE] bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
      <div className="flex flex-col">
        {/* Header & Prominent Percentage */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#171717] flex items-center gap-2.5">
              <Sparkles size={20} className="text-[#A874F7]" />
              Profile Completion
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Complete your profile to unlock internship opportunities.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#A874F7] leading-none block">
              {percentage}%
            </span>
            <span className="text-[11px] font-medium text-[#6B7280] mt-1 block">Completed</span>
          </div>
        </div>

        {/* Animated Progress Bar with Increased Whitespace */}
        <div className="w-full bg-[#F3EDFF] h-3.5 rounded-full overflow-hidden border border-[#E9DDFE] my-6">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressBarColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Success Banner when 100% Complete */}
        {percentage === 100 && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-fade-in shadow-sm">
            <span className="text-xl">🎉</span>
            <span>Profile Complete – You are ready to apply for internships.</span>
          </div>
        )}

        {/* Completed and Missing Tags Section with Increased Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-6 border-t border-[#E9DDFE]">
          <div>
            <span className="text-xs font-semibold text-[#171717] flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Completed Fields ({completedFields.length})
            </span>
            <div className="flex flex-wrap gap-2.5">
              {completedFields.map((field) => (
                <span
                  key={field.key}
                  className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium"
                >
                  {field.label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#171717] flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-amber-500" />
              Missing Fields ({missingFields.length})
            </span>
            <div className="flex flex-wrap gap-2.5">
              {missingFields.length === 0 ? (
                <span className="text-xs text-emerald-600 font-medium">All required profile fields are complete!</span>
              ) : (
                <>
                  {visibleMissingFields.map((field) => (
                    <span
                      key={field.key}
                      className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-medium"
                    >
                      Missing {field.label}
                    </span>
                  ))}
                  {extraMissingCount > 0 && (
                    <span className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200/80 font-normal">
                      +{extraMissingCount} More
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
