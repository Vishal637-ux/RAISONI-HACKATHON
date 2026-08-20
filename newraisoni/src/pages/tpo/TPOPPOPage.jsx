import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { completionService } from '../../services/completionService';
import { ppoService } from '../../services/ppoService';
import { PPOTrackerTable } from '../../components/tpo/PPOTrackerTable';
import { CompletionApprovalModal } from '../../components/tpo/CompletionApprovalModal';
import { Award, RefreshCw, AlertCircle, CheckCircle2, FileCheck, Plus, Building2 } from 'lucide-react';

export const TPOPPOPage = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [ppoRecords, setPpoRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedQueueItem, setSelectedQueueItem] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // New PPO Form State
  const [ppoForm, setPpoForm] = useState({
    internshipId: '',
    studentId: '',
    companyId: '',
    status: 'Offered',
    designation: '',
    ctc: '',
  });
  const [savingPPO, setSavingPPO] = useState(false);
  const [ppoMsg, setPpoMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const q = await completionService.getTPOCompletionQueue();
      const ppos = await ppoService.getAllPPORecords();
      setQueue(q || []);
      setPpoRecords(ppos || []);
    } catch (err) {
      console.error('Error loading TPO completion data:', err);
      setErrorMsg(err.message || 'Failed to load completion & PPO records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenApproval = (item) => {
    setSelectedQueueItem(item);
    setIsApprovalModalOpen(true);
  };

  const handlePPOSubmit = async (e) => {
    e.preventDefault();
    setPpoMsg('');

    if (!ppoForm.internshipId || !ppoForm.designation.trim() || !ppoForm.ctc) {
      setPpoMsg('Please select a completed internship, enter designation, and CTC.');
      return;
    }

    const selectedItem = queue.find((q) => q.internship.id === ppoForm.internshipId);
    if (!selectedItem) {
      setPpoMsg('Invalid internship selected.');
      return;
    }

    try {
      setSavingPPO(true);
      await ppoService.recordPPO({
        internshipId: selectedItem.internship.id,
        studentId: selectedItem.internship.student_id,
        companyId: selectedItem.internship.company_id,
        status: ppoForm.status,
        designation: ppoForm.designation.trim(),
        ctc: ppoForm.ctc,
      });

      setPpoMsg('PPO record saved successfully!');
      setPpoForm({ internshipId: '', studentId: '', companyId: '', status: 'Offered', designation: '', ctc: '' });
      loadData();
    } catch (err) {
      console.error('Error saving PPO:', err);
      setPpoMsg(err.message || 'Failed to save PPO record.');
    } finally {
      setSavingPPO(false);
    }
  };

  return (
    <PortalLayout title="Completion Approval & PPO Records" roleLabel="Training & Placement Officer">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <Award className="w-4 h-4" />
              <span>Institutional Sign-Off & Placement Oversight</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Completion Approval & PPO Management</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Approve eligible completed internships, generate digital QR certificates, and manage Pre-Placement Offer (PPO) outcomes.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh completion records"
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
            Loading completion sign-off queue and PPO placement records...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Completion Sign-Off Queue Section */}
            <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#18201B]">
                  <FileCheck className="w-4 h-4 text-[#2F8F46]" />
                  <span>Internship Completion Sign-Off Queue</span>
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#66706A]">
                  No active internships found in queue for completion approval.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E1E7E2] text-[#66706A] uppercase font-bold text-[10px] tracking-wider bg-[#F8FAF9]">
                        <th className="py-3 px-4">Candidate Student</th>
                        <th className="py-3 px-4">Host Company</th>
                        <th className="py-3 px-4">Internship Position</th>
                        <th className="py-3 px-4">Dual Evaluation Status</th>
                        <th className="py-3 px-4">Current Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E7E2]">
                      {queue.map((item, idx) => {
                        const int = item.internship;
                        const isCompleted = int.status === 'COMPLETED';
                        const isEligible = item.eligibility?.isEligible;
                        const hasApprovedEvaluations = item.eligibility?.hasApprovedEvaluations || isEligible;

                        return (
                          <tr key={int.id || idx} className="hover:bg-[#F8FAF9] transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[#18201B]">
                              {int.users?.full_name || 'Candidate Student'}
                            </td>
                            <td className="py-3.5 px-4 text-[#66706A] font-semibold">
                              {int.companies?.company_name || 'Host Company'}
                            </td>
                            <td className="py-3.5 px-4 text-[#18201B]">
                              {int.internship_title}
                            </td>
                            <td className="py-3.5 px-4">
                              {hasApprovedEvaluations ? (
                                <span className="px-2.5 py-1 rounded-full border border-[#C5E3CC] bg-[#EAF4EC] text-[11px] font-bold text-[#1F6B32]">
                                  Dual APPROVED
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full border border-[#FDE68A] bg-[#FEF3C7] text-[11px] font-bold text-[#D97706]">
                                  Pending Evaluations
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-[#18201B]">
                              {int.status}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isCompleted ? (
                                <span className="px-3 py-1.5 rounded-full border border-[#C5E3CC] bg-[#EAF4EC] text-xs font-bold text-[#1F6B32]">
                                  Completed & Certified
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleOpenApproval(item)}
                                  disabled={!isEligible}
                                  className="px-3.5 py-1.5 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                                >
                                  Review Sign-Off
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Record New PPO Section */}
            <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-[#18201B] border-b border-[#E1E7E2] pb-3">
                <Plus className="w-4 h-4 text-[#2F8F46]" />
                <span>Record Pre-Placement Offer (PPO)</span>
              </div>

              {ppoMsg && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${ppoMsg.includes('successfully') ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]' : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]'}`}>
                  {ppoMsg}
                </div>
              )}

              <form onSubmit={handlePPOSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Select Internship */}
                <div className="space-y-1">
                  <label className="block font-bold text-[#18201B]">
                    Select Internship Candidate <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ppoForm.internshipId}
                    onChange={(e) => setPpoForm({ ...ppoForm, internshipId: e.target.value })}
                    className="w-full p-2.5 border border-[#E1E7E2] rounded-xl bg-white font-semibold focus:ring-1 focus:ring-[#2F8F46] focus:outline-hidden"
                  >
                    <option value="">-- Choose Candidate --</option>
                    {queue.map((q) => (
                      <option key={q.internship.id} value={q.internship.id}>
                        {q.internship.users?.full_name} ({q.internship.companies?.company_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div className="space-y-1">
                  <label className="block font-bold text-[#18201B]">
                    Offered Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Software Engineer"
                    value={ppoForm.designation}
                    onChange={(e) => setPpoForm({ ...ppoForm, designation: e.target.value })}
                    className="w-full p-2.5 border border-[#E1E7E2] rounded-xl focus:ring-1 focus:ring-[#2F8F46] focus:outline-hidden"
                  />
                </div>

                {/* Package CTC */}
                <div className="space-y-1">
                  <label className="block font-bold text-[#18201B]">
                    Package CTC in LPA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    placeholder="e.g. 8.50"
                    value={ppoForm.ctc}
                    onChange={(e) => setPpoForm({ ...ppoForm, ctc: e.target.value })}
                    className="w-full p-2.5 border border-[#E1E7E2] rounded-xl focus:ring-1 focus:ring-[#2F8F46] focus:outline-hidden"
                  />
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="block font-bold text-[#18201B]">PPO Offer Status</label>
                  <select
                    value={ppoForm.status}
                    onChange={(e) => setPpoForm({ ...ppoForm, status: e.target.value })}
                    className="w-full p-2.5 border border-[#E1E7E2] rounded-xl bg-white font-semibold focus:ring-1 focus:ring-[#2F8F46] focus:outline-hidden"
                  >
                    <option value="Offered">Offered</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Submit Action */}
                <div className="md:col-span-2 flex items-end justify-end">
                  <button
                    type="submit"
                    disabled={savingPPO}
                    className="px-5 py-2.5 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {savingPPO ? 'Recording PPO...' : 'Record / Update PPO Placement'}
                  </button>
                </div>
              </form>
            </div>

            {/* PPO Placement Table */}
            <PPOTrackerTable
              records={ppoRecords}
              onRefresh={loadData}
            />
          </div>
        )}

        {/* Completion Approval Modal */}
        <CompletionApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          queueItem={selectedQueueItem}
          tpoUserId={user?.id}
          onSuccess={loadData}
        />
      </div>
    </PortalLayout>
  );
};
