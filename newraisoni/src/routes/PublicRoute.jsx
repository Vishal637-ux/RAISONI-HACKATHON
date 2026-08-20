import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';

export const PublicRoute = () => {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF9]">
        <div className="w-10 h-10 border-4 border-[#2F8F46] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session && role) {
    switch (role) {
      case ROLES.STUDENT:
        return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
      case ROLES.FACULTY:
        return <Navigate to={ROUTES.FACULTY_DASHBOARD} replace />;
      case ROLES.COMPANY:
        return <Navigate to={ROUTES.COMPANY_DASHBOARD} replace />;
      case ROLES.TPO:
        return <Navigate to={ROUTES.TPO_DASHBOARD} replace />;
      case ROLES.HOD:
        return <Navigate to={ROUTES.HOD_DASHBOARD} replace />;
      case ROLES.ADMIN:
        return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
      default:
        return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    }
  }

  return <Outlet />;
};
