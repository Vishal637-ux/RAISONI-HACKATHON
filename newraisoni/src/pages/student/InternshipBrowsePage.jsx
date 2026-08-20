import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { internshipService } from '../../services/internshipService';
import { InternshipPostingCard } from '../../components/company/InternshipPostingCard';
import { Search, Briefcase, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export const InternshipBrowsePage = () => {
  const { user } = useAuth();

  const [studentProfile, setStudentProfile] = useState(null);
  const [postings, setPostings] = useState([]);
  const [appliedPostingIds, setAppliedPostingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [applyingPostingId, setApplyingPostingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Fetch student profile
      const prof = await profileService.getStudentProfile(user.id);
      setStudentProfile(prof);

      // 2. Fetch open postings
      const openPostings = await internshipService.getOpenPostings();
      setPostings(openPostings);

      // 3. Fetch student applications
      const apps = await internshipService.getMyApplications(user.id);
      const appliedIds = new Set(apps.map((a) => a.posting_id));
      setAppliedPostingIds(appliedIds);
    } catch (err) {
      console.error('Error loading internship feed:', err);
      setErrorMsg(err.message || 'Failed to load internship opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleApply = async (postingId) => {
    if (!user?.id || !postingId) return;

    try {
      setApplyingPostingId(postingId);
      setErrorMsg('');
      setSuccessMsg('');

      await internshipService.applyForInternship(user.id, postingId);
      
      setAppliedPostingIds((prev) => new Set([...prev, postingId]));
      setSuccessMsg('Application submitted successfully!');

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit application.');
    } finally {
      setApplyingPostingId(null);
    }
  };

  // Filter postings by search term
  const filteredPostings = postings.filter((p) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(term);
    const companyMatch = p.companies?.company_name?.toLowerCase().includes(term);
    const modeMatch = p.mode?.toLowerCase().includes(term);
    return titleMatch || companyMatch || modeMatch;
  });

  return (
    <PortalLayout title="Browse Internships" roleLabel="Student">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#18201B]">Available Internship Opportunities</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Explore open internship listings tailored to your academic profile and eligibility criteria.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={loadData}
              className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
              title="Refresh listings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#66706A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E1E7E2] text-xs text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#EAF4EC] border border-[#C5E3CC] text-[#1F6B32] p-4 rounded-xl text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-[#2F8F46]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content Feed */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
            Evaluating academic eligibility & loading internship opportunities...
          </div>
        ) : filteredPostings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">No Open Internship Postings</h3>
            <p className="text-xs text-[#66706A]">
              {searchTerm ? 'No postings match your search term.' : 'There are currently no active internship postings available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPostings.map((posting) => {
              // Construct criteria object for Phase 2 evaluateEligibility()
              const criteria = {
                minCgpa: posting.min_cgpa,
                allowedDepartments: posting.eligible_departments,
              };

              const evalResult = profileService.evaluateEligibility(studentProfile, criteria);
              const hasApplied = appliedPostingIds.has(posting.id);

              return (
                <InternshipPostingCard
                  key={posting.id}
                  posting={posting}
                  isCompanyView={false}
                  isEligible={evalResult.isEligible}
                  eligibilityReasons={evalResult.reasons}
                  hasApplied={hasApplied}
                  onApply={handleApply}
                  applying={applyingPostingId === posting.id}
                />
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
