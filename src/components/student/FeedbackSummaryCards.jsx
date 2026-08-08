import React from 'react';
import { Card } from '../common/Card';
import { Star, UserCheck, Building } from 'lucide-react';

export const FeedbackSummaryCards = ({ records = [] }) => {
  const totalReviews = records.length;

  const totalScore = records.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  const avgRating = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : '0.0';

  const facultyReviewsCount = records.filter(
    (r) => r.evaluatorRole?.toLowerCase().includes('faculty')
  ).length;

  const companyReviewsCount = records.filter(
    (r) =>
      r.evaluatorRole?.toLowerCase().includes('company') ||
      r.evaluatorRole?.toLowerCase().includes('industry')
  ).length;

  const metrics = [
    {
      title: 'AVERAGE RATING',
      value: totalReviews > 0 ? `★ ${avgRating} / 5.0` : '0.0 / 5.0',
      icon: Star,
      bgColor: 'bg-[#F3EDFF]',
      textColor: 'text-[#A874F7]',
      borderColor: 'border-[#E9DDFE]',
    },
    {
      title: 'FACULTY REVIEWS',
      value: facultyReviewsCount,
      icon: UserCheck,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'COMPANY REVIEWS',
      value: companyReviewsCount,
      icon: Building,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <Card
            key={idx}
            className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  {metric.title}
                </span>
                <p className="text-2xl font-bold text-[#171717] mt-1">{metric.value}</p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl ${metric.bgColor} ${metric.textColor} ${metric.borderColor} border flex items-center justify-center shrink-0`}
              >
                <Icon size={20} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
