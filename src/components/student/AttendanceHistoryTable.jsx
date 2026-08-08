import React from 'react';
import { Card } from '../common/Card';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { EmptyState } from '../common/EmptyState';
import { Calendar, UserCheck, MessageSquare } from 'lucide-react';

export const AttendanceHistoryTable = ({ records = [] }) => {
  if (!records || records.length === 0) {
    return (
      <Card className="bg-white border border-[#E9DDFE] p-6 shadow-sm">
        <EmptyState
          title="No Attendance Records Logged Yet"
          description="You haven't submitted any daily attendance records yet. Use the form above to submit your attendance."
          icon={Calendar}
        />
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#171717]">Attendance History</h3>
            <p className="text-xs text-[#6B7280]">
              Showing all {records.length} logged attendance entry/entries.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E9DDFE] bg-[#F3EDFF]/30 text-xs font-semibold text-[#6B7280]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Verified By</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9DDFE] text-xs">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                <td className="py-3 px-4 font-medium text-[#171717]">
                  {record.attendanceDate}
                </td>
                <td className="py-3 px-4">
                  <AttendanceStatusBadge status={record.status} />
                </td>
                <td className="py-3 px-4 text-[#6B7280]">
                  {record.verifiedBy ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#171717]">
                      <UserCheck size={13} className="text-[#A874F7]" />
                      {record.verifiedBy}
                    </span>
                  ) : (
                    <span className="text-amber-700 italic font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      Pending Verification
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-[#6B7280]">
                  {record.remarks ? (
                    <span className="inline-flex items-center gap-1 text-[#171717]">
                      <MessageSquare size={12} className="text-[#6B7280] shrink-0" />
                      {record.remarks}
                    </span>
                  ) : (
                    <span className="text-gray-400 font-mono">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
