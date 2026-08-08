import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { feedbackService } from '../../services/feedbackService';
import { FeedbackSummaryCards } from '../../components/student/FeedbackSummaryCards';
import { FeedbackListCard } from '../../components/student/FeedbackListCard';
import { Loader } from '../../components/common/Loader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Clock,
  Lock,
  Info,
  GraduationCap,
  Building2,
  Star,
  TrendingUp,
} from 'lucide-react';

export const StudentFeedbackPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeInternship, setActiveInternship] = useState(null);
  const [feedbackRecords, setFeedbackRecords] = useState([]);

  const loadFeedbackData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await feedbackService.fetchStudentFeedback(user.id);
      setActiveInternship(data.activeInternship);
      setFeedbackRecords(data.records || []);
    } catch (err) {
      console.error('Feedback loading error:', err);
      setError('Unable to load feedback. Please check your connection.');
      setActiveInternship(null);
      setFeedbackRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFeedbackData();
  }, [loadFeedbackData]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Mentor Feedback & Performance</h1>
          <p className="text-xs text-[#6B7280]">
            View performance evaluations and feedback submitted by your Faculty and Company Mentors.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 bg-white border border-[#E9DDFE] rounded-2xl p-8">
          <Loader size="lg" />
          <p className="text-xs font-medium text-[#6B7280]">Loading mentor feedback & evaluations...</p>
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
          <h1 className="text-2xl font-bold text-[#171717]">Mentor Feedback & Performance</h1>
          <p className="text-xs text-[#6B7280]">
            View performance evaluations and feedback submitted by your Faculty and Company Mentors.
          </p>
        </div>

        <Card className="bg-rose-50 border border-rose-200 p-8 text-center shadow-sm rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-base font-bold text-rose-900">Failed to load feedback.</h3>
            <p className="text-xs text-rose-700 max-w-md">{error}</p>
            <Button
              onClick={loadFeedbackData}
              variant="danger"
              className="mt-2 gap-2 text-xs"
            >
              <RefreshCw size={14} />
              Retry Loading Feedback
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
          <h1 className="text-2xl font-bold text-[#171717]">Mentor Feedback & Performance</h1>
          <p className="text-xs text-[#6B7280]">
            View performance evaluations and feedback submitted by your Faculty and Company Mentors.
          </p>
        </div>

        <Card className="bg-white border border-[#E9DDFE] p-8 sm:p-10 shadow-sm rounded-2xl min-h-[350px] flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
            {/* Large MessageSquare Icon */}
            <div className="w-20 h-20 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center shadow-2xs shrink-0 mb-4">
              <MessageSquare size={56} />
            </div>

            {/* Dual Status Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock size={13} />
                <span>Internship: <strong className="font-bold">Not Assigned</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
                <Lock size={13} />
                <span>Feedback: <strong className="font-bold">Locked</strong></span>
              </div>
            </div>

            {/* Heading & Description */}
            <div className="space-y-2 mb-5">
              <h3 className="text-xl font-semibold text-[#171717]">
                No Active Internship Found
              </h3>
              <p className="text-xs text-[#6B7280] max-w-[440px] mx-auto leading-relaxed">
                Complete your internship onboarding and wait for your internship to be approved. Once your Faculty or Company Mentor submits performance feedback, it will automatically appear here.
              </p>
            </div>

            {/* Unlock Requirements Checklist Card */}
            <div className="bg-[#F3EDFF]/40 border border-[#E9DDFE] rounded-xl p-4 max-w-[420px] w-full text-left text-xs text-[#6B7280] space-y-2.5 mb-5">
              <span className="font-semibold text-[#171717] block text-center mb-1.5 text-xs">
                Feedback becomes available after
              </span>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Internship Assigned</span>
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Internship Status = Approved or Ongoing</span>
              </div>
              <div className="flex items-center gap-2 text-[#171717] font-semibold">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Mentor submits first feedback</span>
              </div>
            </div>

            {/* What Happens Next? Informational Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 max-w-[420px] w-full text-left text-xs text-[#6B7280] space-y-2 mb-6">
              <div className="flex items-center gap-1.5 text-[#171717] font-semibold text-xs mb-1.5">
                <Info size={14} className="text-[#A874F7]" />
                <span>Once unlocked, this page will allow you to:</span>
              </div>
              <div className="space-y-2 text-[#4B5563] pl-1">
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-[#A874F7] shrink-0" />
                  <span>View Faculty Mentor feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-[#A874F7] shrink-0" />
                  <span>View Company Mentor feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-[#A874F7] shrink-0" />
                  <span>Review performance ratings</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#A874F7] shrink-0" />
                  <span>Read mentor remarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#A874F7] shrink-0" />
                  <span>Monitor internship performance</span>
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

            {/* Footer Helper Text */}
            <p className="text-[11px] text-[#6B7280] mt-3">
              Feedback will automatically appear here after your mentors complete an evaluation. No manual refresh is required.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Active Internship but 0 Feedback Received State
  if (feedbackRecords.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Mentor Feedback & Performance</h1>
          <p className="text-xs text-[#6B7280]">
            Performance feedback for{' '}
            <span className="font-semibold text-[#171717]">{activeInternship.companyName}</span>
          </p>
        </div>

        <FeedbackSummaryCards records={[]} />

        <Card className="bg-white border border-[#E9DDFE] p-8 sm:p-10 shadow-sm rounded-2xl text-center min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
              <MessageSquare size={36} />
            </div>
            <h3 className="text-lg font-semibold text-[#171717]">No Mentor Feedback Received Yet</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Your Faculty and Company Mentors have not submitted any feedback yet. Feedback will automatically appear here once submitted.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 5. Active Feedback Dashboard View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Mentor Feedback & Performance</h1>
          <p className="text-xs text-[#6B7280]">
            View performance evaluations and feedback submitted by your Faculty and Company Mentors for{' '}
            <span className="font-semibold text-[#171717]">{activeInternship.companyName}</span>
          </p>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <FeedbackSummaryCards records={feedbackRecords} />

      {/* Feedback List & Category Breakdown */}
      <FeedbackListCard records={feedbackRecords} />
    </div>
  );
};
