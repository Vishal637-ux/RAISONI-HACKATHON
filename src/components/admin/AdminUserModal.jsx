import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { X, ShieldCheck, Mail, Building2, Calendar, Clock, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUserModal = ({ isOpen, onClose, userItem, onUpdateUser }) => {
  const [role, setRole] = useState('student');
  const [status, setStatus] = useState('Active');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userItem) {
      setRole(userItem.role || 'student');
      setStatus(userItem.status || 'Active');
      setShowConfirm(false);
    }
  }, [userItem]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !userItem) return null;

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (userItem.role === 'admin' && role !== 'admin') {
      toast.error('System Administrator roles cannot be changed');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateUser(userItem.id, { role, status });
      toast.success(`Updated User '${userItem.fullName}' Role to '${role.toUpperCase()}' & Status to '${status}'`);
      setShowConfirm(false);
      onClose();
    } catch {
      toast.error('Failed to update user governance settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-lg w-full p-6 rounded-2xl shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {userItem.initials || 'US'}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171717]">{userItem.fullName}</h3>
              <p className="text-xs text-[#6B7280]">Account Governance Profile & Role Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Detailed User Information */}
        <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 text-xs">
          <div>
            <span className="text-[10px] text-[#6B7280] block">Email Address</span>
            <span className="font-bold text-[#171717]">{userItem.email}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6B7280] block">MFA Security Status</span>
            <span className="font-bold text-emerald-700">✓ {userItem.mfaStatus}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6B7280] block">Assigned Organization</span>
            <span className="font-semibold text-[#171717]">{userItem.organization}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6B7280] block">Department / Module</span>
            <span className="font-semibold text-[#171717]">{userItem.department}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6B7280] block">Account Created Date</span>
            <span className="font-medium text-[#6B7280]">{userItem.createdAt}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6B7280] block">Last Login Timestamp</span>
            <span className="font-medium text-[#6B7280]">{userItem.lastLogin}</span>
          </div>
        </div>

        {/* Form or Confirmation Step */}
        {!showConfirm ? (
          <form onSubmit={handleInitialSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#171717] mb-1">Assign System Role *</label>
              <select
                value={role}
                disabled={userItem.role === 'admin'}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl px-3 py-2 focus:outline-none cursor-pointer disabled:opacity-60"
              >
                <option value="student">Student Portal Role</option>
                <option value="faculty">Faculty Mentor Role</option>
                <option value="company">Company Mentor Role</option>
                <option value="tpo">TPO Placement Officer Role</option>
                <option value="hod">HOD Head of Department Role</option>
                <option value="admin">System Administrator Role</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#171717] mb-1">Account Active Status *</label>
              <select
                value={status}
                disabled={userItem.role === 'admin'}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl px-3 py-2 focus:outline-none cursor-pointer disabled:opacity-60"
              >
                <option value="Active">Active Account (Access Granted)</option>
                <option value="Suspended">Suspended Account (Access Revoked)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E9DDFE]">
              <button
                type="button"
                onClick={() => toast.success(`Triggered password reset email for ${userItem.email}`)}
                className="px-3 py-1.5 rounded-xl border border-[#E9DDFE] text-[11px] font-semibold text-[#6B7280] hover:text-[#A874F7] flex items-center gap-1.5"
              >
                <Key size={13} />
                <span>Reset Password</span>
              </button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="text-xs px-3">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-[#A874F7] hover:bg-[#965BEB] text-white text-xs px-4 shadow-xs"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={18} className="text-amber-700 shrink-0" />
              <span>Confirm System Role & Governance Change</span>
            </div>
            <p className="text-[11px]">
              Are you sure you want to change role to <strong>'{role.toUpperCase()}'</strong> and account status to <strong>'{status}'</strong> for <strong>{userItem.fullName}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowConfirm(false)} className="text-xs px-3">
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmSave}
                isLoading={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4"
              >
                Confirm Governance Change
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
