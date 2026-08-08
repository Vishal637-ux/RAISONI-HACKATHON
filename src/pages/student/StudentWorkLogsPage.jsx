import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { workLogService } from '../../services/workLogService';
import { WorkLogSubmissionCard } from '../../components/student/WorkLogSubmissionCard';
import { WorkLogHistoryList } from '../../components/student/WorkLogHistoryList';
import { Loader } from '../../components/common/Loader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FileText, AlertTriangle, RefreshCw, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentWorkLogsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInternship, setActiveInternship] = useState(null);
  const [workLogRecords, setWorkLogRecords] = useState([]);

  const loadWorkLogData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await workLogService.fetchWorkLogData(user.id);
      setActiveInternship(data.activeInternship);
      setWorkLogRecords(data.records || []);
    } catch {
      setActiveInternship(null);
      setWorkLogRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadWorkLogData();
  }, [loadWorkLogData]);

  const handleSubmitWorkLog = async (formData) => {
    if (!user?.id) return false;
    setIsSubmitting(true);

    try {
      await workLogService.submitWorkLog({
        studentId: user.id,
        description: formData.description,
      });

      toast.success('Work log submitted successfully!');
      await loadWorkLogData();
      return true;
    } catch (err) {
      console.error('Work log submission error:', err);
      toast.error(err.message || 'Failed to submit work log');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Work Logs Management</h1>
          <p className="text-xs text-[#6B7280]">Log completed tasks and progress for your internship</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 bg-white border border-[#E9DDFE] rounded-2xl p-8">
          <Loader size="lg" />
          <p className="text-xs font-medium text-[#6B7280]">Loading work log records...</p>
        </div>
      </div>
    );
  }

  // 2. Unexpected Error State with Retry Button
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Work Logs Management</h1>
          <p className="text-xs text-[#6B7280]">Log completed tasks and progress for your internship</p>
        </div>

        <Card className="bg-rose-50 border border-rose-200 p-8 text-center shadow-sm rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-base font-bold text-rose-900">Failed to Load Work Logs</h3>
            <p className="text-xs text-rose-700 max-w-md">{error}</p>
            <Button
              onClick={loadWorkLogData}
              variant="danger"
              className="mt-2 gap-2 text-xs"
            >
              <RefreshCw size={14} />
              Retry Loading Data
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 3. No Active Internship State (Refined EmptyState View)
  if (!activeInternship) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Work Logs Management</h1>
          <p className="text-xs text-[#6B7280]">Log completed tasks and progress for your internship</p>
        </div>

        <Card className="bg-white border border-[#E9DDFE] p-8 sm:p-10 shadow-sm rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
          <div className="flex flex-col items-center justify-center text-center gap-4 max-w-lg mx-auto">
            {/* Work Logs Icon */}
            <div className="w-20 h-20 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center shadow-2xs shrink-0">
              <FileText size={56} />
            </div>

            {/* Internship Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock size={13} />
              <span>Internship Status: <strong className="font-bold">Not Assigned</strong></span>
            </div>

            {/* Heading & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#171717]">
                No Active Internship Found
              </h3>
              <p className="text-sm text-[#6B7280] max-w-[420px] mx-auto leading-relaxed">
                You don't have an approved active internship yet.
                <br />
                Work log submission will automatically unlock once your internship status becomes Approved or Ongoing.
              </p>
            </div>

            {/* Unlock Requirements Muted Section */}
            <div className="bg-[#F3EDFF]/40 border border-[#E9DDFE] rounded-xl p-4 max-w-[380px] w-full text-left text-xs text-[#6B7280] space-y-1.5 my-1">
              <span className="font-semibold text-[#171717] block text-center mb-1">
                Work Log Unlock Requirements
              </span>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Internship Assigned</span>
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Status = Approved or Ongoing</span>
              </div>
            </div>

            {/* Call-to-Action Primary Button */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.STUDENT_INTERNSHIP)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#A874F7] hover:bg-[#965be3] rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm cursor-pointer mt-1"
            >
              <span>Go to Internship</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Active Internship Work Logs Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Work Logs Management</h1>
          <p className="text-xs text-[#6B7280]">
            Log completed tasks and progress for{' '}
            <span className="font-semibold text-[#171717]">{activeInternship.companyName}</span>
          </p>
        </div>
      </div>

      {/* Work Log Submission Card */}
      <WorkLogSubmissionCard
        onSubmitWorkLog={handleSubmitWorkLog}
        isSubmitting={isSubmitting}
        activeInternship={activeInternship}
      />

      {/* Work Log History List */}
      <WorkLogHistoryList records={workLogRecords} />
    </div>
  );
};
