import React, { useState } from 'react';
import { Briefcase, Award, Plus, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { ppoService } from '../../services/ppoService';

export const PPOTrackerTable = ({ records = [], onRefresh, canEdit = true }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const statusBadges = {
    Offered: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
    Accepted: { bg: 'bg-[#EAF4EC]', text: 'text-[#1F6B32]', border: 'border-[#C5E3CC]' },
    Rejected: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', border: 'border-[#FCA5A5]' },
    Pending: { bg: 'bg-[#F8FAF9]', text: 'text-[#66706A]', border: 'border-[#E1E7E2]' },
  };

  return (
    <div className="bg-white rounded-xl border border-[#E1E7E2] shadow-xs space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Career Placement Outcomes</span>
          </div>
          <h3 className="text-lg font-bold text-[#18201B]">Institutional PPO Placement Records</h3>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#66706A]">
          No Pre-Placement Offer (PPO) records registered yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E1E7E2] text-[#66706A] uppercase font-bold text-[10px] tracking-wider bg-[#F8FAF9]">
                <th className="py-3 px-4">Student Candidate</th>
                <th className="py-3 px-4">Host Company</th>
                <th className="py-3 px-4">Offered Designation</th>
                <th className="py-3 px-4">Package CTC (LPA)</th>
                <th className="py-3 px-4">PPO Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {records.map((r) => {
                const sBadge = statusBadges[r.status] || statusBadges.Pending;
                return (
                  <tr key={r.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#18201B]">
                      {r.users?.full_name || 'Student Candidate'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#66706A]">
                      {r.companies?.company_name || 'Host Organization'}
                    </td>
                    <td className="py-3.5 px-4 text-[#18201B] font-semibold">
                      {r.designation}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#1F6B32]">
                      ₹{Number(r.ctc).toFixed(2)} LPA
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${sBadge.bg} ${sBadge.border} ${sBadge.text}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
