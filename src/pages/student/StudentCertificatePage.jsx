import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { certificateService } from '../../services/certificateService';
import { DigitalCertificateCard } from '../../components/student/DigitalCertificateCard';
import { Loader } from '../../components/common/Loader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Award,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Clock,
  Lock,
  Info,
  ShieldCheck,
  FileCheck,
  UserCheck,
  QrCode,
} from 'lucide-react';

export const StudentCertificatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeInternship, setActiveInternship] = useState(null);
  const [certificate, setCertificate] = useState(null);

  const loadCertificateData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await certificateService.fetchOrGenerateCertificate(user.id);
      setActiveInternship(data.activeInternship);
      setCertificate(data.certificate);
    } catch (err) {
      console.error('Certificate loading error:', err);
      setError('Unable to load certificate records. Please try again.');
      setActiveInternship(null);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCertificateData();
  }, [loadCertificateData]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Digital Internship Certificate</h1>
          <p className="text-xs text-[#6B7280]">
            View, print, and download your verified completion certificate.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 bg-white border border-[#E9DDFE] rounded-2xl p-8">
          <Loader size="lg" />
          <p className="text-xs font-medium text-[#6B7280]">Loading certificate records...</p>
        </div>
      </div>
    );
  }

  // 2. Error State with Retry Button
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Digital Internship Certificate</h1>
          <p className="text-xs text-[#6B7280]">
            View, print, and download your verified completion certificate.
          </p>
        </div>

        <Card className="bg-rose-50 border border-rose-200 p-8 text-center shadow-sm rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-base font-bold text-rose-900">Failed to load certificate.</h3>
            <p className="text-xs text-rose-700 max-w-md">{error}</p>
            <Button
              onClick={loadCertificateData}
              variant="danger"
              className="mt-2 gap-2 text-xs"
            >
              <RefreshCw size={14} />
              Retry Loading Certificate
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Locked State (When Status is NOT 'Completed' or Certificate is null)
  if (!activeInternship || activeInternship.status !== 'Completed' || !certificate) {
    const currentStatus = activeInternship?.status || 'Not Assigned';

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Digital Internship Certificate</h1>
          <p className="text-xs text-[#6B7280]">
            View, print, and download your verified completion certificate.
          </p>
        </div>

        <Card className="bg-white border border-[#E9DDFE] p-8 sm:p-10 shadow-sm rounded-2xl min-h-[350px] flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
            {/* Award Icon */}
            <div className="w-20 h-20 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center shadow-2xs shrink-0 mb-4">
              <Award size={56} />
            </div>

            {/* Dual Status Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock size={13} />
                <span>Internship: <strong className="font-bold">{currentStatus}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
                <Lock size={13} />
                <span>Certificate: <strong className="font-bold">Locked</strong></span>
              </div>
            </div>

            {/* Heading & Description */}
            <div className="space-y-2 mb-5">
              <h3 className="text-xl font-semibold text-[#171717]">
                Digital Certificate Locked
              </h3>
              <p className="text-xs text-[#6B7280] max-w-[440px] mx-auto leading-relaxed">
                Your digital internship certificate will automatically unlock once your internship status becomes Completed after successful evaluation by your mentors.
              </p>
            </div>

            {/* Visual Progress Checklist */}
            <div className="bg-[#F3EDFF]/40 border border-[#E9DDFE] rounded-xl p-4 max-w-[420px] w-full text-left text-xs text-[#6B7280] space-y-2 mb-5">
              <span className="font-semibold text-[#171717] block text-center mb-1.5 text-xs">
                Certificate unlocks after:
              </span>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Internship Started</span>
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Attendance Completed</span>
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Work Logs Submitted</span>
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Tasks Completed</span>
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Mentor Feedback Submitted</span>
              </div>
              <div className="flex items-center gap-2 text-[#171717] font-semibold pt-1 border-t border-[#E9DDFE]">
                <Lock size={14} className="text-[#A874F7] shrink-0" />
                <span>Certificate Generation</span>
              </div>
            </div>

            {/* What Happens Next? Informational Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-[420px] w-full text-left text-xs text-[#6B7280] space-y-2 mb-6">
              <div className="flex items-center gap-1.5 text-[#171717] font-semibold text-xs mb-1.5">
                <Info size={14} className="text-[#A874F7]" />
                <span>Once unlocked, your certificate will include:</span>
              </div>
              <div className="space-y-2 text-[#4B5563] pl-1">
                <div className="flex items-center gap-2">
                  <QrCode size={14} className="text-[#A874F7] shrink-0" />
                  <span>Verified Certificate ID & QR Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#A874F7] shrink-0" />
                  <span>Official Company & Institution Seals</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-[#A874F7] shrink-0" />
                  <span>Faculty & Industry Mentor Signatures</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck size={14} className="text-[#A874F7] shrink-0" />
                  <span>High-Resolution PDF Download & Print</span>
                </div>
              </div>
            </div>

            {/* Call-to-Action Primary Button */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.STUDENT_INTERNSHIP)}
              className="inline-flex items-center gap-2.5 px-7 py-3 text-xs font-semibold text-white bg-[#A874F7] hover:bg-[#965be3] rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <span>Go to Internship</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Unlocked State (Status = 'Completed')
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Digital Internship Certificate</h1>
          <p className="text-xs text-[#6B7280]">
            View, print, and download your verified completion certificate for{' '}
            <span className="font-semibold text-[#171717]">{activeInternship.companyName}</span>
          </p>
        </div>
      </div>

      {/* Unlocked Certificate Card */}
      <DigitalCertificateCard internship={activeInternship} certificate={certificate} />
    </div>
  );
};
