import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { internshipService } from '../../services/internshipService';
import { ApplicationTrackerTable } from '../../components/student/ApplicationTrackerTable';
import { FileText, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const StudentApplicationsPage = () => {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadApplications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await internshipService.getMyApplications(user.id);
      setApplications(data);
    } catch (err) {
      console.error('Error fetching student applications:', err);
      setErrorMsg(err.message || 'Failed to load your submitted applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user]);

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'Applied').length,
    shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
    selected: applications.filter((a) => a.status === 'Selected').length,
  };

  return (
    <PortalLayout title="My Applications" roleLabel="Student">
      <div className="space-y-6">
        {/* Header & Metrics */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#18201B]">My Internship Applications</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Track real-time status and recruitment lifecycle progress of your submitted applications.
            </p>
          </div>

          <button
            onClick={loadApplications}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh applications"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#66706A]">Total Applications</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.total}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#2563EB]">Under Review</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.applied}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#D97706]">Shortlisted</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.shortlisted}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#2F8F46]">Selected / Offers</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.selected}</p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
            Loading your applications...
          </div>
        ) : (
          <ApplicationTrackerTable applications={applications} />
        )}
      </div>
    </PortalLayout>
  );
};
