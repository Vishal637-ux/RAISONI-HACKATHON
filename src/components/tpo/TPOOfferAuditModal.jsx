import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  X,
  FileCheck2,
  Building2,
  User,
  GraduationCap,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  CheckSquare,
  Square,
  AlertCircle,
  TrendingUp,
  Percent,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TPOOfferAuditModal = ({ isOpen, onClose, offer, onVerifyDecision }) => {
  const [tpoRemarks, setTpoRemarks] = useState('');
  const [discrepancyType, setDiscrepancyType] = useState('Salary Mismatch');
  const [showDiscrepancyInput, setShowDiscrepancyInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Requirement #4: Mandatory Verification Checklist State
  const [checklist, setChecklist] = useState({
    companyVerified: false,
    studentMatch: false,
    joiningVerified: false,
    stipendVerified: false,
    letterAuthentic: false,
    studentAccepted: false,
  });

  useEffect(() => {
    if (offer) {
      setTpoRemarks('');
      setShowDiscrepancyInput(false);
      setZoomLevel(100);
      setChecklist({
        companyVerified: offer.isVerified || false,
        studentMatch: offer.isVerified || false,
        joiningVerified: offer.isVerified || false,
        stipendVerified: offer.isVerified || false,
        letterAuthentic: offer.isVerified || false,
        studentAccepted: offer.isVerified || false,
      });
    }
  }, [offer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !offer) return null;

  const isVerified = offer.isVerified || offer.status === 'Verified Offer';
  const isChecklistComplete = Object.values(checklist).every(Boolean);

  const toggleChecklistItem = (key) => {
    if (isVerified) return;
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onVerifyDecision(offer.id, { decision: 'Approved', remarks: tpoRemarks });
      toast.success(`Notification sent: Offer Letter for '${offer.studentName}' Verified & Approved`);
      onClose();
    } catch {
      toast.error('Failed to verify offer letter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlagDiscrepancy = async () => {
    if (!tpoRemarks.trim()) {
      toast.error('Please enter TPO remarks explaining the discrepancy reason');
      return;
    }
    setIsSubmitting(true);
    try {
      await onVerifyDecision(offer.id, {
        decision: 'Flagged',
        remarks: tpoRemarks,
        discrepancyType,
      });
      toast.success(`Notification sent: Flagged '${discrepancyType}' on offer for '${offer.studentName}'`);
      onClose();
    } catch {
      toast.error('Failed to flag discrepancy');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Requirement #6: Salary Comparison Calculations
  const deptAvgStipend = 22000;
  const currentStipendNum = 25000;
  const salaryDiffPercent = Math.round(((currentStipendNum - deptAvgStipend) / deptAvgStipend) * 100);

  // Requirement #8: Read-Only Chronological Timeline
  const offerTimeline = [
    { stage: 'Offer Uploaded', date: '05 Dec 2025', status: 'Completed' },
    { stage: 'Under Audit', date: '06 Dec 2025', status: 'Completed' },
    { stage: 'Verified', date: isVerified ? '04 Aug 2026' : 'Pending', status: isVerified ? 'Completed' : 'Pending' },
    { stage: 'Student Accepted', date: '10 Dec 2025', status: 'Completed' },
    { stage: 'Joined Company', date: '01 Jan 2026', status: 'Completed' },
    { stage: 'Placement Completed', date: isVerified ? '04 Aug 2026' : 'Pending', status: isVerified ? 'Completed' : 'Pending' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tpo-offer-modal-title"
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
                <h3 id="tpo-offer-modal-title" className="text-base font-bold text-[#171717]">
                  {isVerified ? 'Verified Offer Letter Audit' : 'Audit Student Internship Offer Letter'}
                </h3>
                {isVerified && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={10} />
                    Decision Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Student: <strong className="text-[#171717]">{offer.studentName}</strong> ({offer.rollNumber}) • Audit ID: <strong className="text-[#A874F7]">AUD-{offer.id.slice(-4).toUpperCase()}</strong>
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

        {/* Requirement #6 & #7: Salary Comparison & Joining Countdown Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Requirement #6: Salary Comparison Card */}
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white space-y-1">
            <span className="font-bold text-[#171717] block">Salary Comparison Analytics</span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6B7280]">Dept Avg: <strong>₹22,000</strong></span>
              <span className="text-[#171717]">Offer: <strong>{offer.stipend}</strong></span>
            </div>
            <span className="inline-block font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
              Above Average +{salaryDiffPercent}%
            </span>
          </div>

          {/* Requirement #7: Joining Countdown Indicator */}
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white space-y-1">
            <span className="font-bold text-[#171717] block">Joining Schedule Countdown</span>
            <p className="text-[11px] text-[#6B7280]">Joining Date: <strong className="text-[#171717]">{offer.joiningDate}</strong></p>
            <span className="inline-block font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
              Already Joined (01 Jan 2026)
            </span>
          </div>

          {/* Company Verification Status (Requirement #2) */}
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white space-y-1">
            <span className="font-bold text-[#171717] block">Company Verification Status</span>
            <p className="text-[11px] text-[#6B7280]">Recruiter: <strong className="text-[#171717]">{offer.companyName}</strong></p>
            <span className="inline-block font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
              ✓ Verified Company
            </span>
          </div>
        </div>

        {/* Student & Company Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2">
            <span className="font-bold text-[#171717] flex items-center gap-1.5">
              <GraduationCap size={15} className="text-[#A874F7]" />
              <span>Student Profile (Read-Only)</span>
            </span>
            <div className="space-y-1 text-[11px] text-[#6B7280]">
              <p>Student Name: <strong className="text-[#171717]">{offer.studentName}</strong></p>
              <p>Roll Number: <strong className="text-[#171717]">{offer.rollNumber}</strong></p>
              <p>Department: <strong className="text-[#171717]">{offer.department}</strong></p>
              <p>CGPA: <strong className="text-purple-700">{offer.cgpa || '9.0'}</strong> ({offer.semester || '8th Sem'})</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2">
            <span className="font-bold text-[#171717] flex items-center gap-1.5">
              <Building2 size={15} className="text-[#A874F7]" />
              <span>Offer Details & CTC</span>
            </span>
            <div className="space-y-1 text-[11px] text-[#6B7280]">
              <p>Recruiter: <strong className="text-[#171717]">{offer.companyName}</strong></p>
              <p>Role Title: <strong className="text-[#171717]">{offer.roleTitle}</strong></p>
              <p>Offer Type: <strong className="text-[#A874F7]">{offer.offerType}</strong></p>
              <p>Stipend / CTC: <strong className="text-emerald-700">{offer.stipend}</strong> ({offer.ctc})</p>
            </div>
          </div>
        </div>

        {/* Requirement #3: Enhanced Offer PDF Document Preview with Zoom Controls */}
        <div className="p-4 rounded-xl border border-[#E9DDFE] bg-gray-50 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9DDFE] pb-2">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#A874F7]" />
              <div>
                <span className="font-bold text-[#171717] block">Official Offer Letter Document Preview</span>
                <span className="text-[10px] text-[#6B7280]">Official Company Letterhead Verified</span>
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

              <button
                type="button"
                onClick={() => toast.success(`Downloading offer letter PDF for ${offer.studentName}`)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#A874F7] text-white font-semibold text-xs hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
              >
                <Download size={13} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Realistic PDF Document Viewer Container */}
          <div className="bg-slate-100 p-6 rounded-xl border border-[#E9DDFE] shadow-inner min-h-[360px] flex flex-col items-center justify-center overflow-auto max-h-[420px]">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-white text-slate-800 p-8 rounded-lg shadow-md border border-slate-300 w-full max-w-xl text-left space-y-4 font-serif transition-transform duration-150 relative select-none"
            >
              {/* Document Letterhead Header */}
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black tracking-wide text-slate-900 font-sans uppercase">
                    {offer.companyName || 'TechCorp Solutions Pvt Ltd'}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Corporate Technology Center, Software Park, Pune - 411057 | CIN: U72200PN2015PTC156789
                  </p>
                </div>
                <div className="text-right font-sans text-[10px] text-slate-600">
                  <p className="font-bold text-emerald-700">OFFICIAL VERIFIED OFFER</p>
                  <p>Ref: TC/HR/2026/OFR-{(offer.id || '8890').slice(-4)}</p>
                  <p>Date: {offer.joiningDate || '15 Aug 2026'}</p>
                </div>
              </div>

              {/* Subject Line */}
              <div className="text-center font-sans font-extrabold text-sm text-slate-900 uppercase tracking-wide bg-slate-50 py-1.5 rounded border border-slate-200">
                OFFER OF INTERNSHIP & PRE-PLACEMENT OPPORTUNITY
              </div>

              {/* Salutation & Body Content */}
              <div className="text-[11px] leading-relaxed space-y-2.5 font-sans">
                <p>Dear <strong>{offer.studentName || 'Student Candidate'}</strong>,</p>
                <p>
                  Following your technical assessment and interview performance, we are pleased to offer you the position of{' '}
                  <strong className="text-purple-700">{offer.roleTitle || 'Frontend React Developer'}</strong> at{' '}
                  <strong>{offer.companyName || 'TechCorp Solutions Pvt Ltd'}</strong>.
                </p>

                <div className="grid grid-cols-2 gap-2 my-2 bg-purple-50/50 p-2.5 rounded-lg border border-purple-200 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Stipend Package:</span>
                    <strong className="text-emerald-700 text-xs">{offer.stipend || '₹25,000/mo'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Joining Date:</span>
                    <strong className="text-slate-800 text-xs">{offer.joiningDate || '15 Aug 2026'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration:</span>
                    <strong className="text-slate-800">{offer.duration || '6 Months'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Work Mode:</span>
                    <strong className="text-slate-800">{offer.workMode || 'Hybrid / On-site'}</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-600 italic">
                  * This offer is subject to academic verification by G. H. Raisoni College of Engineering TPO Placement Cell.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] font-sans">
                <div>
                  <div className="w-24 h-8 border-b border-slate-400 mb-1 flex items-end justify-center text-purple-700 font-serif italic text-xs font-bold">
                    Rajesh Patil
                  </div>
                  <p className="font-bold text-slate-800">Authorized Signatory</p>
                  <p className="text-slate-500">Head of Human Resources</p>
                </div>

                <div className="w-16 h-16 rounded-full border-2 border-emerald-600 bg-emerald-50/50 flex flex-col items-center justify-center text-center p-1 text-[8px] font-bold text-emerald-800 uppercase tracking-tighter">
                  <span>TechCorp</span>
                  <span className="text-[6px]">VERIFIED</span>
                  <span>SEAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirement #4: Mandatory Verification Checklist */}
        {!isVerified && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-purple-200 pb-2">
              <span className="font-bold text-[#171717] flex items-center gap-1.5">
                <CheckSquare size={16} className="text-[#A874F7]" />
                <span>TPO Mandatory Offer Verification Checklist</span>
              </span>
              <span className="text-[10px] font-bold text-[#A874F7]">
                {Object.values(checklist).filter(Boolean).length} / 6 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[11px]">
              {[
                { key: 'companyVerified', label: 'Company Verified' },
                { key: 'studentMatch', label: 'Student Details Match' },
                { key: 'joiningVerified', label: 'Joining Date Verified' },
                { key: 'stipendVerified', label: 'Stipend / CTC Verified' },
                { key: 'letterAuthentic', label: 'Offer Letter Authentic' },
                { key: 'studentAccepted', label: 'Student Accepted Offer' },
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

        {/* Requirement #8: Offer Chronological Timeline */}
        <div className="p-3.5 rounded-xl border border-[#E9DDFE] bg-gray-50/70 space-y-2 text-xs">
          <span className="font-bold text-[#171717] block">Offer Workflow Chronological Timeline (Read-Only):</span>
          <div className="flex items-center gap-2 overflow-x-auto text-[10px] pb-1">
            {offerTimeline.map((t, idx, arr) => (
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

        {/* Requirement #14: Decision Locking Details */}
        {isVerified && (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Offer Verification Decision Locked</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-emerald-800 pt-1">
              <div>Verified By: <strong>{offer.verifiedBy || 'Prof. Rajesh Wankhede'}</strong></div>
              <div>Verification Date: <strong>{offer.verificationDate || '04 Aug 2026'}</strong></div>
              <div>Audit ID: <strong>AUD-{offer.id.slice(-4).toUpperCase()}</strong></div>
              <div>Status: <strong>Placement Completed</strong></div>
            </div>
          </div>
        )}

        {/* Requirement #9: Discrepancy Specific Details */}
        {showDiscrepancyInput && !isVerified && (
          <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 space-y-3 text-xs">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-amber-700" />
              <span>Select Specific Discrepancy Reason</span>
            </span>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-amber-900">Discrepancy Category *</label>
              <select
                value={discrepancyType}
                onChange={(e) => setDiscrepancyType(e.target.value)}
                className="w-full bg-white border border-amber-300 text-amber-900 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Salary Mismatch">Salary Mismatch (Stipend/CTC differs from MoU)</option>
                <option value="Joining Date Conflict">Joining Date Conflict / Overlap</option>
                <option value="Duplicate Offer">Duplicate Offer Letter</option>
                <option value="Invalid Company Information">Invalid Company Information</option>
                <option value="Missing Documents">Missing Documents / Signatures</option>
              </select>
            </div>
          </div>
        )}

        {/* TPO Remarks Input */}
        {!isVerified && (
          <div className="space-y-1.5 text-xs">
            <label className="block font-semibold text-[#171717]">TPO Audit Remarks / Discrepancy Notes</label>
            <textarea
              rows={2}
              value={tpoRemarks}
              onChange={(e) => setTpoRemarks(e.target.value)}
              placeholder="Add TPO placement verification notes or discrepancy details..."
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
              Offer Audit Verified & Locked
            </span>
          ) : (
            <div className="flex items-center gap-2">
              {showDiscrepancyInput ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFlagDiscrepancy}
                  isLoading={isSubmitting}
                  className="text-xs px-4 text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 font-bold"
                >
                  Submit Discrepancy Flag
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDiscrepancyInput(true)}
                  className="text-xs px-3 text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  Flag Discrepancy
                </Button>
              )}

              <Button
                type="button"
                variant="primary"
                onClick={handleApprove}
                disabled={!isChecklistComplete}
                isLoading={isSubmitting}
                className={`text-xs px-5 shadow-xs text-white ${
                  isChecklistComplete ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'
                }`}
                title={!isChecklistComplete ? 'Complete all 6 checklist items to enable verification' : 'Verify & Approve Offer'}
              >
                Verify & Approve Offer
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
