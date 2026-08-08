import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { internshipService } from '../../services/internshipService';
import { InternshipSummaryCards } from '../../components/student/InternshipSummaryCards';
import { ActiveInternshipCard } from '../../components/student/ActiveInternshipCard';
import { MentorDetailsCard } from '../../components/student/MentorDetailsCard';
import { InternshipApplicationsCard } from '../../components/student/InternshipApplicationsCard';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Briefcase, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentInternshipPage = () => {
  const { user } = useAuth();
  const [activeInternship, setActiveInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'TechCorp Solutions Pvt Ltd',
    title: 'Frontend React Developer',
    stipend: '₹25,000/mo',
    startDate: '2026-08-15',
    endDate: '2027-02-15',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInternshipData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const [internshipResult, applicationsResult] = await Promise.allSettled([
        internshipService.fetchActiveInternship(user.id),
        internshipService.fetchStudentApplications(user.id),
      ]);

      if (internshipResult.status === 'fulfilled') {
        setActiveInternship(internshipResult.value);
      } else {
        setActiveInternship(null);
      }

      if (applicationsResult.status === 'fulfilled') {
        setApplications(applicationsResult.value || []);
      } else {
        setApplications([]);
      }
    } catch {
      setActiveInternship(null);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInternshipData();
  }, [loadInternshipData]);

  const handleBrowseCompanies = () => {
    toast('Companies catalog feature available in Placement Cell module.', { icon: 'ℹ️' });
  };

  // Loading Skeletons State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717] flex items-center gap-2">
            <Briefcase size={26} className="text-[#A874F7]" />
            My Internship
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor your assigned internship status, mentor details, and application history
          </p>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#F3EDFF]/40 animate-pulse rounded-2xl border border-[#E9DDFE]" />
          ))}
        </div>

        <div className="h-64 bg-[#F3EDFF]/40 animate-pulse rounded-2xl border border-[#E9DDFE]" />
        <div className="h-48 bg-[#F3EDFF]/40 animate-pulse rounded-2xl border border-[#E9DDFE]" />
      </div>
    );
  }

  // Unexpected Error State with Retry
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717] flex items-center gap-2">
            <Briefcase size={26} className="text-[#A874F7]" />
            My Internship
          </h1>
        </div>

        <Card className="bg-rose-50 border border-rose-200 p-6 text-center shadow-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-semibold text-rose-900">{error}</h3>
            <Button
              onClick={loadInternshipData}
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

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      await internshipService.submitOfferLetter({
        studentId: user.id,
        companyName: formData.companyName,
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        stipend: formData.stipend,
      });

      toast.success('Internship Offer Letter submitted successfully for TPO & Faculty verification!');
      setIsModalOpen(false);
      await loadInternshipData();
    } catch {
      toast.error('Failed to submit offer letter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717] flex items-center gap-2">
            <Briefcase size={26} className="text-[#A874F7]" />
            My Internship
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor your assigned internship status, mentor details, and application history
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#A874F7] hover:bg-[#965be3] text-white text-xs gap-2 py-2.5 px-4 shadow-sm rounded-xl shrink-0"
        >
          <Briefcase size={15} />
          <span>+ Submit Internship / Offer Letter</span>
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <InternshipSummaryCards
        activeInternship={activeInternship}
        applications={applications}
      />

      {/* Active Internship Card with Timeline & EmptyState Actions */}
      <ActiveInternshipCard
        internship={activeInternship}
        onRefreshStatus={loadInternshipData}
        onBrowseCompanies={() => setIsModalOpen(true)}
      />

      {/* Mentor Details Card (ALWAYS DISPLAYED!) */}
      <MentorDetailsCard
        facultyMentor={activeInternship?.facultyMentor}
        companyMentor={activeInternship?.companyMentor}
      />

      {/* Submitted Applications Card (Table visible even when 0 records) */}
      <InternshipApplicationsCard applications={applications} />

      {/* Submit Offer Letter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-[#171717]">Submit Internship Offer Letter</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#A874F7] outline-none"
                  placeholder="e.g. TechCorp Solutions Pvt Ltd"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Internship Title / Role</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#A874F7] outline-none"
                  placeholder="e.g. Frontend React Developer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stipend / Package</label>
                  <input
                    type="text"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#A874F7] outline-none"
                    placeholder="e.g. ₹25,000/mo"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-[#A874F7] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Attach Offer Letter (PDF / Document)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="w-full p-2 border rounded-xl bg-gray-50 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F3EDFF] file:text-[#A874F7]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#A874F7] hover:bg-[#965be3] text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
