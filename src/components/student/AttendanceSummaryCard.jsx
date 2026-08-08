import React from 'react';
import { Card } from '../common/Card';
import { CalendarCheck, CheckCircle2, XCircle, Clock, CalendarDays } from 'lucide-react';

export const AttendanceSummaryCard = ({ records = [] }) => {
  const totalLogged = records.length;
  const presentCount = records.filter(r => (r.status || '').toLowerCase() === 'present').length;
  const absentCount = records.filter(r => (r.status || '').toLowerCase() === 'absent').length;
  const leaveCount = records.filter(r => (r.status || '').toLowerCase() === 'leave').length;
  const pendingCount = records.filter(r => 
    (r.status || '').toLowerCase().includes('pending') || !r.verifiedBy
  ).length;

  const metrics = [
    {
      label: 'Total Days Logged',
      value: totalLogged,
      icon: CalendarDays,
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      iconColor: 'text-[#A874F7]',
    },
    {
      label: 'Days Present',
      value: presentCount,
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Days Absent',
      value: absentCount,
      icon: XCircle,
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      iconColor: 'text-rose-600',
    },
    {
      label: 'Days On Leave',
      value: leaveCount,
      icon: CalendarCheck,
      bg: 'bg-sky-50',
      border: 'border-sky-100',
      iconColor: 'text-sky-600',
    },
    {
      label: 'Pending Verification',
      value: pendingCount,
      icon: Clock,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.label} className={`${m.bg} border ${m.border} p-4 flex flex-col justify-between shadow-none`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7280]">{m.label}</span>
              <Icon size={16} className={m.iconColor} />
            </div>
            <p className="text-xl font-bold text-[#171717]">{m.value}</p>
          </Card>
        );
      })}
    </div>
  );
};
