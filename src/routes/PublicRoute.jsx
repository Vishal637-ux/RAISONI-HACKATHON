import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';
import { DEFAULT_ROLE_ROUTES, ROUTES } from '../constants/routes';

export const PublicRoute = () => {
  const { session, role, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Checking session..." />;
  }

  // If user is already authenticated, redirect to their role home dashboard
  if (session) {
    const targetRoute = role ? (DEFAULT_ROLE_ROUTES[role] || ROUTES.STUDENT_DASHBOARD) : ROUTES.STUDENT_DASHBOARD;
    return <Navigate to={targetRoute} replace />;
  }

  return <Outlet />;
};
