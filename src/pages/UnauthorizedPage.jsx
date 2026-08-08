import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, DEFAULT_ROLE_ROUTES } from '../constants/routes';

export const UnauthorizedPage = () => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (user && role && DEFAULT_ROLE_ROUTES[role]) {
      navigate(DEFAULT_ROLE_ROUTES[role]);
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-auth-gradient flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center flex flex-col items-center gap-5 p-8 rounded-2xl shadow-xl border border-rose-100">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
          <ShieldAlert size={36} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Access Denied</h1>
          <p className="text-sm text-[#6B7280] mt-2">
            You do not have permission to access this page or portal.
          </p>
          {user && role && (
            <p className="text-xs text-[#6B7280] mt-2 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200 inline-block">
              Signed in as: <strong className="font-semibold uppercase text-[#A874F7]">{role}</strong>
            </p>
          )}
        </div>

        <div className="w-full flex flex-col gap-2.5 text-xs pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>{user && role ? 'Return to My Dashboard' : 'Back to Sign In'}</span>
          </Button>

          {user && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
