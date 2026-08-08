import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { ROUTES } from '../constants/routes';
import { LogOut, LayoutDashboard, UserCheck, Briefcase, Calendar, FileText, CheckSquare, MessageSquare, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentLayout = ({ children }) => {
  const { profile } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard },
    { label: 'My Profile', path: ROUTES.STUDENT_PROFILE, icon: UserCheck },
    { label: 'Internship', path: ROUTES.STUDENT_INTERNSHIP, icon: Briefcase },
    { label: 'Attendance', path: ROUTES.STUDENT_ATTENDANCE, icon: Calendar },
    { label: 'Work Logs', path: ROUTES.STUDENT_WORK_LOGS, icon: FileText },
    { label: 'Tasks', path: ROUTES.STUDENT_TASKS, icon: CheckSquare },
    { label: 'Mentor Feedback', path: ROUTES.STUDENT_FEEDBACK, icon: MessageSquare },
    { label: 'Certificate', path: ROUTES.STUDENT_CERTIFICATE, icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#F3EDFF]/50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9DDFE] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A874F7] text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#171717]">Student Portal</h2>
              <p className="text-xs text-[#6B7280]">
                {profile?.full_name && profile.full_name !== 'Rahul Sharma' ? profile.full_name : 'Vishal Bhelave (Student)'}
              </p>
            </div>
          </div>

          {/* Navigation Bar Links */}
          <nav className="hidden sm:flex items-center gap-1 border-l border-[#E9DDFE] pl-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]'
                      : 'text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#EF4444] px-3 py-1.5 rounded-lg border border-[#E9DDFE] hover:bg-red-50 transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </header>

      {/* Mobile Navigation sub-header */}
      <div className="sm:hidden bg-white border-b border-[#E9DDFE] px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]'
                  : 'text-[#6B7280] hover:text-[#171717]'
              }`}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};
