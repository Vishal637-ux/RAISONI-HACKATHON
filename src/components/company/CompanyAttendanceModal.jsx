import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  X,
  CalendarCheck,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Building2,
  ShieldCheck,
  Camera,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyAttendanceModal = ({ isOpen, onClose, record, onVerify, onMarkLate, onMarkAbsent }) => {
  const [supervisorRemarks, setSupervisorRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setSupervisorRemarks(record.supervisorRemarks || '');
    }
  }, [record]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const isVerified = record.status === 'Verified Present' || record.status === 'Late';

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      await onVerify(record.id, { remarks: supervisorRemarks });
      toast.success(`Attendance #${record.id} Verified Present`);
      onClose();
    } catch {
      toast.error('Failed to verify attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLate = async () => {
    setIsSubmitting(true);
    try {
      await onMarkLate(record.id, { remarks: supervisorRemarks });
      toast.success(`Marked Attendance #${record.id} as Late`);
      onClose();
    } catch {
      toast.error('Failed to mark attendance as late');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbsent = async () => {
    setIsSubmitting(true);
    try {
      await onMarkAbsent(record.id, { remarks: supervisorRemarks });
      toast.success(`Marked Attendance #${record.id} as Absent`);
      onClose();
    } catch {
      toast.error('Failed to mark attendance as absent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-modal-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold">
              <CalendarCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="attendance-modal-title" className="text-base font-bold text-[#171717]">
                  {isVerified ? 'View Industry Attendance Sign-Off' : 'Verify Industry Attendance Punch-In'}
                </h3>
                {isVerified && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={10} />
                    Verified & Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Student: <strong className="text-[#171717]">{record.studentName}</strong> ({record.rollNumber})
              </p>
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

        {/* Attendance Punch-In Details Card */}
        <div className="p-4 rounded-xl bg-[#F3EDFF]/30 border border-[#E9DDFE] space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 pb-2 border-b border-[#E9DDFE]">
            <div>
              <span className="text-[#6B7280] block text-[11px]">Attendance Date:</span>
              <span className="font-bold text-[#171717]">{record.attendanceDate}</span>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[11px]">Punch-In Time:</span>
              <span className="font-bold text-purple-700">{record.punchInTime}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#171717]">
              <MapPin size={15} className="text-[#A874F7]" />
              <span>Work Location & Geolocation:</span>
            </div>
            <p className="font-semibold text-[#171717] bg-white p-2 rounded-lg border border-[#E9DDFE]">
              {record.workLocation} ({record.geolocationCoordinates})
            </p>
          </div>

          {record.studentRemarks && (
            <div className="space-y-1">
              <span className="text-[#6B7280] font-semibold text-[11px] block">Student Punch-In Remarks:</span>
              <p className="p-2.5 rounded-lg bg-white border border-[#E9DDFE] text-[#171717] leading-relaxed">
                {record.studentRemarks}
              </p>
            </div>
          )}

          {record.photoUrl && (
            <div className="space-y-1 pt-1">
              <span className="text-[#6B7280] font-semibold text-[11px] flex items-center gap-1">
                <Camera size={13} />
                <span>On-Site Photo Proof Verification:</span>
              </span>
              <a
                href={record.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#E9DDFE] text-[#A874F7] font-semibold hover:underline text-[11px]"
              >
                <ExternalLink size={13} />
                <span>View On-Site Photo Verification Image</span>
              </a>
            </div>
          )}
        </div>

        {/* Mentor Supervisor Remarks Input */}
        <div className="space-y-1.5 text-xs">
          <label className="block font-semibold text-[#171717]">Supervisor Verification Remarks</label>
          <textarea
            rows={2}
            value={supervisorRemarks}
            onChange={(e) => setSupervisorRemarks(e.target.value)}
            disabled={isVerified}
            placeholder="Add industry supervisor comments or verification notes..."
            className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Decision Locking & Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE] text-xs">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs px-4">
            Close
          </Button>

          {isVerified ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 size={15} />
              Industry Attendance Verified & Locked
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAbsent}
                isLoading={isSubmitting}
                className="text-xs px-3 text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Mark Absent
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleLate}
                isLoading={isSubmitting}
                className="text-xs px-3 text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                Mark Late
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleVerify}
                isLoading={isSubmitting}
                className="text-xs px-5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Verify Present
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
