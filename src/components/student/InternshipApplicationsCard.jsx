import React from 'react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { getConsistentStatusBadge } from './ActiveInternshipCard';
import { FileSpreadsheet, Building2, Calendar } from 'lucide-react';

export const InternshipApplicationsCard = ({ applications = [] }) => {
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Card className="p-7 rounded-2xl border border-[#E9DDFE] bg-white mb-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
      <div className="flex flex-col gap-6">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4 mb-2">
          <div>
            <h3 className="text-base font-semibold text-[#171717] flex items-center gap-2.5">
              <FileSpreadsheet size={20} className="text-[#A874F7]" />
              Submitted Applications
            </h3>
            <p className="text-xs text-[#6B7280]">Track the status of your internship applications</p>
          </div>
          <span className="text-xs font-semibold text-[#A874F7] bg-[#F3EDFF] px-3 py-1 rounded-full border border-[#E9DDFE]">
            Total: {applications?.length || 0}
          </span>
        </div>

        {/* Structured Table Container - Header always visible */}
        <div className="overflow-x-auto border border-[#E9DDFE] rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9DDFE] bg-[#F3EDFF]/40 text-xs font-semibold text-[#6B7280]">
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDFE] text-xs">
              {!applications || applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center">
                    <EmptyState
                      icon={FileSpreadsheet}
                      title="No Internship Applications Found"
                      description="You have not submitted any internship applications yet. Application records will appear here once submitted."
                    />
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#171717]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center font-bold text-xs shrink-0">
                          <Building2 size={14} />
                        </div>
                        <span>{app.company.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] font-medium">
                      {app.company.industry}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#171717]">
                        <Calendar size={13} className="text-[#A874F7]" />
                        {formatDate(app.appliedAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {getConsistentStatusBadge(app.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
