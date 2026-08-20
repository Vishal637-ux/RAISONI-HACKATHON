import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { internshipService } from '../../services/internshipService';
import { ROUTES } from '../../constants/routes';
import { Briefcase, Building2, Calendar, MapPin, DollarSign, Award, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export const PostingCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '3 Months',
    mode: 'On-site',
    stipend: '15000/month',
    vacancies: 2,
    work_location: 'Nagpur Office',
    min_cgpa: 6.0,
    eligible_departments: 'Computer Science, Information Technology, Electronics',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    async function loadCompany() {
      if (!user?.id) return;
      try {
        setLoadingCompany(true);
        const comp = await companyService.getMyCompany(user.id);
        if (!comp) {
          setErrorMsg('No company profile found for your mentor account. Please contact system admin.');
        } else {
          setCompany(comp);
        }
      } catch (err) {
        setErrorMsg('Failed to load company mentor information.');
      } finally {
        setLoadingCompany(false);
      }
    }
    loadCompany();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company?.id) {
      setErrorMsg('Cannot create posting: Company mentor company_id is missing.');
      return;
    }

    if (company.status === 'SUSPENDED') {
      setErrorMsg('Company partner account is currently suspended by College Administration. New posting creation is disabled.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMsg('Posting Title and Description are required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const newPosting = await internshipService.createPosting(company.id, formData);
      setSuccessMsg(`Internship "${newPosting.title}" successfully created and posted!`);

      setTimeout(() => {
        navigate(ROUTES.COMPANY_POSTINGS);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create internship posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Post New Internship" roleLabel="Company Mentor">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.COMPANY_POSTINGS)}
            className="flex items-center gap-2 text-xs font-semibold text-[#66706A] hover:text-[#1F6B32] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Postings
          </button>

          {company && (
            <div className="flex items-center gap-2 bg-[#EAF4EC] text-[#1F6B32] px-3 py-1 rounded-full text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>{company.company_name}</span>
            </div>
          )}
        </div>

        {/* Loading / Error Banners */}
        {loadingCompany && (
          <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
            Loading company mentor verification...
          </div>
        )}

        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#EAF4EC] border border-[#C5E3CC] text-[#1F6B32] p-4 rounded-xl text-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#2F8F46]" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {!loadingCompany && company && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E1E7E2] p-6 shadow-xs space-y-6">
            <div className="border-b border-[#F0F4F1] pb-4">
              <h2 className="text-lg font-bold text-[#18201B]">Create Internship Listing</h2>
              <p className="text-xs text-[#66706A] mt-1">
                Define opportunity details, duration, stipend, work location, and student eligibility criteria.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Title & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#18201B] mb-1.5">
                    Internship Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer Intern"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46] focus:ring-1 focus:ring-[#2F8F46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18201B] mb-1.5">Mode</label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#18201B] mb-1.5">
                  Job Description & Key Responsibilities <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed description of roles, technologies, learning objectives..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46] focus:ring-1 focus:ring-[#2F8F46]"
                />
              </div>

              {/* Stipend, Duration, Vacancies */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#18201B] mb-1.5">Stipend Amount</label>
                  <input
                    type="text"
                    name="stipend"
                    value={formData.stipend}
                    onChange={handleChange}
                    placeholder="e.g. 15000/month or Unpaid"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18201B] mb-1.5">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 3 Months or 6 Months"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18201B] mb-1.5">Vacancies</label>
                  <input
                    type="number"
                    name="vacancies"
                    min="1"
                    value={formData.vacancies}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>
              </div>

              {/* Work Location & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#18201B] mb-1.5">Work Location</label>
                  <input
                    type="text"
                    name="work_location"
                    value={formData.work_location}
                    onChange={handleChange}
                    placeholder="e.g. Nagpur Office / Remote"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#18201B] mb-1.5">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
                  />
                </div>
              </div>

              {/* Eligibility Criteria Section */}
              <div className="pt-4 border-t border-[#F0F4F1]">
                <h3 className="text-sm font-bold text-[#18201B] mb-3">Academic Eligibility Criteria</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#18201B] mb-1.5">Minimum CGPA Required</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.0"
                      max="10.0"
                      name="min_cgpa"
                      value={formData.min_cgpa}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#18201B] mb-1.5">Eligible Departments</label>
                    <select
                      name="eligible_departments"
                      value={formData.eligible_departments}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E1E7E2] text-sm text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
                    >
                      <option value="Computer Science, Information Technology, Electronics">Computer Science, IT & Electronics</option>
                      <option value="All Departments">All Academic Departments</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                      <option value="Computer Science, Information Technology">Computer Science & IT</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F4F1]">
              <button
                type="button"
                onClick={() => navigate(ROUTES.COMPANY_POSTINGS)}
                className="px-4 py-2.5 rounded-lg border border-[#E1E7E2] text-xs font-semibold text-[#66706A] hover:bg-[#F8FAF9]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold transition-all shadow-xs"
              >
                {submitting ? 'Creating Posting...' : 'Publish Internship Posting'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PortalLayout>
  );
};
