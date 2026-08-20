import { supabase } from '../supabase/client.js';
import { geminiProxyEndpoint } from './geminiProxyEndpoint.js';

export const geminiAdvisoryService = {
  /**
   * Request Gemini AI Advisory Analysis for an external certificate record
   * @param {object} certRecord - `public.external_certificates` row
   */
  async generateAdvisoryAnalysis(certRecord) {
    if (!certRecord || !certRecord.id) {
      throw new Error('External certificate record is required.');
    }

    try {
      // 1. Get current authenticated Supabase session access token
      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData?.session?.access_token || null;

      // 2. Fetch linked Ground Truth evidence from PostgreSQL DB
      const { data: fullCert } = await supabase
        .from('external_certificates')
        .select('*, users:student_id(full_name, email), internships:internship_id(internship_title, companies:company_id(company_name))')
        .eq('id', certRecord.id)
        .single();

      const cert = fullCert || certRecord;
      const evidenceBreakdown = cert.evidence_breakdown || {};
      const evidenceComparison = evidenceBreakdown.extractedEvidenceComparison || {};
      const extractedData = cert.extracted_data || {};

      // 3. Construct Sanitized Payload (Data Minimization)
      const sanitizedPayload = {
        docCandidateName: evidenceComparison.docCandidateName || extractedData.candidateName || 'N/A',
        dbStudentName: cert.users?.full_name || evidenceComparison.dbStudentName || 'N/A',
        docOrganization: evidenceComparison.docOrganization || extractedData.organizationName || 'N/A',
        dbCompanyName: cert.internships?.companies?.company_name || evidenceComparison.dbCompanyName || 'N/A',
        internshipTitle: cert.internships?.internship_title || 'N/A',
        textSnippet: (extractedData.documentText || '').slice(0, 500),
        trustScore: cert.overall_trust_score || evidenceBreakdown.trustScore || 80,
        scoreBreakdown: evidenceBreakdown.scoreBreakdown || {},
        anomalyFlags: evidenceBreakdown.anomalyFlags || [],
        documentHash: cert.document_hash,
      };

      // 4. Call Secure Server Boundary Proxy
      const advisoryOutput = await geminiProxyEndpoint.processAdvisoryRequest(sanitizedPayload, authToken);

      // 5. Build Audit Summary (Data Minimization: Zero raw prompts or binary stored)
      const auditSummary = {
        model: advisoryOutput.model || 'gemini-1.5-flash',
        requestedAt: advisoryOutput.requestedAt || new Date().toISOString(),
        inputEvidenceHash: cert.document_hash,
        advisoryCategory: advisoryOutput.advisoryCategory,
        confidence: advisoryOutput.confidence,
        reasoningSummary: advisoryOutput.reasoningSummary,
        evidenceReferences: advisoryOutput.evidenceReferences,
        recommendedAction: 'MANUAL_REVIEW',
        isAdvisoryOnly: true,
      };

      // 6. Update external_certificates evidence_breakdown with aiAdvisoryAudit summary
      const updatedEvidence = {
        ...evidenceBreakdown,
        aiAdvisoryAudit: auditSummary,
        advisoryCategory: advisoryOutput.advisoryCategory,
      };

      const { data: updatedRecord, error: upErr } = await supabase
        .from('external_certificates')
        .update({
          ai_recommendation: advisoryOutput.advisoryCategory === 'HIGH_TRUST' ? 'AUTO_VERIFIED' : 'MANUAL_REVIEW',
          evidence_breakdown: updatedEvidence,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cert.id)
        .select('*')
        .maybeSingle();

      if (upErr) {
        console.warn('Notice updating aiAdvisoryAudit:', upErr.message);
        return {
          ...cert,
          evidence_breakdown: updatedEvidence,
          advisoryAnalysis: auditSummary,
        };
      }

      return {
        ...updatedRecord,
        advisoryAnalysis: auditSummary,
      };
    } catch (err) {
      console.error('geminiAdvisoryService.generateAdvisoryAnalysis error:', err.message || err);
      // Fallback response preserving Phase 11 deterministic data
      return {
        ...certRecord,
        advisoryAnalysis: {
          model: 'deterministic-fallback',
          requestedAt: new Date().toISOString(),
          inputEvidenceHash: certRecord.document_hash || '',
          advisoryCategory: 'NEEDS_REVIEW',
          confidence: 0.85,
          reasoningSummary: 'AI Advisory unavailable; falling back to Phase 11 deterministic trust evaluation.',
          evidenceReferences: ['Phase 11 Deterministic Trust Evaluation Active'],
          recommendedAction: 'MANUAL_REVIEW',
          isAdvisoryOnly: true,
        }
      };
    }
  }
};
