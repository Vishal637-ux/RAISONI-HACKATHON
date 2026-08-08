import React from 'react';
import { Card } from '../common/Card';
import { User, Mail, Phone, BookOpen, Award, CheckCircle2, X, TrendingUp, ShieldCheck } from 'lucide-react';

export const StudentProfileModal = ({ isOpen, onClose, mentee }) => {
  if (!isOpen || !mentee) return null;

  const readinessScore = mentee.readinessScore || 90;

  const readinessChecklist = [
    { label: 'Academic Profile Complete', verified: true },
    { label: 'CGPA Eligibility Verified (>= 6.5)', verified: parseFloat(mentee.cgpa || '8.5') >= 6.5 },
    { label: 'Resume & Documents Verified', verified: true },
    { label: 'Offer Letter Uploaded & Authenticated', verified: !!mentee.offerLetterUrl },
    { label: 'Attendance Baseline (>= 75%)', verified: (mentee.attendanceScore || 85) >= 75 },
    { label: 'No Active Backlogs / Academic Holds', verified: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-sm">
              {mentee.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#171717]">{mentee.studentName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#A874F7] border border-[#E9DDFE]">
                  Academic Profile
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Roll No: <strong className="font-semibold text-[#171717]">{mentee.rollNumber}</strong> • {mentee.department}
              </p>
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

        {/* Overall Readiness Score & Progress Bar */}
        <div className="p-4 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#A874F7]" />
              <span className="text-xs font-bold text-[#171717]">Overall Internship Readiness Score</span>
            </div>
            <span className="text-xs font-bold text-[#A874F7]">{readinessScore}%</span>
          </div>
          <div className="w-full bg-[#F3EDFF] rounded-full h-2 border border-[#E9DDFE]">
            <div
              className="bg-[#A874F7] h-2 rounded-full transition-all duration-300"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80 text-xs">
          <div>
            <span className="text-[#6B7280] text-[11px] block">Academic Year</span>
            <span className="font-semibold text-[#171717]">{mentee.year}</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">Semester</span>
            <span className="font-semibold text-[#171717]">Semester {mentee.semester || 7}</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">Current CGPA</span>
            <span className="font-bold text-[#A874F7]">{mentee.cgpa || '8.5'} / 10.0</span>
          </div>
          <div>
            <span className="text-[#6B7280] text-[11px] block">Attendance Baseline</span>
            <span className="font-semibold text-emerald-600">{mentee.attendanceScore || 88}%</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/80 bg-white">
            <Mail size={15} className="text-[#A874F7] shrink-0" />
            <div>
              <span className="text-[#6B7280] text-[11px] block">Email Address</span>
              <span className="font-semibold text-[#171717] truncate">{mentee.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200/80 bg-white">
            <Phone size={15} className="text-[#A874F7] shrink-0" />
            <div>
              <span className="text-[#6B7280] text-[11px] block">Phone Number</span>
              <span className="font-semibold text-[#171717]">+91 98765 43210</span>
            </div>
          </div>
        </div>

        {/* Verification Readiness Checklist */}
        <div className="border border-[#E9DDFE] rounded-xl p-4 bg-white space-y-2.5">
          <h5 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
            Internship Eligibility Checklist
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {readinessChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {item.verified ? (
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <X size={14} className="text-rose-500 shrink-0" />
                )}
                <span className={item.verified ? 'text-[#171717] font-medium' : 'text-[#6B7280]'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#E9DDFE]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-[#E9DDFE] text-xs font-semibold text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            Close Student Profile
          </button>
        </div>
      </Card>
    </div>
  );
};
