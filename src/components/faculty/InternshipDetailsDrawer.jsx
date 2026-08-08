import React from 'react';
import { Briefcase, X } from 'lucide-react';

export const InternshipDetailsDrawer = ({ isOpen, onClose, mentee }) => {
  if (!isOpen || !mentee) return null;

  const timelineSteps = [
    { label: 'Student Applied', status: 'completed', date: mentee.created_at ? new Date(mentee.created_at).toLocaleDateString() : 'May 1' },
    { label: 'Faculty Reviewing', status: 'current', date: 'In Progress' },
    { label: 'Company Mentor Assigned', status: mentee.companyMentorName ? 'completed' : 'pending', date: mentee.companyMentorName ? 'Assigned' : 'Pending' },
    { label: 'Final Approval', status: mentee.status === 'Approved' ? 'completed' : 'pending', date: mentee.status === 'Approved' ? 'Issued' : 'Pending' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      {/* Drawer Container */}
      <div className="w-full sm:w-[480px] bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-6 border-b border-[#E9DDFE] flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#171717]">Internship Details</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
                  Read-Only Drawer
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">Application ID: {mentee.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          {/* Main Info Card */}
          <div className="p-4 rounded-2xl bg-[#F3EDFF]/30 border border-[#E9DDFE] space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#A874F7] text-white">
                {mentee.status}
              </span>
              <span className="text-[11px] font-semibold text-[#6B7280]">Duration: 12 Weeks</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-[#171717]">{mentee.title}</h4>
              <p className="text-xs text-[#6B7280]">{mentee.companyName}</p>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Software engineering internship program focused on full-stack application development, REST APIs, unit testing, and team code reviews.
            </p>
          </div>

          {/* Mentee & Supervisors Info */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Associated Stakeholders
            </h5>

            <div className="p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] font-medium">Student Mentee:</span>
                <span className="font-bold text-[#171717]">{mentee.studentName} ({mentee.rollNumber})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] font-medium">Academic Department:</span>
                <span className="font-semibold text-[#171717]">{mentee.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] font-medium">Company Technical Mentor:</span>
                <span className={`font-semibold ${mentee.companyMentorName ? 'text-[#A874F7]' : 'text-amber-600'}`}>
                  {mentee.companyMentorName || 'No Company Mentor Assigned Yet'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B7280] font-medium">Faculty Academic Supervisor:</span>
                <span className="font-semibold text-[#171717]">Faculty Mentor (Academic Supervisor)</span>
              </div>
            </div>
          </div>

          {/* Dates & Timeline */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Internship Schedule & Dates
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-gray-200 bg-white">
                <span className="text-[#6B7280] text-[11px] block">Start Date</span>
                <span className="font-bold text-[#171717]">{mentee.startDate || '2026-05-15'}</span>
              </div>
              <div className="p-3 rounded-xl border border-gray-200 bg-white">
                <span className="text-[#6B7280] text-[11px] block">Expected End Date</span>
                <span className="font-bold text-[#171717]">{mentee.endDate || '2026-08-15'}</span>
              </div>
            </div>
          </div>

          {/* Read-Only Visual Verification Timeline */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              Verification Workflow Timeline
            </h5>

            <div className="space-y-2.5 relative pl-4 border-l-2 border-[#E9DDFE] ml-2">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-center justify-between">
                  <div className="absolute -left-[23px] w-3.5 h-3.5 rounded-full bg-white border-2 border-[#A874F7]" />
                  <span className="font-semibold text-[#171717]">{step.label}</span>
                  <span className="text-[11px] text-[#6B7280]">{step.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E9DDFE] bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-semibold text-xs hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer"
          >
            Close Details Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
