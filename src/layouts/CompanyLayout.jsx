import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { ROUTES } from '../constants/routes';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyLayout = ({ children }) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        await authService.signOut();
      }
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN);
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EDFF]/50 flex flex-col">
      <header className="bg-white border-b border-[#E9DDFE] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#22C55E] text-white flex items-center justify-center font-bold text-sm">
            CM
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#171717]">Company Mentor Portal</h2>
            <p className="text-xs text-[#6B7280]">
              {profile?.full_name ? profile.full_name.replace('Tech Lead, TCS', 'Tech Lead, TechCorp Solutions Pvt Ltd') : 'Vikram Mehta (Tech Lead, TechCorp Solutions Pvt Ltd)'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#EF4444] px-3 py-1.5 rounded-lg border border-[#E9DDFE] hover:bg-red-50 transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};
