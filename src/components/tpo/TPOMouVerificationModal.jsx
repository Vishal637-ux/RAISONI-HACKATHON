import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  X,
  FileCheck2,
  Building2,
  User,
  ShieldCheck,
  Calendar,
  Clock,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  CheckSquare,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Award,
  Layers,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TPOMouVerificationModal = ({ isOpen, onClose, mou, onVerifyDecision }) => {
  const [tpoRemarks, setTpoRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Requirement #7: Mandatory 7-Point Legal Compliance Checklist State
  const [checklist, setChecklist] = useState({
    signaturesVerified: false,
    sealVerified: false,
    validityConfirmed: false,
    scopeReviewed: false,
    ipClauseVerified: false,
    ndaClauseVerified: false,
    legalComplianceConfirmed: false,
  });

  useEffect(() => {
    if (mou) {
      setTpoRemarks('');
      setZoomLevel(100);
      setChecklist({
        signaturesVerified: mou.isVerified || false,
        sealVerified: mou.isVerified || false,
        validityConfirmed: mou.isVerified || false,
        scopeReviewed: mou.isVerified || false,
        ipClauseVerified: mou.isVerified || false,
        ndaClauseVerified: mou.isVerified || false,
        legalComplianceConfirmed: mou.isVerified || false,
      });
    }
  }, [mou]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mou) return null;

  const isVerified = mou.isVerified || mou.status === 'Verified MoU';
  const isChecklistComplete = Object.values(checklist).every(Boolean);

  const toggleChecklistItem = (key) => {
    if (isVerified) return;
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = async () => {
    if (!isChecklistComplete && !isVerified) {
      toast.error('Please complete all 7 mandatory legal compliance checklist items before approving');
      return;
    }
    setIsSubmitting(true);
    try {
      await onVerifyDecision(mou.id, { decision: 'Approved', remarks: tpoRemarks });
      toast.success(`Institutional Notification: MoU for '${mou.companyName}' Verified & Approved`);
      onClose();
    } catch {
      toast.error('Failed to verify MoU agreement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRenewal = async () => {
    setIsSubmitting(true);
    try {
      await onVerifyDecision(mou.id, { decision: 'Renewal Requested', remarks: tpoRemarks });
      toast.success(`Renewal Notification Sent to HR of '${mou.companyName}'`);
      onClose();
    } catch {
      toast.error('Failed to send renewal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Requirement #8: MoU Lifecycle Timeline
  const mouLifecycleTimeline = mou.timeline || [
    { stage: 'Company Registered', date: '15 Jun 2025', status: 'Completed' },
    { stage: 'MoU Submitted', date: '15 Jun 2025', status: 'Completed' },
    { stage: 'Legal Review', date: '16 Jun 2025', status: 'Completed' },
    { stage: 'Verified', date: isVerified ? '18 Jun 2025' : 'Pending', status: isVerified ? 'Completed' : 'Pending' },
    { stage: 'Active', date: isVerified ? '18 Jun 2025' : 'Pending', status: isVerified ? 'Completed' : 'Pending' },
    { stage: 'Renewal Due', date: '15 Jun 2028', status: 'Pending' },
    { stage: 'Expired', date: '16 Jun 2028', status: 'Pending' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tpo-mou-modal-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-4xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200 my-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-extrabold text-xl">
              <FileCheck2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="tpo-mou-modal-title" className="text-base font-bold text-[#171717]">
                  {isVerified ? 'Verified Institutional MoU Agreement' : 'Verify Institutional MoU & Legal Agreement'}
                </h3>
                {isVerified && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={10} />
                    Decision Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Company: <strong className="text-[#171717]">{mou.companyName}</strong> • MoU No: <strong className="text-[#A874F7]">{mou.mouNumber || 'MOU-2025-089'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Requirement #3 & #11: Compliance Score & Renewal Countdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Requirement #11: Compliance Score */}
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#171717]">Legal Compliance Score</span>
              <span className="font-black text-emerald-700 text-sm">{mou.complianceScore || 98} / 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mou.complianceScore || 98}%` }} />
            </div>
            <p className="text-[10px] text-emerald-700 font-bold">
              ✓ Excellent Institutional Compliance Rating
            </p>
          </div>

          {/* Requirement #9: Renewal Countdown */}
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white space-y-1">
            <span className="font-bold text-[#171717] block">Remaining Validity & Countdown</span>
            <p className="text-[11px] text-[#6B7280]">Expiry Date: <strong className="text-[#171717]">{mou.expiryDate}</strong></p>
            <span className={`inline-block font-extrabold px-2 py-0.5 rounded border text-[10px] ${
              mou.renewalStatus === 'Needs Renewal' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {mou.remainingValidity || '730 Days Remaining'}
            </span>
          </div>

          {/* Agreement Scope */}
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white space-y-1">
            <span className="font-bold text-[#171717] block">Internship & Dept Scope</span>
            <div className="text-[11px] text-[#6B7280] space-y-0.5">
              <p>Intern Capacity: <strong className="text-[#171717]">{mou.internshipCapacity || 50} Students</strong></p>
              <p>Depts Covered: <strong className="text-[#171717]">{mou.departmentsCovered || 'Computer, IT'}</strong></p>
            </div>
          </div>
        </div>

        {/* Company & Agreement Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2">
            <span className="font-bold text-[#171717] flex items-center gap-1.5">
              <Building2 size={15} className="text-[#A874F7]" />
              <span>Corporate Partner Profile</span>
            </span>
            <div className="space-y-1 text-[11px] text-[#6B7280]">
              <p>Company Name: <strong className="text-[#171717]">{mou.companyName}</strong></p>
              <p>Industry Sector: <strong className="text-[#171717]">{mou.industry}</strong></p>
              <p>HR Contact: <strong className="text-[#171717]">{mou.hrContactName}</strong> ({mou.hrEmail})</p>
              <p>Registered Office: <strong className="text-[#171717]">{mou.registeredAddress || 'Pune HQ'}</strong></p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2">
            <span className="font-bold text-[#171717] flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#A874F7]" />
              <span>Agreement Details</span>
            </span>
            <div className="space-y-1 text-[11px] text-[#6B7280]">
              <p>Agreement Title: <strong className="text-[#171717]">{mou.agreementType}</strong></p>
              <p>Effective Date: <strong className="text-[#171717]">{mou.startDate}</strong></p>
              <p>Expiry Date: <strong className="text-[#171717]">{mou.expiryDate}</strong> ({mou.duration})</p>
              <p>Tech Covered: <strong className="text-purple-700">{mou.technologiesCovered || 'Full Stack Web'}</strong></p>
            </div>
          </div>
        </div>

        {/* Requirement #12: Document Library with Previews & Downloads */}
        <div className="p-4 rounded-xl border border-[#E9DDFE] bg-gray-50 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9DDFE] pb-2">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#A874F7]" />
              <div>
                <span className="font-bold text-[#171717] block">Legal Document Library ({ (mou.documents || []).length } Files)</span>
                <span className="text-[10px] text-[#6B7280]">Signed MoU, NDA, Legal Compliance & CIN Proofs</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-[#E9DDFE]">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  className="p-1 text-[#6B7280] hover:text-[#171717]"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-bold text-[#171717] px-1">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                  className="p-1 text-[#6B7280] hover:text-[#171717]"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {(mou.documents || [
              { name: 'Signed_Institutional_MoU.pdf', type: 'Signed MoU', size: '2.4 MB' },
              { name: 'Non_Disclosure_Agreement.pdf', type: 'NDA', size: '1.1 MB' },
            ]).map((doc, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-[#E9DDFE] bg-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={14} className="text-[#A874F7] shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-[#171717] truncate">{doc.name}</p>
                    <span className="text-[9px] text-[#6B7280]">{doc.type} • {doc.size}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success(`Downloading ${doc.name}`)}
                  className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#A874F7] hover:bg-[#F3EDFF] transition-colors cursor-pointer shrink-0"
                  title="Download File"
                >
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Requirement #7: Mandatory 7-Point Legal Compliance Checklist */}
        {!isVerified && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-purple-200 pb-2">
              <span className="font-bold text-[#171717] flex items-center gap-1.5">
                <CheckSquare size={16} className="text-[#A874F7]" />
                <span>TPO Legal Agreement Verification Checklist</span>
              </span>
              <span className="text-[10px] font-bold text-[#A874F7]">
                {Object.values(checklist).filter(Boolean).length} / 7 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[11px]">
              {[
                { key: 'signaturesVerified', label: 'Authorized Signatures Verified' },
                { key: 'sealVerified', label: 'Company Seal Verified' },
                { key: 'validityConfirmed', label: 'Validity Period Confirmed' },
                { key: 'scopeReviewed', label: 'Internship Scope Reviewed' },
                { key: 'ipClauseVerified', label: 'IP Clause Verified' },
                { key: 'ndaClauseVerified', label: 'NDA Clause Verified' },
                { key: 'legalComplianceConfirmed', label: 'Legal Compliance Confirmed' },
              ].map((item) => {
                const isChecked = checklist[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleChecklistItem(item.key)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isChecked ? 'bg-white border-emerald-300 text-emerald-800 font-bold' : 'bg-white/80 border-purple-200 text-[#6B7280]'
                    }`}
                  >
                    {isChecked ? <CheckSquare size={14} className="text-emerald-600 shrink-0" /> : <Square size={14} className="text-gray-400 shrink-0" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Requirement #8: MoU Lifecycle Timeline */}
        <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-gray-50/70 space-y-2 text-xs">
          <span className="font-bold text-[#171717] block">MoU Legal Lifecycle Timeline (Read-Only):</span>
          <div className="flex items-center gap-2 overflow-x-auto text-[10px] pb-1">
            {mouLifecycleTimeline.map((t, idx, arr) => (
              <React.Fragment key={idx}>
                <div className={`p-2 rounded-xl border text-center shrink-0 min-w-[110px] ${
                  t.status === 'Completed' ? 'bg-white border-emerald-200 text-emerald-900 font-bold' : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}>
                  <span className="block truncate">{t.stage}</span>
                  <span className="text-[9px] opacity-75">{t.date}</span>
                </div>
                {idx < arr.length - 1 && <span className="text-[#6B7280] font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Requirement #17: Decision Locking Details */}
        {isVerified && (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>MoU Legal Verification Decision Locked</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-emerald-800 pt-1">
              <div>Verified By: <strong>{mou.verifiedBy || 'Prof. Rajesh Wankhede'}</strong></div>
              <div>Verification Date: <strong>{mou.verificationDate || '18 Jun 2025'}</strong></div>
              <div>Audit ID: <strong>MOU-AUD-1049</strong></div>
              <div>Status: <strong>Active & Verified</strong></div>
            </div>
          </div>
        )}

        {/* TPO Remarks Input */}
        {!isVerified && (
          <div className="space-y-1.5 text-xs">
            <label className="block font-semibold text-[#171717]">TPO Legal Verification Remarks / Governance Notes</label>
            <textarea
              rows={2}
              value={tpoRemarks}
              onChange={(e) => setTpoRemarks(e.target.value)}
              placeholder="Add TPO legal verification remarks or MoU comments..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E9DDFE] text-xs">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs px-4">
            Close
          </Button>

          {isVerified ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 size={15} />
              MoU Agreement Verified & Locked
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestRenewal}
                isLoading={isSubmitting}
                className="text-xs px-3 text-amber-800 border-amber-300 hover:bg-amber-50"
              >
                Request Renewal
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleApprove}
                disabled={!isChecklistComplete}
                isLoading={isSubmitting}
                className={`text-xs px-5 shadow-xs text-white ${
                  isChecklistComplete ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'
                }`}
                title={!isChecklistComplete ? 'Complete all 7 legal checklist items to enable verification' : 'Verify & Approve MoU'}
              >
                Verify & Approve MoU
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
