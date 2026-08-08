import React, { useEffect } from 'react';
import { Card } from '../common/Card';
import { Building2, Globe, MapPin, User, Mail, Phone, ShieldCheck, X, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

export const CompanyProfileModal = ({ isOpen, onClose, mentee }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mentee) return null;

  const hasMentor = !!mentee.companyMentorName;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-company-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-company-title" className="text-base font-bold text-[#171717]">
                  Company Information & Assigned Company Mentor
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#A874F7] text-white tracking-wider uppercase">
                  READ ONLY
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">Host organization credentials and technical mentor profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Company Overview Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE]">
            <div>
              <h4 className="text-base font-bold text-[#171717]">{mentee.companyName}</h4>
              <p className="text-xs text-[#6B7280]">Tech & Software Development Industry</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} />
              Verified Partner
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/80 bg-gray-50/50">
              <Globe size={16} className="text-[#A874F7] shrink-0" />
              <div>
                <span className="text-[#6B7280] text-[11px] block">Company Website</span>
                <span className="font-semibold text-[#171717]">{mentee.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/80 bg-gray-50/50">
              <MapPin size={16} className="text-[#A874F7] shrink-0" />
              <div>
                <span className="text-[#6B7280] text-[11px] block">Corporate Headquarters</span>
                <span className="font-semibold text-[#171717]">Nagpur IT Park, Maharashtra</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/80 bg-gray-50/50">
              <User size={16} className="text-[#A874F7] shrink-0" />
              <div>
                <span className="text-[#6B7280] text-[11px] block">HR Contact Person</span>
                <span className="font-semibold text-[#171717]">Corporate HR Office</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/80 bg-gray-50/50">
              <Briefcase size={16} className="text-[#A874F7] shrink-0" />
              <div>
                <span className="text-[#6B7280] text-[11px] block">Active Interns Hosted</span>
                <span className="font-semibold text-[#171717]">Registered Host Organization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Technical Company Mentor Card / Empty State */}
        <div className="border border-[#E9DDFE] rounded-xl p-4 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#A874F7]" />
              <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                Assigned Technical Company Mentor
              </h5>
            </div>
            {hasMentor ? (
              <span className="text-[11px] text-emerald-600 font-semibold">Active Supervisor</span>
            ) : (
              <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Pending Assignment
              </span>
            )}
          </div>

          {hasMentor ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#6B7280] text-[11px] block">Mentor Name</span>
                <span className="font-bold text-[#171717]">{mentee.companyMentorName}</span>
              </div>
              <div>
                <span className="text-[#6B7280] text-[11px] block">Designation</span>
                <span className="font-semibold text-[#171717]">{mentee.companyMentorDesignation || 'N/A'}</span>
              </div>
              {mentee.companyMentorEmail && (
                <div className="flex items-center gap-1.5 text-[#4B5563]">
                  <Mail size={13} className="text-[#A874F7]" />
                  <span>{mentee.companyMentorEmail}</span>
                </div>
              )}
              {mentee.companyMentorPhone && (
                <div className="flex items-center gap-1.5 text-[#4B5563]">
                  <Phone size={13} className="text-[#A874F7]" />
                  <span>{mentee.companyMentorPhone}</span>
                </div>
              )}
            </div>
          ) : (
            /* Clean Empty State when No Mentor Assigned */
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-amber-800 text-xs font-bold">
                <AlertCircle size={15} />
                <span>No Company Mentor Assigned Yet</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Company mentor technical supervisor assignment will be completed by the host organization via Company Mentor Portal.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#E9DDFE]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-[#E9DDFE] text-xs font-semibold text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            Close Company Profile
          </button>
        </div>
      </Card>
    </div>
  );
};
