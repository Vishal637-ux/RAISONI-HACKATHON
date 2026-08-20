import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { evaluationService } from '../../services/evaluationService';
import { CompanyEvaluationModal } from '../../components/company/CompanyEvaluationModal';
import { EvaluationSummaryCard } from '../../components/shared/EvaluationSummaryCard';
import { Award, RefreshCw, AlertCircle, Users, CheckCircle2, Clock } from 'lucide-react';

export const CompanyEvaluationPage = () => {
  const { user } = useAuth();
  const [internList, setInternList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

                    <div>
                      {isEvaluated ? (
                        <div className="px-3.5 py-1.5 rounded-full border border-[#C5E3CC] bg-[#EAF4EC] text-xs font-bold text-[#1F6B32] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Company Evaluation Submitted & Locked</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenEvaluation(internship)}
                          className="px-4 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                          Submit Company Evaluation
                        </button>
                      )}
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
      </div>
    </PortalLayout>
  );
};
