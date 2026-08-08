import React from 'react';
import { Card } from '../common/Card';
import { Users, Briefcase, AlertCircle, Calendar, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export const FacultySummaryCards = ({ summary }) => {
  const metrics = [
    {
      title: 'TOTAL MENTEES',
      value: summary?.totalMentees || 0,
      trend: '+3 This Month',
      icon: Users,
      bgColor: 'bg-[#F3EDFF]',
      textColor: 'text-[#A874F7]',
      borderColor: 'border-[#E9DDFE]',
    },
    {
      title: 'ACTIVE INTERNSHIPS',
      value: summary?.activeInternships || 0,
      trend: '+2 This Week',
      icon: Briefcase,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'PENDING APPROVALS',
      value: summary?.pendingApprovals || 0,
      trend: 'Action Required',
      icon: AlertCircle,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      title: 'PENDING ATTENDANCE',
      value: summary?.pendingAttendance || 0,
      trend: 'Check-ins Pending',
      icon: Calendar,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'PENDING WORK LOGS',
      value: summary?.pendingWorkLogs || 0,
      trend: 'Logs Awaiting Review',
      icon: Clock,
      bgColor: 'bg-purple-50',
      textColor: 'text-[#A874F7]',
      borderColor: 'border-[#E9DDFE]',
    },
    {
      title: 'COMPLETED MENTEES',
      value: summary?.completedMentees || 0,
      trend: '+1 This Term',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-1">
                  <TrendingUp size={11} />
                  <span>{metric.trend}</span>
                </div>
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
