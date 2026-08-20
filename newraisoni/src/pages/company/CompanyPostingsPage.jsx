import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { internshipService } from '../../services/internshipService';
import { InternshipPostingCard } from '../../components/company/InternshipPostingCard';
import { ROUTES } from '../../constants/routes';
import { PlusCircle, Building2, Briefcase, RefreshCw, AlertCircle } from 'lucide-react';

export const CompanyPostingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [postings, setPostings] = useState([]);
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

      const list = await internshipService.getMyPostings(comp.id);
      setPostings(list);
    } catch (err) {
      console.error('Error loading company postings:', err);
      setErrorMsg(err.message || 'Failed to load internship postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleStatus = async (posting) => {
    const newStatus = posting.status === 'Open' ? 'Closed' : 'Open';
    try {
      await internshipService.updatePostingStatus(posting.id, newStatus);
      setPostings((prev) =>
        prev.map((item) => (item.id === posting.id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <PortalLayout title="Company Internship Postings" roleLabel="Company Mentor">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1F6B32] mb-1">
              <Building2 className="w-4 h-4" />
              <span>{company ? company.company_name : 'Company Mentor Portal'}</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Manage Internship Postings</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Create, view, and manage internship opportunities for your company.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
              title="Refresh postings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to={ROUTES.COMPANY_POSTING_CREATE}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Internship</span>
            </Link>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
            Loading your company's internship listings...
          </div>
        ) : postings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18201B]">No Internship Postings Found</h3>
              <p className="text-xs text-[#66706A] mt-1">
                You haven't posted any internship opportunities for {company?.company_name || 'your company'} yet.
              </p>
            </div>
            <Link
              to={ROUTES.COMPANY_POSTING_CREATE}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2F8F46] text-white text-xs font-bold hover:bg-[#1F6B32]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Posting</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postings.map((posting) => (
              <InternshipPostingCard
                key={posting.id}
                posting={posting}
                isCompanyView={true}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
