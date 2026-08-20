import React from 'react';
import { Calendar, Building2, Briefcase, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';

export const ApplicationTrackerTable = ({ applications = [] }) => {
  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Applications Submitted</h3>
        <p className="text-xs text-[#66706A]">
          You have not applied for any internship postings yet. Browse open opportunities to apply.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selected
          </span>
        );
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3.5 h-3.5" />
            Shortlisted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'Applied':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Clock className="w-3.5 h-3.5" />
            Applied
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E1E7E2] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
              <th className="py-3.5 px-4">Internship Opportunity</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Mode / Stipend</th>
              <th className="py-3.5 px-4">Date Applied</th>
              <th className="py-3.5 px-4 text-right">Application Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
            {applications.map((app) => {
              const posting = app.internship_postings || {};
              const companyName = posting.companies?.company_name || 'Company';

              return (
                <tr key={app.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-sm text-[#18201B]">{posting.title || 'Internship Role'}</div>
                    <div className="text-[11px] text-[#66706A] mt-0.5">
                      Duration: {posting.duration || 'N/A'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#2F8F46] shrink-0" />
                      <span>{companyName}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#18201B]">{posting.mode || 'On-site'}</div>
                    <div className="text-[11px] text-[#2F8F46] font-semibold">{posting.stipend || 'Unpaid'}</div>
                  </td>

                  <td className="py-3.5 px-4 text-[#66706A]">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recent'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {getStatusBadge(app.status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
