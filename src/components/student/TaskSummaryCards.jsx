import React from 'react';
import { Card } from '../common/Card';
import { CheckSquare, Clock, Send, CheckCircle2 } from 'lucide-react';

export const TaskSummaryCards = ({ tasks = [] }) => {
  const totalAssigned = tasks.length;
  const pendingSubmission = tasks.filter((t) => t.status === 'Assigned' || t.status === 'In Progress').length;
  const submitted = tasks.filter((t) => t.status === 'Submitted').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;

  const metrics = [
    {
      title: 'TOTAL ASSIGNED',
      value: totalAssigned,
      icon: CheckSquare,
      bgColor: 'bg-[#F3EDFF]',
      textColor: 'text-[#A874F7]',
      borderColor: 'border-[#E9DDFE]',
    },
    {
      title: 'PENDING SUBMISSION',
      value: pendingSubmission,
      icon: Clock,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      title: 'SUBMITTED',
      value: submitted,
      icon: Send,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'COMPLETED',
      value: completed,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
