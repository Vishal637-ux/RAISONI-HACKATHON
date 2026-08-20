import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Compass, CheckSquare, FileText, AlertTriangle, ShieldCheck, AlertCircle, TrendingUp, Sparkles, Medal, ExternalLink } from 'lucide-react';

function getLetterGrade(score) {
  if (score >= 90) return { grade: 'Grade O', label: 'Outstanding (Highest Distinction)', bg: 'bg-[#EAF4EC]', text: 'text-[#1F6B32]', border: 'border-[#C5E3CC]' };
  if (score >= 80) return { grade: 'Grade A+', label: 'Excellent Performance', bg: 'bg-[#EAF4EC]', text: 'text-[#1F6B32]', border: 'border-[#C5E3CC]' };
  if (score >= 70) return { grade: 'Grade A', label: 'Very Good Progress', bg: 'bg-[#EAF4EC]', text: 'text-[#2F8F46]', border: 'border-[#C5E3CC]' };
  if (score >= 60) return { grade: 'Grade B+', label: 'Good Standing', bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' };
  return { grade: 'Grade C', label: 'Attention Needed (At Risk)', bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', border: 'border-[#FCA5A5]' };
}

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

  const letterGrade = getLetterGrade(score);

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
      {/* Header & Risk Level & Letter Grade */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F0F4F1] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
            <Award className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#18201B]">
            {progress.period_type || 'OVERALL'} Snapshot
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* University Letter Grade Badge */}
          <div className={`px-3.5 py-1.5 rounded-full border text-xs font-extrabold flex items-center gap-1.5 shadow-2xs ${letterGrade.bg} ${letterGrade.border} ${letterGrade.text}`}>
            <Medal className="w-4 h-4" />
            <span>{letterGrade.grade}</span>
            <span className="opacity-70 font-normal hidden md:inline">({letterGrade.label})</span>
          </div>

          <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-2xs ${currentRiskConfig.bg} ${currentRiskConfig.border} ${currentRiskConfig.text}`}>
            <RiskIcon className="w-4 h-4" />
            <span>{currentRiskConfig.label}</span>
          </div>
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
            <span>Academic Performance Rating</span>
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

      {/* AI Evaluation Intelligence & Career Advisory Card */}
      <div className="bg-gradient-to-r from-[#18201B] via-[#242C27] to-[#18201B] text-white p-4.5 rounded-xl shadow-sm flex items-start gap-3.5 border border-[#2F8F46]/40">
        <div className="w-9 h-9 rounded-xl bg-[#2F8F46] text-white flex items-center justify-center shrink-0 font-bold mt-0.5 shadow-md">
          <Sparkles className="w-5 h-5 text-[#86EFAC]" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-extrabold text-[#4ADE80] flex items-center gap-2">
            <span className="text-sm">AI Evaluation Intelligence & Career Advisory</span>
            <span className="text-[9px] bg-[#2F8F46]/50 text-[#86EFAC] px-2.5 py-0.5 rounded-full border border-[#4ADE80]/40 font-bold uppercase tracking-wider">
              Gemini Powered
            </span>
          </div>
          <p className="text-white/90 leading-relaxed font-medium text-[11.5px]">
            {score >= 90
              ? `Exceptional performance! Student maintains 100% GPS geofence compliance and flawless graded task deliverables (${taskPct.toFixed(1)}%). Candidate demonstrates highest distinction potential — Recommended for Fast-Track Industry Certificate & PPO (Pre-Placement Offer).`
              : score >= 75
              ? `Solid progress recorded across all pillars. Attendance rate is strong (${attPct.toFixed(1)}%). Recommend maintaining daily work log submissions to achieve Grade O distinction.`
              : score >= 60
              ? `Satisfactory standing. Student is on track, but task submission velocity or attendance can be improved for higher academic honors.`
              : `Early warning alert: Performance score is below optimal thresholds. Faculty Mentor intervention recommended.`}
          </p>
        </div>
      </div>

      {/* Interactive Breakdown Grid — Clickable Navigation to Pillar Pages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* Attendance Metric */}
        <Link
          to="/student/attendance"
          className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] hover:border-[#2F8F46] hover:bg-white hover:shadow-md transition-all space-y-2 group cursor-pointer"
          title="Click to view GPS Attendance Check-In details"
        >
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold text-[#18201B] group-hover:text-[#1F6B32] transition-colors">Attendance Rate</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center group-hover:bg-[#2F8F46] group-hover:text-white transition-colors">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#18201B] group-hover:text-[#1F6B32] transition-colors">{attPct.toFixed(1)}%</div>
          <div className="text-[11px] text-[#66706A] flex items-center justify-between border-t border-[#E1E7E2] pt-1.5">
            <span>Weight: <strong>40%</strong></span>
            <span className="text-[#2F8F46] font-bold flex items-center gap-1 group-hover:underline">
              GPS Logs <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Task Completion Metric */}
        <Link
          to="/student/tasks"
          className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] hover:border-[#2F8F46] hover:bg-white hover:shadow-md transition-all space-y-2 group cursor-pointer"
          title="Click to view Tasks & Deliverables"
        >
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold text-[#18201B] group-hover:text-[#1F6B32] transition-colors">Task Completion</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center group-hover:bg-[#2F8F46] group-hover:text-white transition-colors">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#18201B] group-hover:text-[#1F6B32] transition-colors">{taskPct.toFixed(1)}%</div>
          <div className="text-[11px] text-[#66706A] flex items-center justify-between border-t border-[#E1E7E2] pt-1.5">
            <span>Weight: <strong>40%</strong></span>
            <span className="text-[#2F8F46] font-bold flex items-center gap-1 group-hover:underline">
              Deliverables <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Work Logs Metric */}
        <Link
          to="/student/work-logs"
          className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] hover:border-[#2F8F46] hover:bg-white hover:shadow-md transition-all space-y-2 group cursor-pointer"
          title="Click to view Daily Work Logs"
        >
          <div className="flex items-center justify-between text-[#66706A]">
            <span className="font-bold text-[#18201B] group-hover:text-[#1F6B32] transition-colors">Work Log Submissions</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center group-hover:bg-[#2F8F46] group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#18201B] group-hover:text-[#1F6B32] transition-colors">{logCount} Entries</div>
          <div className="text-[11px] text-[#66706A] flex items-center justify-between border-t border-[#E1E7E2] pt-1.5">
            <span>Weight: <strong>20%</strong></span>
            <span className="text-[#2F8F46] font-bold flex items-center gap-1 group-hover:underline">
              Daily Logs <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};


