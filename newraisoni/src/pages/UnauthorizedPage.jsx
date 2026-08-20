import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';

export const UnauthorizedPage = () => {
  const { role } = useAuth();

  const getDashboardPath = () => {
    switch (role) {
      case ROLES.STUDENT:
        return ROUTES.STUDENT_DASHBOARD;
      case ROLES.FACULTY:
        return ROUTES.FACULTY_DASHBOARD;
      case ROLES.COMPANY:
        return ROUTES.COMPANY_DASHBOARD;
      case ROLES.TPO:
        return ROUTES.TPO_DASHBOARD;
      case ROLES.HOD:
        return ROUTES.HOD_DASHBOARD;
      case ROLES.ADMIN:
        return ROUTES.ADMIN_DASHBOARD;
      default:
        return ROUTES.LOGIN;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#E1E7E2] shadow-sm text-center">
        <div className="w-16 h-16 bg-[#EAF4EC] text-[#2F8F46] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#18201B]">403 — Unauthorized Access</h1>
        <p className="text-sm text-[#66706A] mt-2 leading-relaxed">
          You do not have permission to view this portal. Access is strictly governed by your assigned InterTrack role permissions.
        </p>

        <div className="mt-6">
          <Link
            to={getDashboardPath()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-semibold text-sm rounded-lg transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Your Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
