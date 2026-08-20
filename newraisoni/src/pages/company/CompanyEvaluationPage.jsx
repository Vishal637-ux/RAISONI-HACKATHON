import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { evaluationService } from '../../services/evaluationService';
import { ppoService } from '../../services/ppoService';
import { CompanyEvaluationModal } from '../../components/company/CompanyEvaluationModal';
import { EvaluationSummaryCard } from '../../components/shared/EvaluationSummaryCard';
import { Award, RefreshCw, AlertCircle, Users, CheckCircle2, Clock, X, Briefcase, DollarSign } from 'lucide-react';

export const CompanyEvaluationPage = () => {
  const { user } = useAuth();
  const [internList, setInternList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // PPO Modal State
  const [isPPOModalOpen, setIsPPOModalOpen] = useState(false);
  const [ppoTarget, setPPOTarget] = useState(null);
  const [ppoDesignation, setPPODesignation] = useState('Backend Engineer (SDE-1)');
  const [ppoCTC, setPPOCTC] = useState('8.5');
  const [savingPPO, setSavingPPO] = useState(false);
  const [ppoFeedback, setPPOFeedback] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await evaluationService.getCompanyInternsForEvaluation(user.id);
      setInternList(data || []);
    } catch (err) {
      console.error('Error loading company evaluation data:', err);
      setErrorMsg(err.message || 'Failed to load intern evaluations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenEvaluation = (internship) => {
    setSelectedIntern(internship);
    setIsModalOpen(true);
  };

  const handleOpenPPO = (internship) => {
    setPPOTarget(internship);
    setPPOFeedback('');
    setIsPPOModalOpen(true);
  };

  const handleGrantPPO = async (e) => {
    e.preventDefault();
    if (!ppoTarget || !ppoDesignation.trim() || !ppoCTC) {
      setPPOFeedback('Please enter designation and CTC.');
      return;
    }

    try {
      setSavingPPO(true);
      setPPOFeedback('');

      await ppoService.recordPPO({
        internshipId: ppoTarget.id,
        studentId: ppoTarget.student_id,
        companyId: ppoTarget.company_id,
        status: 'Offered',
        designation: ppoDesignation.trim(),
        ctc: ppoCTC,
      });

      setPPOFeedback('🎉 PPO Record saved successfully! Student notified.');
      setTimeout(() => {
        setIsPPOModalOpen(false);
        loadData();
      }, 1500);
    } catch (err) {
      console.error('Error granting PPO:', err);
      setPPOFeedback(err.message || 'Failed to record PPO.');
    } finally {
      setSavingPPO(false);
    }
  };

  return (
    <PortalLayout title="Company Intern Evaluations" roleLabel="Company Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <Award className="w-4 h-4" />
              <span>Industry Performance Evaluation</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Evaluate Company Interns</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Provide independent technical skill ratings, conduct evaluation, and performance feedback for active company interns.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh intern evaluations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            Loading company intern evaluation records...
          </div>
        ) : internList.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">No Active Interns Found</h3>
            <p className="text-xs text-[#66706A]">
              Company intern evaluations will appear here once candidates commence active internships.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {internList.map((item, idx) => {
              const internship = item.internship;
              const studentName = internship?.users?.full_name || 'Company Intern Candidate';
              const isEvaluated = Boolean(item.companyEvaluation);

              return (
                <div key={internship.id || idx} className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <h3 className="text-base font-bold text-[#18201B]">{studentName}</h3>
                      <p className="text-xs text-[#66706A]">
                        Internship: {internship?.internship_title} | Status: <span className="font-semibold text-[#1F6B32]">{internship?.status}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {isEvaluated ? (
                        <div className="px-3.5 py-1.5 rounded-full border border-[#C5E3CC] bg-[#EAF4EC] text-xs font-bold text-[#1F6B32] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Company Evaluation Submitted & Locked</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenEvaluation(internship)}
                          className="px-4 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Submit Company Evaluation
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenPPO(internship)}
                        className="px-4 py-2 bg-[#18201B] hover:bg-[#2F8F46] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-[#4ADE80]" />
                        <span>🎉 Grant PPO</span>
                      </button>
                    </div>
                  </div>

                  {/* Dual Evaluation Summary Card */}
                  <EvaluationSummaryCard
                    companyEval={item.companyEvaluation}
                    facultyEval={item.facultyEvaluation}
                    dualAverage={item.dualAverage}
                    title={`Evaluation Record: ${studentName}`}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Evaluation Modal */}
        <CompanyEvaluationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          internship={selectedIntern}
          companyUserId={user?.id}
          onSuccess={loadData}
        />

        {/* Grant PPO Modal */}
        {isPPOModalOpen && ppoTarget && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E1E7E2] space-y-5">
              <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#EAF4EC] rounded-lg text-[#1F6B32]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#18201B]">Grant Pre-Placement Offer (PPO)</h3>
                    <p className="text-xs text-[#66706A]">Offer full-time role to {ppoTarget.users?.full_name || 'Student'}</p>
                  </div>
                </div>
                <button onClick={() => setIsPPOModalOpen(false)} className="text-[#66706A] hover:text-[#18201B]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {ppoFeedback && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  ppoFeedback.includes('successfully') ? 'bg-[#EAF4EC] border border-[#C5E3CC] text-[#1F6B32]' : 'bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B]'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ppoFeedback}</span>
                </div>
              )}

              <form onSubmit={handleGrantPPO} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#18201B] mb-1">Offered Job Designation</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[#66706A] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={ppoDesignation}
                      onChange={(e) => setPPODesignation(e.target.value)}
                      placeholder="e.g. Backend Engineer (SDE-1)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E1E7E2] bg-[#F8FAF9] focus:bg-white text-xs font-bold text-[#18201B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#18201B] mb-1">Annual Compensation (CTC in LPA)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#66706A] absolute left-3 top-3" />
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={ppoCTC}
                      onChange={(e) => setPPOCTC(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E1E7E2] bg-[#F8FAF9] focus:bg-white text-xs font-bold text-[#18201B]"
                    />
                  </div>
                  <span className="text-[10px] text-[#66706A] mt-1 block">Enter numerical CTC value in Lakhs Per Annum (e.g. 8.5 LPA)</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPPOModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPPO}
                    className="px-5 py-2 rounded-xl bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    {savingPPO ? 'Recording PPO...' : '🎉 Grant PPO Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

