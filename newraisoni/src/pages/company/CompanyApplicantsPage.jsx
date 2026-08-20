import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { ApplicantReviewTable } from '../../components/company/ApplicantReviewTable';
import { Users, Building2, RefreshCw, AlertCircle } from 'lucide-react';

export const CompanyApplicantsPage = () => {
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');

      const comp = await companyService.getMyCompany(user.id);
      if (!comp) {
        setErrorMsg('No company profile found for your mentor account.');
        setLoading(false);
        return;
      }
      setCompany(comp);

      const list = await companyService.getCompanyApplicants(comp.id);
      setApplicants(list);
    } catch (err) {
      console.error('Error loading company applicants:', err);
      setErrorMsg(err.message || 'Failed to load applicant list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const stats = {
    total: applicants.length,
    applied: applicants.filter((a) => a.status === 'Applied').length,
    shortlisted: applicants.filter((a) => a.status === 'Shortlisted').length,
    selected: applicants.filter((a) => a.status === 'Selected').length,
  };

  return (
    <PortalLayout title="Review Applicants" roleLabel="Company Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1F6B32] mb-1">
              <Building2 className="w-4 h-4" />
              <span>{company ? company.company_name : 'Company Mentor Portal'}</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Candidate Applications</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Review student applications for your postings, shortlist candidates, and issue offer letters.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh applicants list"
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
            <span className="text-xs font-semibold text-[#66706A]">Applied / New</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.applied}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#2563EB]">Shortlisted</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.shortlisted}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#2F8F46]">Selected / Offers</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.selected}</p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Applicants Table */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
            Loading candidate applications for {company?.company_name || 'your company'}...
          </div>
        ) : (
          <ApplicantReviewTable applicants={applicants} onStatusUpdate={loadData} />
        )}
      </div>
    </PortalLayout>
  );
};
