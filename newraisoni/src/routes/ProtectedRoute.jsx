import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF9]">
        <div className="w-10 h-10 border-4 border-[#2F8F46] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-[#66706A]">Verifying access permissions...</p>
      </div>
    );
  }

  // Anonymous user -> Redirect to login
  if (!session) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Role restriction check -> Redirect to unauthorized if role not allowed
  if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};
