import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { LogOut, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { TPONotificationDrawer } from '../components/tpo/TPONotificationDrawer';

export const TPOLayout = ({ children }) => {
  const { profile } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EDFF]/50 flex flex-col">
      <header className="bg-white border-b border-[#E9DDFE] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#A874F7] text-white flex items-center justify-center font-bold text-sm">
            TPO
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#171717]">Training & Placement Officer Portal</h2>
            <p className="text-xs text-[#6B7280]">{profile?.full_name || profile?.email || 'Prof. Rajesh Wankhede'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell with Right-Side Drawer */}
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="p-2 rounded-xl border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors relative cursor-pointer"
            aria-label="Open Institutional Placement Notifications"
            title="Institutional Placement Notifications"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A874F7] text-white text-[9px] font-bold flex items-center justify-center">
              5
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#EF4444] px-3 py-1.5 rounded-lg border border-[#E9DDFE] hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        {children}
      </main>

      {/* TPO Notification Drawer Integration */}
      <TPONotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </div>
  );
};
