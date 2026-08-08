import { useState } from 'react';
import { Card } from '../common/Card';
import { MessageSquare, Star, Calendar, UserCheck, Building, CheckCircle2 } from 'lucide-react';

export const FeedbackListCard = ({ records = [] }) => {
  const [filter, setFilter] = useState('All');

  const filteredRecords = records.filter((rec) => {
    if (filter === 'Faculty') return rec.evaluatorRole?.toLowerCase().includes('faculty');
    if (filter === 'Company')
      return (
        rec.evaluatorRole?.toLowerCase().includes('company') ||
        rec.evaluatorRole?.toLowerCase().includes('industry')
      );
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 5;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= fullStars
                ? 'fill-amber-400 text-amber-400'
                : star === fullStars + 1 && hasHalfStar
                ? 'fill-amber-200 text-amber-400'
                : 'text-gray-300'
            }
          />
        ))}
        <span className="ml-1.5 text-xs font-bold text-[#171717]">
          {numericRating.toFixed(1)} / 5.0
        </span>
      </div>
    );
  };

  return (
    <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl">
      {/* Header Bar with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E9DDFE] pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#171717]">Mentor Evaluations & Feedback</h3>
            <p className="text-xs text-[#6B7280]">
              Showing {filteredRecords.length} feedback record(s)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] self-start sm:self-auto">
          {[
            { label: 'All Feedback', value: 'All' },
            { label: 'Faculty Mentor', value: 'Faculty' },
            { label: 'Company Mentor', value: 'Company' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.value
                  ? 'bg-white text-[#A874F7] shadow-2xs border border-[#E9DDFE]'
                  : 'text-[#6B7280] hover:text-[#171717]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-8 px-4 bg-[#F3EDFF]/20 rounded-xl border border-[#E9DDFE]">
          <p className="text-xs text-[#6B7280]">No feedback records match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRecords.map((item) => {
            const isFaculty = item.evaluatorRole?.toLowerCase().includes('faculty');

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-[#E9DDFE] bg-white hover:border-[#A874F7]/40 hover:shadow-xs transition-all duration-200"
              >
                {/* Header: Evaluator Info + Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isFaculty
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      {isFaculty ? <UserCheck size={18} /> : <Building size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#171717]">{item.evaluatorName}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            isFaculty
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {item.evaluatorRole}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-0.5">
                        <Calendar size={12} className="text-[#A874F7]" />
                        <span>Submitted {formatDate(item.submittedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars Visualization */}
                  <div className="bg-[#F3EDFF]/40 border border-[#E9DDFE] px-3.5 py-1.5 rounded-xl flex items-center justify-center">
                    {renderStars(item.rating)}
                  </div>
                </div>

                {/* Performance Category Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 bg-[#F3EDFF]/20 p-3 rounded-xl border border-[#E9DDFE] text-xs">
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Technical Skills</span>
                    <span className="font-semibold text-[#171717] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} className="text-emerald-500" /> Excellent
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Communication</span>
                    <span className="font-semibold text-[#171717] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} className="text-emerald-500" /> Very Good
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Punctuality</span>
                    <span className="font-semibold text-[#171717] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} className="text-emerald-500" /> Consistent
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[10px] uppercase font-semibold">Task Completion</span>
                    <span className="font-semibold text-[#171717] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} className="text-emerald-500" /> On Track
                    </span>
                  </div>
                </div>

                {/* Qualitative Remarks */}
                {item.feedbackText && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#171717]">Mentor Remarks:</span>
                    <p className="text-xs text-[#4B5563] bg-white p-3 rounded-xl border border-[#E9DDFE] whitespace-pre-wrap leading-relaxed">
                      {item.feedbackText}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
