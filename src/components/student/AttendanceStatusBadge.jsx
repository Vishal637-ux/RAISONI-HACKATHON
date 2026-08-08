import React from 'react';
import { Clock, CheckCircle2, XCircle, Calendar, HelpCircle } from 'lucide-react';

export const AttendanceStatusBadge = ({ status }) => {
  const normalizedStatus = (status || '').toString().trim();

  switch (normalizedStatus.toLowerCase()) {
    case 'pending verification':
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={13} className="shrink-0 text-amber-600" />
          Pending Verification
        </span>
      );

    case 'present':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
          Present
        </span>
      );

    case 'absent':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={13} className="shrink-0 text-rose-600" />
          Absent
        </span>
      );

    case 'leave':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Calendar size={13} className="shrink-0 text-sky-600" />
          Leave
        </span>
      );

    default:
      // Neutral fallback badge for unknown/missing status
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <HelpCircle size={13} className="shrink-0 text-gray-500" />
          {normalizedStatus || 'Unknown'}
        </span>
      );
  }
};
