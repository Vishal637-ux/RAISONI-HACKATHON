import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle, XCircle, Sparkles, UserCheck, RefreshCw, FileText, Info } from 'lucide-react';
import { geminiAdvisoryService } from '../../services/geminiAdvisoryService';

export const ExternalCertificateReviewDrawer = ({ isOpen, onClose, certItem, onAdjudicate }) => {
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [advisoryResult, setAdvisoryResult] = useState(null);

  if (!isOpen || !certItem) return null;

  const trustScore = Number(certItem.overall_trust_score ?? 0);
  const evidence = certItem.evidence_breakdown || {};
  const breakdown = evidence.scoreBreakdown || { s_hash: 0, s_status: 0, s_eval: 0, s_entity: 0 };
  const anomalyFlags = evidence.anomalyFlags || [];
  const aiRecommendation = certItem.ai_recommendation || 'MANUAL_REVIEW';
  const humanStatus = certItem.human_review_status || 'UNREVIEWED';
  const isAdjudicated = humanStatus !== 'UNREVIEWED';

  const activeAdvisory = advisoryResult?.advisoryAnalysis || evidence.aiAdvisoryAudit || null;

  const handleGenerateAIAdvisory = async () => {
    try {
      setAnalyzingAI(true);
      const res = await geminiAdvisoryService.generateAdvisoryAnalysis(certItem);
      setAdvisoryResult(res);
    } catch (err) {
      console.error('Error generating AI Advisory:', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleDecision = async (decision) => {
    try {
      setSubmitting(true);
      await onAdjudicate(certItem.id, decision, comments);
      setComments('');
      onClose();
    } catch (err) {
      console.error('Error submitting adjudication:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#E1E7E2] flex items-center justify-between bg-[#F8FAF9]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EAF4EC] rounded-xl text-[#1F6B32]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#18201B]">External Certificate Adjudication</h3>
              <p className="text-xs text-[#66706A]">Trust Engine Analysis & Authoritative Human Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#66706A] hover:bg-[#E1E7E2] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Candidate & File Info */}
          <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#66706A]">Candidate Student:</span>
              <span className="text-xs font-bold text-[#18201B]">{certItem.users?.full_name || 'Candidate Student'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#66706A]">Host Organization:</span>
              <span className="text-xs font-semibold text-[#18201B]">{certItem.internships?.companies?.company_name || 'Host Organization'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#66706A]">Document Name:</span>
              <span className="text-xs font-mono font-semibold text-[#1F6B32]">{certItem.file_name}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#E1E7E2]">
              <span className="text-[11px] text-[#66706A]">SHA-256 Hash:</span>
              <span className="text-[10px] font-mono text-[#66706A] truncate max-w-[240px]" title={certItem.document_hash}>
                {certItem.document_hash}
              </span>
            </div>
          </div>

          {/* CONCEPT 1: Deterministic Trust Score */}
          <div className="p-4 rounded-xl border border-[#E1E7E2] bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#18201B]">1. Deterministic Phase 11 Trust Score</span>
              <span className="text-2xl font-black text-[#1F6B32]">{trustScore}%</span>
            </div>

            <div className="w-full bg-[#E1E7E2] h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  trustScore >= 85 ? 'bg-[#1F6B32]' : trustScore >= 50 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
                }`}
                style={{ width: `${trustScore}%` }}
              />
            </div>
          </div>

          {/* CONCEPT 2: Gemini AI Advisory Assistant */}
          <div className="p-4 rounded-xl border border-[#C5E3CC] bg-[#F4F9F5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#18201B]">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>2. Gemini AI Advisory Assistant</span>
              </div>
              <button
                onClick={handleGenerateAIAdvisory}
                disabled={analyzingAI}
                className="px-2.5 py-1 bg-white hover:bg-[#EAF4EC] border border-[#C5E3CC] text-[11px] font-bold text-[#1F6B32] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3 h-3 ${analyzingAI ? 'animate-spin' : ''}`} />
                <span>{analyzingAI ? 'Analyzing...' : activeAdvisory ? 'Refresh AI Analysis' : 'Generate AI Advisory'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#D0E5D4] text-xs">
              <span className="text-[#66706A]">AI Recommendation:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                aiRecommendation === 'AUTO_VERIFIED' ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]' :
                aiRecommendation === 'MANUAL_REVIEW' ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]' :
                'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]'
              }`}>
                {aiRecommendation} (ADVISORY ONLY)
              </span>
            </div>

            {activeAdvisory && (
              <div className="p-3 bg-white rounded-lg border border-[#D0E5D4] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-[#66706A]">
                  <span>Model: <strong>{activeAdvisory.model || 'gemini-1.5-flash'}</strong></span>
                  <span>Confidence: <strong>{Math.round((activeAdvisory.confidence || 0.90) * 100)}%</strong></span>
                </div>
                <div className="text-[#18201B] font-medium leading-relaxed">
                  {activeAdvisory.reasoningSummary}
                </div>
                {activeAdvisory.evidenceReferences?.length > 0 && (
                  <div className="pt-2 border-t border-[#E1E7E2] space-y-1">
                    <span className="text-[10px] font-bold text-[#66706A] uppercase tracking-wider block">Evidence References:</span>
                    <ul className="list-disc list-inside text-[11px] text-[#4A544E] space-y-0.5">
                      {activeAdvisory.evidenceReferences.map((ref, idx) => (
                        <li key={idx}>{ref}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <p className="text-[10px] text-[#66706A] flex items-center gap-1 italic">
              <Info className="w-3 h-3 text-[#D97706] shrink-0" />
              <span>AI recommendations are strictly advisory and non-binding. Authoritative status is set exclusively by human adjudication.</span>
            </p>
          </div>

          {/* CONCEPT 3: Human Authority Decision */}
          <div className="p-4 rounded-xl border border-[#E1E7E2] bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#18201B] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#1F6B32]" />
                3. Human Adjudication Status (Authoritative)
              </span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                humanStatus === 'APPROVED' ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]' :
                humanStatus === 'REJECTED' ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]' :
                'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
              }`}>
                {humanStatus}
              </span>
            </div>
          </div>

          {/* Score Breakdown (Deterministic Weights) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider">Score Breakdown & Evidence</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2]">
                <div className="text-[11px] text-[#66706A]">SHA-256 Uniqueness (30%)</div>
                <div className="font-bold text-[#18201B]">{breakdown.s_hash}%</div>
              </div>
              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2]">
                <div className="text-[11px] text-[#66706A]">Internship Status (30%)</div>
                <div className="font-bold text-[#18201B]">{breakdown.s_status}%</div>
              </div>
              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2]">
                <div className="text-[11px] text-[#66706A]">Dual Evaluations (20%)</div>
                <div className="font-bold text-[#18201B]">{breakdown.s_eval}%</div>
              </div>
              <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2]">
                <div className="text-[11px] text-[#66706A]">Entity Integrity (20%)</div>
                <div className="font-bold text-[#18201B]">{breakdown.s_entity}%</div>
              </div>
            </div>
          </div>

          {/* Anomaly Flags */}
          {anomalyFlags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#DC2626] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Detected Anomaly Flags
              </h4>
              <div className="space-y-2">
                {anomalyFlags.map((flag, i) => (
                  <div key={i} className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs space-y-0.5">
                    <div className="font-bold text-[#991B1B]">{flag.code}</div>
                    <div className="text-[#B91C1C] text-[11px]">{flag.evidence}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewer Comments */}
          {!isAdjudicated && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#18201B]">
                Reviewer Adjudication Remarks (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter remarks or justification for approval/rejection..."
                rows={3}
                className="w-full p-3 text-xs border border-[#E1E7E2] rounded-xl focus:outline-none focus:border-[#1F6B32]"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E1E7E2] bg-[#F8FAF9] flex items-center justify-between gap-3">
          {isAdjudicated ? (
            <div className="w-full text-center text-xs font-bold text-[#66706A] p-2.5 bg-[#E1E7E2] rounded-xl flex items-center justify-center gap-2">
              <span>Authoritative Decision:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                humanStatus === 'APPROVED' ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]' : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]'
              }`}>
                {humanStatus}
              </span>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleDecision('REJECTED')}
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT Certificate</span>
              </button>

              <button
                onClick={() => handleDecision('APPROVED')}
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-[#1F6B32] hover:bg-[#185427] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>APPROVE Certificate</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
