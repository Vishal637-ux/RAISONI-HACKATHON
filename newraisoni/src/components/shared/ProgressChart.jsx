import React from 'react';
import { TrendingUp } from 'lucide-react';

export const ProgressChart = ({ history = [], title = 'Progress Performance Trend' }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs text-center text-xs text-[#66706A]">
        No historic progress trend data available yet.
      </div>
    );
  }

  // Reverse history so it flows left to right chronologically
  const chronological = [...history].reverse();
  const maxScore = 100;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-[#E1E7E2] pb-3">
        <TrendingUp className="w-4 h-4 text-[#2F8F46]" />
        <h3 className="text-base font-bold text-[#18201B]">{title}</h3>
      </div>

      {/* SVG Performance Chart */}
      <div className="space-y-2">
        <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2]">
          {chronological.map((item, idx) => {
            const score = Number(item.progress_score || 0);
            const heightPct = Math.min(100, Math.max(8, (score / maxScore) * 100));
            const itemKey = item.id || `${item.period_type || 'period'}-${idx}`;

            return (
              <div key={itemKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-bold text-[#18201B] opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  {score.toFixed(1)}%
                </div>
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${
                    score >= 60
                      ? 'bg-[#2F8F46] group-hover:bg-[#1F6B32]'
                      : score >= 40
                      ? 'bg-[#D97706] group-hover:bg-[#B45309]'
                      : 'bg-[#DC2626] group-hover:bg-[#991B1B]'
                  }`}
                  title={`${item.period_type || 'Period'}: ${score.toFixed(1)}%`}
                />
                <div className="text-[10px] font-semibold text-[#66706A] mt-2 truncate w-full text-center">
                  {item.period_type === 'WEEKLY' ? `W${idx + 1}` : `M${idx + 1}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-[#66706A]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2F8F46]" />
            <span>Normal (≥60%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#D97706]" />
            <span>Lagging (40-59%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
            <span>Critical (&lt;40%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
