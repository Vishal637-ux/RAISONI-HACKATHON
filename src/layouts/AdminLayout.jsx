import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { LogOut, ShieldCheck, LayoutDashboard, FileText, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN);
    } catch {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { path: ROUTES.ADMIN_DASHBOARD, label: 'User Governance', icon: LayoutDashboard },
    { path: ROUTES.ADMIN_LOGS, label: 'System Audit Logs', icon: FileText },
    { path: ROUTES.ADMIN_SETTINGS, label: 'System Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E9DDFE] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
              ADM
            </div>
            <div>
              <span className="text-xs font-black text-[#171717] block leading-tight">
                System Administrator Portal
              </span>
              <span className="text-[10px] text-[#6B7280]">
                Institutional System Role & Database Governance Administrator
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F3EDFF]/60 p-1 rounded-xl border border-[#E9DDFE]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#A874F7] shadow-2xs border border-[#E9DDFE]'
                      : 'text-[#6B7280] hover:text-[#171717]'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9DDFE] text-xs font-semibold text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">{children}</main>
    </div>
  );
};
