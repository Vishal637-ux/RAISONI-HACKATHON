import React, { useEffect } from 'react';
import {
  X,
  Bell,
  FileCheck2,
  Calendar,
  Building2,
  Briefcase,
  Activity,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const TPONotificationDrawer = ({ isOpen, onClose, notifications = [] }) => {
  // Requirement #4: Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayNotifications = notifications;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tpo-notif-drawer-title"
    >
      {/* Requirement #4: Backdrop Overlay Click to Close */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-Side Drawer Panel */}
      <div className="relative w-full max-w-md bg-white border-l border-[#E9DDFE] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E9DDFE] flex items-center justify-between bg-[#F3EDFF]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold">
              <Bell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="tpo-notif-drawer-title" className="text-base font-bold text-[#171717]">
                  Institutional Placement Alerts
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase">
                  Read-Only
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                TPO Corporate & Placement Notifications Stream
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications drawer"
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notifications Body List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {displayNotifications.length === 0 ? (
            /* Requirement #3: Empty State */
            <div className="text-center py-16 px-4 bg-[#F3EDFF]/20 rounded-2xl border border-[#E9DDFE] flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
                <Bell size={24} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No New Notifications</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs">
                Institutional placement updates and drive alerts will appear here.
              </p>
            </div>
          ) : (
            displayNotifications.map((notif) => {
              const IconComp = notif.icon || Bell;
              return (
                <div
                  key={notif.id}
                  className="p-4 rounded-2xl border border-[#E9DDFE] bg-white hover:bg-[#F3EDFF]/10 transition-colors space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A874F7] flex items-center gap-1">
                      <IconComp size={12} />
                      <span>{notif.category}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${notif.badgeColor || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {notif.badge || 'Alert'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">{notif.title}</h4>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#6B7280] pt-1 border-t border-gray-100">
                    <span>Timestamp: {notif.timestamp}</span>
                    <span className="font-semibold text-[#A874F7]">G. H. Raisoni TPO</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E9DDFE] bg-[#F3EDFF]/30 text-xs flex items-center justify-between text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <Info size={14} className="text-[#A874F7]" />
            <span>Read-Only Placement Audit Alerts</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E9DDFE] font-semibold text-[#171717] hover:bg-[#F3EDFF] transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
