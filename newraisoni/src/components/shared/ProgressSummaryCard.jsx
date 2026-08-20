import React from 'react';
import { Award, Compass, CheckSquare, FileText, AlertTriangle, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';

export const ProgressSummaryCard = ({ progress, title = 'Internship Progress Summary' }) => {
  if (!progress) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E1E7E2] shadow-sm text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#F8FAF9] text-[#66706A] flex items-center justify-center mx-auto border border-[#E1E7E2]">
          <Award className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Progress Recorded Yet</h3>
        <p className="text-xs text-[#66706A]">
          Progress scores will aggregate automatically as check-ins, work logs, and task deliverables are recorded.
        </p>
      </div>
    );
  }

  const score = progress.progress_score !== undefined ? Number(progress.progress_score) : 0;
  const risk = progress.risk_level || (score >= 60 ? 'NORMAL' : score >= 40 ? 'LAGGING' : 'CRITICAL');
  const attPct = progress.attendance_pct !== undefined ? Number(progress.attendance_pct) : 0;
  const taskPct = progress.task_completion_pct !== undefined ? Number(progress.task_completion_pct) : 0;
  const logCount = progress.work_log_count !== undefined ? Number(progress.work_log_count) : 0;

  const riskBadgeConfig = {
    NORMAL: {
      bg: 'bg-[#EAF4EC]',
      border: 'border-[#C5E3CC]',
      text: 'text-[#1F6B32]',
      icon: ShieldCheck,
      label: 'ON TRACK (HEALTHY)',
    },
    LAGGING: {
      bg: 'bg-[#FEF3C7]',
      border: 'border-[#FDE68A]',
      text: 'text-[#D97706]',
      icon: AlertTriangle,
      label: 'LAGGING (ATTENTION NEEDED)',
    },
    CRITICAL: {
      bg: 'bg-[#FEF2F2]',
      border: 'border-[#FCA5A5]',
      text: 'text-[#991B1B]',
      icon: AlertCircle,
      label: 'CRITICAL (HIGH RISK)',
    },
  };

  const currentRiskConfig = riskBadgeConfig[risk] || riskBadgeConfig.NORMAL;
  const RiskIcon = currentRiskConfig.icon;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E1E7E2] shadow-sm space-y-6">
      {/* Header & Risk Level */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F0F4F1] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
            <Award className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#18201B]">
            {progress.period_type || 'MONTHLY'} Snapshot
          </h2>
        </div>

        <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 shadow-2xs ${currentRiskConfig.bg} ${currentRiskConfig.border} ${currentRiskConfig.text}`}>
          <RiskIcon className="w-4 h-4" />
          <span>{currentRiskConfig.label}</span>
        </div>
      </div>

      {/* Main Score Banner */}
      <div className="bg-gradient-to-br from-[#F8FAF9] via-[#F0F7F2] to-[#EAF4EC] p-6 rounded-2xl border border-[#C5E3CC] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="text-center md:text-left space-y-1">
          <span className="text-[11px] font-extrabold text-[#1F6B32] uppercase tracking-wider flex items-center gap-1.5 justify-center md:justify-start">
            <TrendingUp className="w-3.5 h-3.5" />
            Weighted Aggregate Progress Score
          </span>
          <div className="text-4xl font-black text-[#18201B]">
            {score.toFixed(1)}<span className="text-xl font-bold text-[#66706A]"> / 100%</span>
          </div>
          <p className="text-[11px] text-[#66706A]">
            Formula: Attendance (40%) + Combined Tasks (40%) + Work Logs (20%)
          </p>
        </div>

        {/* Dynamic Progress Meter Bar */}
        <div className="w-full md:w-72 space-y-2 bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-2xs">
          <div className="flex justify-between text-xs font-bold text-[#18201B]">
            <span>Completion Rating</span>
            <span className="text-[#2F8F46] font-extrabold">{score.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-[#E5E7EB] rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                score >= 60
                  ? 'bg-gradient-to-r from-[#2F8F46] to-[#4ADE80]'
                  : score >= 40
                  ? 'bg-gradient-to-r from-[#D97706] to-[#FBBF24]'
                  : 'bg-gradient-to-r from-[#DC2626] to-[#F87171]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Attendance Metric */}
        <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] hover:border-[#2F8F46] transition-colors space-y-2">
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold text-[#18201B]">Attendance Rate</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#18201B]">{attPct.toFixed(1)}%</div>
          <div className="text-[11px] text-[#66706A] flex items-center justify-between border-t border-[#E1E7E2] pt-1.5">
            <span>Weight: <strong>40%</strong></span>
            <span className="text-[#2F8F46] font-bold">GPS Verified</span>
          </div>
        </div>

        {/* Task Completion Metric */}
        <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] hover:border-[#2F8F46] transition-colors space-y-2">
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold text-[#18201B]">Task Completion</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#18201B]">{taskPct.toFixed(1)}%</div>
          <div className="text-[11px] text-[#66706A] flex items-center justify-between border-t border-[#E1E7E2] pt-1.5">
            <span>Weight: <strong>40%</strong></span>
            <span className="text-[#2F8F46] font-bold">Graded Deliverables</span>
          </div>
        </div>

        {/* Work Logs Metric */}
        <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] hover:border-[#2F8F46] transition-colors space-y-2">
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold text-[#18201B]">Work Log Submissions</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#18201B]">{logCount} Entries</div>
          <div className="text-[11px] text-[#66706A] flex items-center justify-between border-t border-[#E1E7E2] pt-1.5">
            <span>Weight: <strong>20%</strong></span>
            <span className="text-[#2F8F46] font-bold">Logged Activity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

