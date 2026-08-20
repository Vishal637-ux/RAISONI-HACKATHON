import React from 'react';
import { Award, Compass, CheckSquare, FileText, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

export const ProgressSummaryCard = ({ progress, title = 'Internship Progress Summary' }) => {
  if (!progress) {
    return (
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#F8FAF9] text-[#66706A] flex items-center justify-center mx-auto border border-[#E1E7E2]">
          <Award className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Progress Recorded Yet</h3>
        <p className="text-xs text-[#66706A]">
          Progress scores will aggregate automatically as check-ins, work logs, and task deliverables are recorded.
        </p>
      </div>
    );
  }

  const score = progress.progress_score !== undefined ? Number(progress.progress_score) : 0;
  const risk = progress.risk_level || 'NORMAL';
  const attPct = progress.attendance_pct !== undefined ? Number(progress.attendance_pct) : 0;
  const taskPct = progress.task_completion_pct !== undefined ? Number(progress.task_completion_pct) : 0;
  const logCount = progress.work_log_count !== undefined ? Number(progress.work_log_count) : 0;

  const riskBadgeConfig = {
    NORMAL: {
      bg: 'bg-[#EAF4EC]',
      border: 'border-[#C5E3CC]',
      text: 'text-[#1F6B32]',
      icon: ShieldCheck,
      label: 'NORMAL — ON TRACK',
    },
    LAGGING: {
      bg: 'bg-[#FEF3C7]',
      border: 'border-[#FDE68A]',
      text: 'text-[#D97706]',
      icon: AlertTriangle,
      label: 'LAGGING — ATTENTION NEEDED',
    },
    CRITICAL: {
      bg: 'bg-[#FEF2F2]',
      border: 'border-[#FCA5A5]',
      text: 'text-[#991B1B]',
      icon: AlertCircle,
      label: 'CRITICAL — HIGH RISK',
    },
  };

  const currentRiskConfig = riskBadgeConfig[risk] || riskBadgeConfig.NORMAL;
  const RiskIcon = currentRiskConfig.icon;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs space-y-5">
      {/* Header & Risk Level */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E1E7E2] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
            <Award className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <h2 className="text-xl font-bold text-[#18201B]">
            {progress.period_type || 'MONTHLY'} Snapshot
          </h2>
        </div>

        <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${currentRiskConfig.bg} ${currentRiskConfig.border} ${currentRiskConfig.text}`}>
          <RiskIcon className="w-4 h-4" />
          <span>{currentRiskConfig.label}</span>
        </div>
      </div>

      {/* Main Score Bar */}
      <div className="bg-[#F8FAF9] p-5 rounded-xl border border-[#E1E7E2] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <span className="text-xs font-bold text-[#66706A] uppercase tracking-wider">Overall Weighted Progress Score</span>
          <div className="text-3xl font-extrabold text-[#18201B] mt-1">
            {score.toFixed(1)} <span className="text-lg font-normal text-[#66706A]">/ 100%</span>
          </div>
          <p className="text-[11px] text-[#66706A] mt-1">
            Formula: Attendance (40%) + Combined Tasks (40%) + Work Logs (20%)
          </p>
        </div>

        {/* Dynamic Progress Meter Bar */}
        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-[#18201B]">
            <span>Completion Rating</span>
            <span>{score.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-[#E1E7E2] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                score >= 60 ? 'bg-[#2F8F46]' : score >= 40 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Attendance Metric */}
        <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] space-y-1">
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold">Attendance Rate</span>
            <Compass className="w-4 h-4 text-[#2F8F46]" />
          </div>
          <div className="text-xl font-bold text-[#18201B]">{attPct.toFixed(1)}%</div>
          <div className="text-[11px] text-[#66706A]">Weight: 40%</div>
        </div>

        {/* Task Completion Metric */}
        <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] space-y-1">
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold">Task Completion</span>
            <CheckSquare className="w-4 h-4 text-[#2F8F46]" />
          </div>
          <div className="text-xl font-bold text-[#18201B]">{taskPct.toFixed(1)}%</div>
          <div className="text-[11px] text-[#66706A]">Weight: 40%</div>
        </div>

        {/* Work Logs Metric */}
        <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] space-y-1">
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold">Work Log Submissions</span>
            <FileText className="w-4 h-4 text-[#2F8F46]" />
          </div>
          <div className="text-xl font-bold text-[#18201B]">{logCount} Entries</div>
          <div className="text-[11px] text-[#66706A]">Weight: 20%</div>
        </div>
      </div>
    </div>
  );
};
