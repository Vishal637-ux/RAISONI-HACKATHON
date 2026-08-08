import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CheckCircle2, ShieldCheck, Bell, FileCheck, ArrowRight, X } from 'lucide-react';

export const ApprovalSuccessDialog = ({ isOpen, onClose, data, onViewDetails }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="bg-white border border-[#E9DDFE] max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-5 text-center animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={32} />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#171717]">Internship Decision Recorded!</h3>
          <p className="text-xs text-[#6B7280]">Academic status updated to <strong className="font-bold text-[#A874F7]">{data.status}</strong></p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Student Mentee:</span>
            <span className="font-bold text-[#171717]">{data.studentName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Host Company:</span>
            <span className="font-semibold text-[#171717]">{data.companyName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Role Title:</span>
            <span className="font-semibold text-[#171717]">{data.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-1.5 justify-center">
            <Bell size={13} />
            <span>Notification Sent</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <ShieldCheck size={13} />
            <span>Audit Logged</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9DDFE]">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              onClose();
              if (onViewDetails) onViewDetails(data);
            }}
            className="text-xs gap-1.5"
          >
            <span>View Internship Details</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </Card>
    </div>
  );
};
