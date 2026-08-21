import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { supabase } from '../../supabase/client';
import { ROUTES } from '../../constants/routes';
import { Building2, Mail, Lock, User, Phone, Briefcase, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export const CompanyMentorRegisterPage = () => {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('company_id');
  const companyNameParam = searchParams.get('company_name');

  const [verifiedCompany, setVerifiedCompany] = useState(null);
  const [verifyingCompany, setVerifyingCompany] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    designation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isValidUuid = (str) =>
      typeof str === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

    async function validateInvitationLink() {
      if (!companyId || !isValidUuid(companyId)) {
        setError('Security Policy Violation: Invalid or missing host company invitation token.');
        setVerifiedCompany(null);
        setVerifyingCompany(false);
        return;
      }
      try {
        setVerifyingCompany(true);
        setError(null);
        const { data, error: fetchErr } = await supabase
          .from('companies')
          .select('id, company_name, status')
          .eq('id', companyId)
          .maybeSingle();

        if (data) {
          if (data.status === 'SUSPENDED') {
            setError('Registration Blocked: Host partner company account is currently suspended.');
            setVerifiedCompany(null);
          } else {
            setVerifiedCompany(data);
          }
        } else if (companyNameParam) {
          setVerifiedCompany({
            id: companyId,
            company_name: decodeURIComponent(companyNameParam),
          });
        } else {
          setError('Security Policy Violation: Invalid or expired host company invitation link.');
          setVerifiedCompany(null);
        }
      } catch (err) {
        console.error('Error validating company invitation link:', err);
        if (companyNameParam && isValidUuid(companyId)) {
          setVerifiedCompany({
            id: companyId,
            company_name: decodeURIComponent(companyNameParam),
          });
        } else {
          setError('Failed to verify host company invitation link.');
          setVerifiedCompany(null);
        }
      } finally {
        setVerifyingCompany(false);
      }
    }

    validateInvitationLink();
  }, [companyId, companyNameParam]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!companyId || !verifiedCompany?.id) {
      setError('Invalid registration request: Missing or unverified company invitation token.');
      return;
    }

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.designation.trim()) {
      setError('Full Name, Corporate Email, Password, and Designation are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.signUpCompanyMentor({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        companyId: verifiedCompany.id,
        designation: formData.designation,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          state: {
            message: 'Company Mentor registration complete! Please log in to access your company workspace.',
          },
        });
      }, 2000);
    } catch (err) {
      console.error('Company Mentor registration error:', err);
      setError(err.message || 'Registration failed. Contact system administrator.');
    } finally {
      setLoading(false);
    }
  };

  if (verifyingCompany) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
          Verifying host company invitation link...
        </div>
      </div>
    );
  }

  if (!companyId || !verifiedCompany) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#E1E7E2] shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-[#FEF2F2] text-[#DC2626] rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#18201B]">Invalid Host Company Invitation</h2>
          <p className="text-xs text-[#66706A]">
            {error || 'Company Mentor registration is Admin-controlled. The provided invitation link is invalid or host partner company does not exist.'}
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="inline-block px-4 py-2 bg-[#2F8F46] text-white text-xs font-bold rounded-xl hover:bg-[#1F6B32]"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-[#18201B]">
      <div className="bg-white max-w-lg w-full p-8 rounded-2xl border border-[#E1E7E2] shadow-sm my-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#1F6B32] text-white font-bold text-xl rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#18201B] tracking-tight">Company Mentor Registration</h1>
          <p className="text-xs text-[#66706A] mt-1">
            Admin-Authorized Onboarding for Verified Host Partner Organization
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF4EC] border border-[#C5E3CC] rounded-full text-xs font-bold text-[#1F6B32]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Host Company: {verifiedCompany.company_name}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-[#EAF4EC] border border-[#2F8F46] rounded-xl flex items-center gap-3 text-[#1F6B32] text-xs font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Company Mentor profile created successfully! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#18201B] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Vikram Mehta"
              className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">
                Corporate Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="v.mehta@techcorp.com"
                className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18201B] mb-1">
                Designation / Job Title *
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Technical Lead"
                className="w-full px-3.5 py-2.5 bg-[#F5FAF6] border border-[#E1E7E2] rounded-xl text-sm text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#1F6B32] hover:bg-[#18201B] text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Complete Company Mentor Registration</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#66706A]">
          Already registered?{' '}
          <Link to={ROUTES.LOGIN} className="text-[#2F8F46] font-bold hover:text-[#1F6B32]">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
