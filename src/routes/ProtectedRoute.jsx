import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';
import { ROUTES } from '../constants/routes';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { session, role, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Verifying permissions..." />;
  }

  // If not logged in, redirect to login page
  if (!session) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If role is specified and user's role is not allowed, redirect to unauthorized
  if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};
