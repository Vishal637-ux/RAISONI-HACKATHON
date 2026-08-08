import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ShieldCheck, AlertCircle, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export const ApprovalConfirmationDialog = ({ isOpen, onClose, onConfirm, mentee, targetStatus, isLoading }) => {
  if (!isOpen || !mentee || !targetStatus) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Revision Required':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-[#A874F7] bg-[#F3EDFF] border-[#E9DDFE]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="bg-white border border-[#E9DDFE] max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck size={26} />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#171717]">Confirm Internship Decision</h3>
          <p className="text-xs text-[#6B7280]">
            Are you sure you want to update the academic status to{' '}
            <span className={`font-bold px-2 py-0.5 rounded-md border text-xs ${getStatusColor(targetStatus)}`}>
              {targetStatus}
            </span>
            ?
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-left text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Student Mentee:</span>
            <span className="font-bold text-[#171717]">{mentee.studentName} ({mentee.rollNumber})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Host Company:</span>
            <span className="font-semibold text-[#171717]">{mentee.companyName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Internship Role:</span>
            <span className="font-semibold text-[#171717]">{mentee.title}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9DDFE]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            className="text-xs px-5"
          >
            Confirm & Save Decision
          </Button>
        </div>
      </Card>
    </div>
  );
};
