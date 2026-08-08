import React from 'react';
import { Card } from '../common/Card';
import { Activity, Clock, ArrowRight, UserCheck, FileText, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const RecentActivityWidget = ({ activities = [], onViewStudent }) => {
  const displayActivities = activities;

  return (
    <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl">
      <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#171717]">Recent Faculty Activity</h3>
            <p className="text-xs text-[#6B7280]">Latest student check-ins and system events</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
          Read-Only Log
        </span>
      </div>

      <div className="space-y-3.5">
        {displayActivities.map((act) => {
          const Icon = act.icon || Activity;
          return (
            <div
              key={act.id}
              className="flex items-center justify-between p-3 rounded-xl border border-[#E9DDFE] bg-white hover:bg-[#F3EDFF]/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${act.bgColor} ${act.iconColor} border border-[#E9DDFE] flex items-center justify-center shrink-0`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#171717]">{act.description}</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mt-0.5">
                    <span>
                      Student: <strong className="font-semibold text-[#171717]">{act.studentName}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-[#A874F7]" />
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onViewStudent && onViewStudent(act.studentName)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A874F7] hover:underline cursor-pointer"
              >
                <span>View Student</span>
                <ArrowRight size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
