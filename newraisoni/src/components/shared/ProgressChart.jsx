import React from 'react';
import { TrendingUp, Award, Calendar, BarChart3, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

export const ProgressChart = ({ history = [], title = 'Progress Performance Trend', periodType = 'MONTHLY' }) => {
  // Determine timeline slots count (default 6 for Monthly, 8 for Weekly)
  const totalSlots = periodType === 'WEEKLY' ? 8 : 6;

  // Chronological order (oldest to newest)
  const chronological = [...history].reverse();

  // Map recorded slots into fixed timeline slots
  const slots = Array.from({ length: totalSlots }, (_, idx) => {
    const item = chronological[idx];
    if (item) {
      return {
        id: item.id || `slot-${idx}`,
        label: periodType === 'WEEKLY' ? `Week ${idx + 1}` : `Month ${idx + 1}`,
        shortLabel: periodType === 'WEEKLY' ? `W${idx + 1}` : `M${idx + 1}`,
        score: Number(item.progress_score || 0),
        attPct: Number(item.attendance_pct || 0),
        taskPct: Number(item.task_completion_pct || 0),
        logCount: Number(item.work_log_count || 0),
        risk: item.risk_level || (item.progress_score >= 60 ? 'NORMAL' : item.progress_score >= 40 ? 'LAGGING' : 'CRITICAL'),
        isRecorded: true,
      };
    }
    return {
      id: `slot-${idx}`,
      label: periodType === 'WEEKLY' ? `Week ${idx + 1}` : `Month ${idx + 1}`,
      shortLabel: periodType === 'WEEKLY' ? `W${idx + 1}` : `M${idx + 1}`,
      score: null,
      isRecorded: false,
    };
  });

  const recordedSlots = slots.filter((s) => s.isRecorded);
  const avgScore = recordedSlots.length > 0
    ? (recordedSlots.reduce((acc, s) => acc + s.score, 0) / recordedSlots.length).toFixed(1)
    : '0.0';
  const highestScore = recordedSlots.length > 0
    ? Math.max(...recordedSlots.map((s) => s.score)).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E1E7E2] shadow-sm space-y-6">
      {/* Header with KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0F4F1] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Multi-Period Performance Analytics</span>
          </div>
          <h3 className="text-lg font-bold text-[#18201B]">{title}</h3>
        </div>

        {/* Top Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-[#F8FAF9] border border-[#E1E7E2] px-3.5 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-[#66706A] uppercase tracking-wider">Average Score</span>
            <span className="text-sm font-extrabold text-[#18201B]">{avgScore}%</span>
          </div>
          <div className="bg-[#EAF4EC] border border-[#C5E3CC] px-3.5 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] font-semibold text-[#1F6B32] uppercase tracking-wider">Highest Peak</span>
            <span className="text-sm font-extrabold text-[#1F6B32]">{highestScore}%</span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Container with Y-Axis */}
      <div className="relative pt-6 pb-2">
        {/* Y-Axis Gridlines Background */}
        <div className="absolute inset-x-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none z-0">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="flex items-center gap-2 w-full">
              <span className="w-8 text-[10px] font-medium text-[#9CA3AF] text-right shrink-0">{val}%</span>
              <div className="w-full border-b border-dashed border-[#E5E7EB]" />
            </div>
          ))}
        </div>

        {/* Bar Columns Container */}
        <div className="relative z-10 pl-10 pr-2 h-56 flex items-end justify-around gap-2 md:gap-4">
          {slots.map((slot) => {
            if (!slot.isRecorded) {
              return (
                <div key={slot.id} className="flex-1 flex flex-col items-center h-full justify-end group max-w-[64px]">
                  {/* Dashed Empty Placeholder Bar */}
                  <div className="w-full h-full max-h-[85%] flex items-end justify-center">
                    <div className="w-full h-12 rounded-t-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB]/60 flex items-center justify-center text-[10px] font-semibold text-[#9CA3AF]">
                      Upcoming
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-[#9CA3AF] mt-3">{slot.shortLabel}</div>
                </div>
              );
            }

            const score = slot.score;
            const heightPct = Math.min(100, Math.max(12, score));

            let barGradient = 'bg-gradient-to-t from-[#1F6B32] via-[#2F8F46] to-[#4ADE80] border-t-2 border-[#86EFAC]';
            let badgeBg = 'bg-[#EAF4EC] text-[#1F6B32] border-[#C5E3CC]';

            if (score < 40) {
              barGradient = 'bg-gradient-to-t from-[#991B1B] via-[#DC2626] to-[#F87171] border-t-2 border-[#FCA5A5]';
              badgeBg = 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]';
            } else if (score < 60) {
              barGradient = 'bg-gradient-to-t from-[#B45309] via-[#D97706] to-[#FBBF24] border-t-2 border-[#FDE68A]';
              badgeBg = 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
            }

            return (
              <div key={slot.id} className="flex-1 flex flex-col items-center h-full justify-end group max-w-[64px] relative">
                {/* Score Pill Tag */}
                <div className={`mb-1.5 px-2 py-0.5 rounded-full border text-[10px] font-extrabold shadow-2xs transition-transform group-hover:scale-105 ${badgeBg}`}>
                  {score.toFixed(1)}%
                </div>

                {/* Animated Gradient Bar */}
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 shadow-md group-hover:brightness-110 cursor-pointer ${barGradient}`}
                  />
                </div>

                {/* Label */}
                <div className="text-[11px] font-bold text-[#18201B] mt-3 group-hover:text-[#2F8F46] transition-colors">
                  {slot.shortLabel}
                </div>

                {/* Hover Details Card */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-[#18201B] text-white p-3 rounded-xl shadow-xl text-[11px] space-y-1.5 w-44 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-bold border-b border-white/20 pb-1 flex justify-between">
                    <span>{slot.label}</span>
                    <span className="text-[#4ADE80] font-extrabold">{score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Attendance:</span>
                    <span className="font-bold text-white">{slot.attPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Task Score:</span>
                    <span className="font-bold text-white">{slot.taskPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Work Logs:</span>
                    <span className="font-bold text-white">{slot.logCount} entries</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#F0F4F1] text-xs text-[#66706A]">
        <span className="font-semibold text-[#18201B]">Status Thresholds:</span>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#1F6B32] to-[#4ADE80] shadow-xs" />
            <span className="font-semibold text-[#1F6B32]">On Track (≥60%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#B45309] to-[#FBBF24] shadow-xs" />
            <span className="font-semibold text-[#D97706]">Lagging (40-59%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#991B1B] to-[#F87171] shadow-xs" />
            <span className="font-semibold text-[#991B1B]">Critical (&lt;40%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

