import React from 'react';
import { FileText, CheckCircle, XCircle, Clock, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export const CertificateReviewQueueCard = ({ item, onOpenReview }) => {
  const trustScore = Number(item.overall_trust_score ?? 0);
  const evidence = item.evidence_breakdown || {};
  const aiRecommendation = item.ai_recommendation || 'MANUAL_REVIEW';
  const humanStatus = item.human_review_status || 'UNREVIEWED';

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs hover:border-[#1F6B32] transition-colors flex flex-col justify-between gap-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] text-[#1F6B32]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#18201B]">{item.users?.full_name || 'Candidate Student'}</h4>
            <p className="text-xs text-[#66706A] mt-0.5">{item.internships?.companies?.company_name || 'Host Organization'}</p>
            <p className="text-[11px] font-mono text-[#1F6B32] font-semibold mt-1 truncate max-w-[200px]" title={item.file_name}>
              {item.file_name}
            </p>
          </div>
        </div>

        {/* Deterministic Trust Score Badge */}
        <div className="text-right shrink-0">
          <div className="text-xs text-[#66706A] font-semibold mb-0.5">Trust Score</div>
          <div className="text-xl font-black text-[#1F6B32]">{trustScore}%</div>
        </div>
      </div>

      {/* Trust Concept 2: AI Recommendation (Advisory Only) */}
      <div className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#66706A]">
          <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
          <span>AI Advisory Rec:</span>
        </div>
        <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
          aiRecommendation === 'AUTO_VERIFIED' ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]' :
          aiRecommendation === 'MANUAL_REVIEW' ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]' :
          'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]'
        }`}>
          {aiRecommendation} (Advisory Only)
        </span>
      </div>

      {/* Trust Concept 3: Human Authority Status */}
      <div className="pt-3 border-t border-[#E1E7E2] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-[#66706A]" />
          <span className="text-[#66706A] font-semibold">Human Decision:</span>
          {humanStatus === 'APPROVED' ? (
            <span className="flex items-center gap-1 text-[#1F6B32] font-bold bg-[#EAF4EC] px-2 py-0.5 rounded-full text-[10px]">
              <CheckCircle className="w-3 h-3" /> APPROVED
            </span>
          ) : humanStatus === 'REJECTED' ? (
            <span className="flex items-center gap-1 text-[#DC2626] font-bold bg-[#FEE2E2] px-2 py-0.5 rounded-full text-[10px]">
              <XCircle className="w-3 h-3" /> REJECTED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#D97706] font-bold bg-[#FEF3C7] px-2 py-0.5 rounded-full text-[10px]">
              <Clock className="w-3 h-3" /> PENDING ADJUDICATION
            </span>
          )}
        </div>

        <button
          onClick={() => onOpenReview(item)}
          className="px-3 py-1.5 bg-[#1F6B32] hover:bg-[#185427] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
        >
          Review & Adjudicate
        </button>
      </div>
    </div>
  );
};
