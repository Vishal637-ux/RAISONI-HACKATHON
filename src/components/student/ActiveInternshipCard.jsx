import React from 'react';
import { Card } from '../common/Card';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Globe,
  MapPin,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';

export const getConsistentStatusBadge = (status) => {
  const normalized = (status || '').toString().trim().toLowerCase();

  switch (normalized) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 size={13} />
          Approved
        </span>
      );
    case 'ongoing':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
          <Sparkles size={13} />
          Ongoing
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} />
          Completed
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={13} />
          Rejected
        </span>
      );
    case 'applied':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock size={13} />
          {status || 'Applied'}
        </span>
      );
  }
};

export const ActiveInternshipCard = ({ internship, onRefreshStatus, onBrowseCompanies }) => {
  // Timeline Stages Definition
  const journeyStages = [
    { id: 'application', label: 'Application' },
    { id: 'approved', label: 'Approved' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
  ];

  const getActiveStageIndex = (status) => {
    if (!status) return 0;
    const s = status.toLowerCase();
    if (s === 'completed') return 4;
    if (s === 'ongoing') return 3;
    if (s === 'assigned') return 2;
    if (s === 'approved') return 1;
    if (s === 'applied') return 0;
    return 0;
  };

  const activeStageIndex = getActiveStageIndex(internship?.status);

  if (!internship) {
    return (
      <Card className="p-7 rounded-2xl border border-[#E9DDFE] bg-white mb-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
        <div className="border-b border-[#E9DDFE] pb-4 mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#171717] flex items-center gap-2.5">
              <Briefcase size={20} className="text-[#A874F7]" />
              Active Internship Details
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Your assigned or ongoing internship information</p>
          </div>
        </div>

        {/* Improved EmptyState with Clear Messaging & Quick Actions */}
        <div className="flex flex-col items-center justify-center py-10 px-6 bg-[#F3EDFF]/20 border-2 border-dashed border-[#E9DDFE] rounded-2xl text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center shadow-2xs">
            <Briefcase size={32} />
          </div>
          <div className="max-w-md">
            <h4 className="text-base font-bold text-[#171717]">No Active Internship Assigned</h4>
            <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
              You do not have an active internship assignment at this time. You can submit new applications for available internship opportunities or wait for your TPO coordinator to approve your pending allocation.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {onBrowseCompanies && (
              <button
                type="button"
                onClick={onBrowseCompanies}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#A874F7] hover:bg-[#965be3] rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm"
              >
                <Search size={14} />
                Browse Internship Opportunities
              </button>
            )}
            {onRefreshStatus && (
              <button
                type="button"
                onClick={onRefreshStatus}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#A874F7] bg-white hover:bg-[#F3EDFF] border border-[#E9DDFE] rounded-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <RefreshCw size={14} />
                Refresh Status
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-7 rounded-2xl border border-[#E9DDFE] bg-white mb-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              Assigned Internship
            </span>
            <h3 className="text-xl font-bold text-[#171717] mt-0.5">{internship.title}</h3>
          </div>
          <div>{getConsistentStatusBadge(internship.status)}</div>
        </div>

        {/* Internship Journey Timeline */}
        <div className="p-5 bg-[#F3EDFF]/30 border border-[#E9DDFE] rounded-xl">
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block mb-4">
            Internship Progress Journey
          </span>
          <div className="flex items-center justify-between relative">
            {/* Background Connector Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#E9DDFE] -z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#A874F7] transition-all duration-500 -z-0"
              style={{
                width: `${(activeStageIndex / (journeyStages.length - 1)) * 100}%`,
              }}
            />

            {journeyStages.map((stage, idx) => {
              const isCompleted = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;
              return (
                <div key={stage.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#A874F7] text-white ring-4 ring-[#F3EDFF] shadow-sm scale-110'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border-2 border-[#E9DDFE] text-[#6B7280]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      isCurrent
                        ? 'text-[#A874F7]'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company & Industry Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F3EDFF]/40 border border-[#E9DDFE] p-5 rounded-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#A874F7]/10 text-[#A874F7] flex items-center justify-center font-bold shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <span className="text-xs font-medium text-[#6B7280]">Company Name</span>
              <h4 className="text-base font-bold text-[#171717]">{internship.company.name}</h4>
              <span className="text-xs text-[#A874F7] font-semibold block mt-0.5">{internship.company.industry}</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2 text-xs text-[#6B7280]">
            {internship.company.address !== 'N/A' && (
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-[#A874F7] shrink-0" />
                {internship.company.address}
              </span>
            )}
            {internship.company.website !== 'N/A' && (
              <a
                href={internship.company.website.startsWith('http') ? internship.company.website : `https://${internship.company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#A874F7] font-medium hover:underline"
              >
                <Globe size={15} className="shrink-0" />
                {internship.company.website}
              </a>
            )}
          </div>
        </div>

        {/* Internship Timeline Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3.5 p-4 bg-white border border-[#E9DDFE] rounded-xl shadow-2xs">
            <Calendar size={20} className="text-[#A874F7]" />
            <div>
              <span className="text-xs font-medium text-[#6B7280] block">Start Date</span>
              <span className="text-sm font-semibold text-[#171717]">{internship.startDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-white border border-[#E9DDFE] rounded-xl shadow-2xs">
            <Calendar size={20} className="text-[#A874F7]" />
            <div>
              <span className="text-xs font-medium text-[#6B7280] block">End Date</span>
              <span className="text-sm font-semibold text-[#171717]">{internship.endDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
