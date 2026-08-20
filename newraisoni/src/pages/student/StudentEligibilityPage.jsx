import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { EligibilityCard } from '../../components/student/EligibilityCard';
import { ShieldCheck, Sliders, RefreshCw, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentEligibilityPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  // Custom Criteria Simulator (for testing & verification against different posting thresholds)
  const [criteria, setCriteria] = useState({
    min_cgpa: 6.50,
    allowed_years: [3, 4],
    require_resume: true,
  });

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
  }, [user?.id, criteria.min_cgpa, criteria.allowed_years]);

  const handleCgpaCriteriaChange = (val) => {
    setCriteria((prev) => ({ ...prev, min_cgpa: parseFloat(val) || 0 }));
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Eligibility Card & Breakdown */}
          <div className="lg:col-span-2 space-y-6">
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

          {/* Right Column: Posting Criteria Simulator */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E1E7E2]">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2F8F46]" />
                  <h3 className="text-sm font-bold text-[#18201B]">Drive Requirement Simulator</h3>
                </div>
                <button
                  onClick={loadEligibility}
                  className="p-1.5 text-[#66706A] hover:text-[#2F8F46] rounded-lg hover:bg-[#F5FAF6] transition-colors"
                  title="Re-run Engine Evaluation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* CGPA Threshold Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#18201B]">Minimum CGPA Required</span>
                  <span className="font-extrabold text-[#2F8F46] bg-[#EAF4EC] px-2 py-0.5 rounded">
                    {criteria.min_cgpa.toFixed(2)} CGPA
                  </span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="9.5"
                  step="0.1"
                  value={criteria.min_cgpa}
                  onChange={(e) => handleCgpaCriteriaChange(e.target.value)}
                  className="w-full accent-[#2F8F46]"
                />
              </div>

              {/* Student Summary */}
              <div className="p-3.5 bg-[#F8FAF9] border border-[#E1E7E2] rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between text-[#66706A]">
                  <span>Enrolled Department:</span>
                  <span className="font-bold text-[#18201B]">
                    {studentProfile?.department_name || studentProfile?.branch || 'CSE'}
                  </span>
                </div>
                <div className="flex justify-between text-[#66706A]">
                  <span>Current CGPA:</span>
                  <span className="font-bold text-[#18201B]">
                    {studentProfile?.cgpa !== null && studentProfile?.cgpa !== undefined
                      ? Number(studentProfile.cgpa).toFixed(2)
                      : 'Not Entered'}
                  </span>
                </div>
                <div className="flex justify-between text-[#66706A]">
                  <span>Academic Year:</span>
                  <span className="font-bold text-[#18201B]">Year {studentProfile?.year || 3}</span>
                </div>
                <div className="flex justify-between text-[#66706A]">
                  <span>Resume Attached:</span>
                  <span
                    className={`font-bold ${
                      studentProfile?.resume_url ? 'text-[#2F8F46]' : 'text-red-600'
                    }`}
                  >
                    {studentProfile?.resume_url ? 'Yes (PDF)' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};
