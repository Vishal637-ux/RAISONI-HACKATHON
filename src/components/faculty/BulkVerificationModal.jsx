import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert, X, Check } from 'lucide-react';

export const BulkVerificationModal = ({ isOpen, onClose, selectedCount, targetStatus, type, onConfirm, isLoading }) => {
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || selectedCount === 0 || !targetStatus) return null;

  const handleExecute = () => {
    onConfirm({ status: targetStatus, remarks });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-bulk-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-md w-full p-6 rounded-2xl shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck size={26} />
        </div>

        <div className="space-y-1">
          <h3 id="modal-bulk-title" className="text-base font-bold text-[#171717]">
            Confirm Bulk Verification Decision
          </h3>
          <p className="text-xs text-[#6B7280]">
            You are about to update <strong className="font-bold text-[#A874F7]">{selectedCount}</strong> selected {type} record(s) to{' '}
            <strong className="font-bold text-emerald-700">{targetStatus}</strong>.
          </p>
        </div>

        <div className="text-left space-y-1.5 text-xs">
          <label className="font-bold text-[#171717] block">
            Bulk Verification Remarks <span className="text-[#6B7280] font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter bulk feedback applied to all selected records..."
            className="w-full p-2.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-[#171717] text-xs focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9DDFE]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleExecute}
            isLoading={isLoading}
            disabled={isLoading}
            className="text-xs px-5 gap-1.5"
          >
            <Check size={14} />
            <span>Confirm & Apply Bulk Action</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
