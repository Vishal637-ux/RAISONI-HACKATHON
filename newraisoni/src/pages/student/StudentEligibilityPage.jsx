import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { EligibilityCard } from '../../components/student/EligibilityCard';
import { ShieldCheck, RefreshCw, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentEligibilityPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const criteria = {
    min_cgpa: 6.50,
    allowed_years: [3, 4],
    require_resume: true,
  };

  const loadEligibility = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const prof = await profileService.getStudentProfile(user.id);
      setStudentProfile(prof);
      if (prof) {
        const evalResult = profileService.evaluateEligibility(prof, criteria);
        setEvaluation(evalResult);
      }
    } catch (err) {
      console.error('Error evaluating eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEligibility();
  }, [user?.id]);

  return (
    <PortalLayout title="Academic Eligibility Engine" roleLabel="Student">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#18201B]">Institutional Academic Eligibility Engine</h2>
          <p className="text-sm text-[#66706A] mt-1">
            Real-time rule evaluation checking your CGPA, Department, Academic Year, and Resume PDF against drive criteria.
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] flex items-center justify-center text-[#2F8F46]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <EligibilityCard evaluation={evaluation} />

          {!evaluation?.isEligible && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Action Required for Eligibility</h4>
                <p className="text-xs text-amber-800 mt-1">
                  To qualify for placement drives, update missing credentials or upload your verified PDF resume document in your profile.
                </p>
                <Link
                  to="/student/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F8F46] hover:underline mt-2"
                >
                  <span>Update Student Profile Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
};
