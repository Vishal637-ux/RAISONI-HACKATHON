import React, { useEffect } from 'react';
import { X, Bell, AlertTriangle, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export const HODNotificationDrawer = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notifications = [
    {
      id: 'hod-notif-1',
      title: '3 Faculty Approvals Pending',
      message: 'Prof. Amit Joshi has 3 pending mentee work log reviews for Computer Dept.',
      time: '20 mins ago',
      type: 'warning',
    },
    {
      id: 'hod-notif-2',
      title: 'Student Attendance Risk Alert',
      message: 'Sneha Deshmukh (CS2023-089) monthly attendance dropped to 74.0%.',
      time: '1 hour ago',
      type: 'danger',
    },
    {
      id: 'hod-notif-3',
      title: 'Department Placement Milestone',
      message: 'Computer Engineering Department reached 92.5% overall placement rate.',
      time: '4 hours ago',
      type: 'success',
    },
    {
      id: 'hod-notif-4',
      title: 'NAAC Accreditation Audit Ready',
      message: 'Criterion 5.2 department placement dataset successfully updated for AY 2025-2026.',
      time: '1 day ago',
      type: 'info',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E9DDFE] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#E9DDFE] flex items-center justify-between bg-[#F3EDFF]/30">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#F3EDFF] text-[#A874F7]">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[#171717] text-sm">Department Notifications</h3>
                <span className="text-[10px] text-[#6B7280]">Read-Only Department Academic Stream</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                  n.type === 'danger' ? 'bg-rose-50/60 border-rose-200 text-rose-900' :
                  n.type === 'warning' ? 'bg-amber-50/60 border-amber-200 text-amber-900' :
                  n.type === 'success' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' :
                  'bg-blue-50/60 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold block flex items-center gap-1.5">
                    {n.type === 'danger' && <AlertTriangle size={14} className="text-rose-600" />}
                    {n.type === 'warning' && <Clock size={14} className="text-amber-600" />}
                    {n.type === 'success' && <CheckCircle2 size={14} className="text-emerald-600" />}
                    {n.type === 'info' && <FileText size={14} className="text-blue-600" />}
                    {n.title}
                  </span>
                  <span className="text-[9px] opacity-70 font-semibold">{n.time}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#E9DDFE] text-center text-[10px] text-[#6B7280] bg-gray-50">
            HOD Academic Governance Stream • Single Source of Truth
          </div>
        </div>
      </div>
    </div>
  );
};
