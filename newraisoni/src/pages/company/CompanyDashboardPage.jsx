import React from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { Building2, Briefcase, Award, CheckSquare } from 'lucide-react';

export const CompanyDashboardPage = () => {
  const { profile, user } = useAuth();

  return (
    <PortalLayout title="Company Mentor Dashboard" roleLabel="Company Mentor">
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#18201B]">
            Welcome, {profile?.full_name || 'Company Mentor'}!
          </h2>
          <p className="text-sm text-[#66706A] mt-1">
            Manage company opportunities, intern attendance, task assignments, and evaluations.
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
          <Building2 className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
          <span className="text-xs font-semibold text-[#66706A]">Company Interns</span>
          <p className="text-2xl font-bold text-[#18201B] mt-2">Active</p>
          <p className="text-xs text-[#2F8F46] font-medium mt-1">Company Scope Verified</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
          <span className="text-xs font-semibold text-[#66706A]">Task Management</span>
          <p className="text-2xl font-bold text-[#18201B] mt-2">Ready</p>
          <p className="text-xs text-[#66706A] mt-1">Phase 1 Active</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
          <span className="text-xs font-semibold text-[#66706A]">User Account</span>
          <p className="text-sm font-semibold text-[#18201B] mt-2 truncate">{user?.email}</p>
          <p className="text-xs text-[#2F8F46] font-medium mt-1">Role: Company Mentor</p>
        </div>
      </div>
    </PortalLayout>
  );
};
