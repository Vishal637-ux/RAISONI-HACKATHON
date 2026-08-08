import React from 'react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { FileText, Clock } from 'lucide-react';

export const WorkLogHistoryList = ({ records = [] }) => {
  if (!records || records.length === 0) {
    return (
      <Card className="bg-white border border-[#E9DDFE] p-6 shadow-sm">
        <EmptyState
          title="No Work Logs Submitted Yet"
          description="You haven't submitted any work log entries yet. Use the form above to submit your daily or weekly work log."
          icon={FileText}
        />
      </Card>
    );
  }

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#171717]">Work Log History</h3>
            <p className="text-xs text-[#6B7280]">
              Showing all {records.length} submitted work log entry/entries.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {records.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/10 hover:bg-[#F3EDFF]/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A874F7] bg-[#F3EDFF] px-2.5 py-1 rounded-md border border-[#E9DDFE]">
                <Clock size={12} />
                {formatDate(log.submittedAt)}
              </span>
            </div>
            <p className="text-xs text-[#171717] whitespace-pre-wrap leading-relaxed">
              {log.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
