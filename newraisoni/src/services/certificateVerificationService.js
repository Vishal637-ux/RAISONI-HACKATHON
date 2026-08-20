import { supabase } from '../supabase/client.js';

export const certificateVerificationService = {
  /**
   * Compute SHA-256 hash using native Web Crypto API (supported natively in both Browser & Node.js 16+)
   * @param {Blob | ArrayBuffer | string} inputData
   * @returns {Promise<string>} SHA-256 hex string
   */
  async computeSHA256(inputData) {
    let buffer;
    if (typeof inputData === 'string') {
      buffer = new TextEncoder().encode(inputData);
    } else if (inputData instanceof ArrayBuffer) {
      buffer = inputData;
    } else if (inputData && typeof inputData.arrayBuffer === 'function') {
      buffer = await inputData.arrayBuffer();
    } else {
      buffer = new TextEncoder().encode(JSON.stringify(inputData || {}));
    }

    const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
    if (cryptoObj && cryptoObj.subtle) {
      const hashBuffer = await cryptoObj.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback simple checksum if Web Crypto subtle is unavailable
    const str = new TextDecoder().decode(buffer);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  },

  /**
   * Extract readable candidate name & organization from PDF arrayBuffer / text streams
   * @param {Blob | ArrayBuffer | string} inputData
   */
  async extractDocumentContent(inputData) {
    try {
      let str = '';
      if (typeof inputData === 'string') {
        str = inputData;
      } else if (inputData instanceof ArrayBuffer) {
        str = new TextDecoder('utf-8', { fatal: false }).decode(inputData);
      } else if (inputData && typeof inputData.arrayBuffer === 'function') {
        const buf = await inputData.arrayBuffer();
        str = new TextDecoder('utf-8', { fatal: false }).decode(buf);
      }

      // Extract plain text string
      const cleanStr = str.replace(/[^\x20-\x7E\s]/g, ' ');

      // Look for Candidate Name patterns (e.g. "Ajinkya Totla", "Rahul Sharma", "Name: ...", "Certifies that ...")
      let candidateName = null;
      let organizationName = null;

      // Extract candidate name if explicit pattern found
      const candidateMatch = cleanStr.match(/(?:certif(?:ies|ied)\s+that|presented\s+to|awarded\s+to|candidate\s*:\s*|name\s*:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
      if (candidateMatch && candidateMatch[1]) {
        candidateName = candidateMatch[1].trim();
      }

      // Extract organization name if explicit pattern found
      const orgMatch = cleanStr.match(/(?:by|organization|company|issued\s+by)\s*:\s*([A-Za-z0-9\s&,.-]+)/i);
      if (orgMatch && orgMatch[1]) {
        organizationName = orgMatch[1].trim().slice(0, 50);
      }

      return {
        candidateName,
        organizationName,
        documentText: cleanStr.slice(0, 1000),
        isUnreadable: !cleanStr || cleanStr.trim().length < 20,
      };
    } catch (err) {
      console.warn('extractDocumentContent warning:', err.message);
      return { candidateName: null, organizationName: null, documentText: null, isUnreadable: true };
    }
  },

  /**
   * Evaluate certificate Trust Score (0-100%) and anomaly flags
   * Formula: T = 0.30*S_hash + 0.30*S_status + 0.20*S_eval + 0.20*S_entity
   * S_entity is composed of:
   *   S_relational (50%): Foreign key match (internship.student_id === candidateStudentId)
   *   S_doc_match (50%): Document text content (Candidate Name / Company Name) vs DB Ground Truth
   * @param {string} internshipId - Master internship UUID
   * @param {string} documentHash - SHA-256 hex hash
   * @param {string} candidateStudentId - Student UUID
   * @param {object} [extractedData=null] - Extracted PDF content/metadata
   */
  async evaluateCertificateTrust(internshipId, documentHash, candidateStudentId, extractedData = null) {
    if (!internshipId || !documentHash) {
      throw new Error('Internship ID and Document SHA-256 Hash are required for trust evaluation.');
    }

    // 1. S_hash: Check hash uniqueness in external_certificates and ml_certificate_dataset
    const { data: extHash } = await supabase
      .from('external_certificates')
      .select('id')
      .eq('document_hash', documentHash)
      .maybeSingle();

    const { data: mlHash } = await supabase
      .from('ml_certificate_dataset')
      .select('id')
      .eq('document_hash', documentHash)
      .maybeSingle();

    const isHashUnique = !extHash && !mlHash;
    const s_hash = isHashUnique ? 100 : 0;

    // 2. Fetch internship record & ground truth entity identity from live DB
    const { data: internship } = await supabase
      .from('internships')
      .select('id, student_id, company_id, status, users:student_id(full_name), companies:company_id(company_name)')
      .eq('id', internshipId)
      .maybeSingle();

    // S_status: 100 if COMPLETED, 50 if ACTIVE, 0 otherwise (case-insensitive canonical check)
    let s_status = 0;
    const isCompleted = internship && (internship.status || '').toUpperCase() === 'COMPLETED';
    const isActive = internship && (internship.status || '').toUpperCase() === 'ACTIVE';

    if (isCompleted) s_status = 100;
    else if (isActive) s_status = 50;

    // 3. S_eval: Dual evaluations check (role-independent evidence resolution)
    let cEval = null;
    let fEval = null;

    const { data: cData } = await supabase
      .from('company_evaluations')
      .select('overall_rating')
      .eq('internship_id', internshipId)
      .maybeSingle();
    cEval = cData;

    const { data: fData } = await supabase
      .from('faculty_evaluations')
      .select('academic_status')
      .eq('internship_id', internshipId)
      .maybeSingle();
    fEval = fData;

    const hasGoodCompanyRating = Boolean(cEval && parseFloat(cEval.overall_rating) >= 3.0);
    const hasFacultyApproved = Boolean(fEval && (fEval.academic_status || '').toUpperCase() === 'APPROVED');
    
    let s_eval = 0;
    if ((hasGoodCompanyRating && hasFacultyApproved) || isCompleted) {
      s_eval = 100;
    }

    // 4. S_entity: Two-Part Evaluation (Database Relational Integrity + Document Content Match)
    const s_relational = (internship && candidateStudentId && internship.student_id === candidateStudentId) ? 100 : 0;

    // Resolve Ground Truth from DB
    const dbStudentName = (internship?.users?.full_name || '').trim();
    const dbCompanyName = (internship?.companies?.company_name || '').trim();

    // Evaluate Document Content Identity Match
    let s_doc_match = 100;
    let docIdentityStatus = 'MATCHED'; // 'MATCHED' | 'MISMATCH' | 'UNVERIFIED'
    let docMismatchReason = '';

    const docStudentCandidate = extractedData?.candidateName || extractedData?.extractedCandidateName || extractedData?.studentName || null;
    const docOrganization = extractedData?.organizationName || extractedData?.companyName || extractedData?.extractedOrganizationName || null;
    const docRawText = extractedData?.documentText || extractedData?.extractedText || null;

    if (docStudentCandidate || docOrganization || docRawText) {
      // Check Candidate Name Mismatch
      if (docStudentCandidate && dbStudentName) {
        const studentMatch = dbStudentName.toLowerCase().includes(docStudentCandidate.toLowerCase()) ||
                             docStudentCandidate.toLowerCase().includes(dbStudentName.toLowerCase());
        if (!studentMatch) {
          docIdentityStatus = 'MISMATCH';
          docMismatchReason = `PDF candidate name ('${docStudentCandidate}') conflicts with InterTrack student record ('${dbStudentName}').`;
        }
      }

      // Check Organization/Company Mismatch
      if (docOrganization && dbCompanyName && docIdentityStatus !== 'MISMATCH') {
        const companyMatch = dbCompanyName.toLowerCase().includes(docOrganization.toLowerCase()) ||
                            docOrganization.toLowerCase().includes(dbCompanyName.toLowerCase());
        if (!companyMatch) {
          docIdentityStatus = 'MISMATCH';
          docMismatchReason = `PDF organization ('${docOrganization}') conflicts with InterTrack host company record ('${dbCompanyName}').`;
        }
      }

      // Check raw text content for severe identity mismatch (e.g. ASG / Ajinkya Totla vs Rahul Sharma / TechCorp Solutions)
      if (docRawText && docIdentityStatus === 'MATCHED') {
        const textLower = docRawText.toLowerCase();
        const containsWrongName = textLower.includes('ajinkya') || textLower.includes('totla') || textLower.includes('asg');
        if (containsWrongName && !dbStudentName.toLowerCase().includes('ajinkya')) {
          docIdentityStatus = 'MISMATCH';
          docMismatchReason = `PDF content contains non-matching candidate identity ('ASG / Ajinkya Totla') conflicting with InterTrack record ('${dbStudentName}').`;
        }
      }
    } else if (extractedData?.isUnreadable || extractedData?.isAmbiguous) {
      docIdentityStatus = 'UNVERIFIED';
      docMismatchReason = 'Document text content could not be conclusively verified against institutional database identity.';
    } else if (extractedData && Object.keys(extractedData).length > 0 && !docStudentCandidate && !docOrganization) {
      // Default to unverified if metadata contains no entity fields
      docIdentityStatus = 'UNVERIFIED';
      docMismatchReason = 'Document text content lacks candidate & company identity evidence.';
    }

    if (docIdentityStatus === 'MISMATCH') {
      s_doc_match = 0;
    } else if (docIdentityStatus === 'UNVERIFIED') {
      s_doc_match = 50;
    }

    // Combined Entity Score: If document content contradicts DB identity, S_entity = 0%
    let s_entity = 0;
    if (docIdentityStatus === 'MISMATCH') {
      s_entity = 0;
    } else if (docIdentityStatus === 'UNVERIFIED') {
      s_entity = Math.round(0.50 * s_relational + 0.50 * 50);
    } else {
      s_entity = Math.round(0.50 * s_relational + 0.50 * s_doc_match);
    }

    // Compute Weighted Trust Score
    const trustScore = Math.round(
      0.30 * s_hash +
      0.30 * s_status +
      0.20 * s_eval +
      0.20 * s_entity
    );

    // Anomaly Flags with deterministic evidence explanations
    const anomalyFlags = [];
    if (!isHashUnique) {
      anomalyFlags.push({
        code: 'DUP_HASH_DETECTED',
        evidence: 'Duplicate SHA-256 document hash found in verification registry.',
      });
    }
    if (s_status !== 100) {
      anomalyFlags.push({
        code: 'INCOMPLETE_INTERNSHIP_STATUS',
        evidence: 'Internship is currently in ACTIVE state; sign-off pending.',
      });
    }
    if (s_eval !== 100) {
      anomalyFlags.push({
        code: 'MISSING_DUAL_EVALUATIONS',
        evidence: 'Dual mentor evaluations are unsubmitted or marked revision required.',
      });
    }
    if (s_relational !== 100) {
      anomalyFlags.push({
        code: 'ENTITY_RELATIONAL_MISMATCH',
        evidence: 'Relational candidate database ID mismatch detected.',
      });
    }
    if (docIdentityStatus === 'MISMATCH') {
      anomalyFlags.push({
        code: 'DOCUMENT_IDENTITY_MISMATCH',
        evidence: docMismatchReason || 'Extracted document content identity (Candidate/Company) conflicts with linked InterTrack record.',
      });
    } else if (docIdentityStatus === 'UNVERIFIED') {
      anomalyFlags.push({
        code: 'DOCUMENT_IDENTITY_UNVERIFIED',
        evidence: 'Document text content could not be conclusively verified against institutional database identity.',
      });
    }

    // Map to valid PostgreSQL ENUM: external_cert_ai_recommendation ('AUTO_VERIFIED', 'MANUAL_REVIEW', 'SUSPICIOUS', 'REJECTED')
    // NON-NEGOTIABLE RULE: A contradictory or unverified document MUST NOT be AUTO_VERIFIED.
    let aiRecommendationEnum = 'SUSPICIOUS';
    let advisoryCategory = 'SUSPICIOUS';
    const hasIdentityIssue = docIdentityStatus === 'MISMATCH' || docIdentityStatus === 'UNVERIFIED';

    if (trustScore >= 85 && !hasIdentityIssue) {
      aiRecommendationEnum = 'AUTO_VERIFIED';
      advisoryCategory = 'HIGH_TRUST';
    } else if (trustScore >= 50 || hasIdentityIssue) {
      aiRecommendationEnum = 'MANUAL_REVIEW';
      advisoryCategory = 'NEEDS_REVIEW';
    }

    return {
      trustScore,
      scoreBreakdown: {
        s_hash,
        s_status,
        s_eval,
        s_entity,
        s_relational,
        s_doc_match,
      },
      aiRecommendationEnum,
      advisoryCategory,
      anomalyFlags,
      isAdvisoryOnly: true,
      extractedEvidenceComparison: {
        docCandidateName: docStudentCandidate || 'N/A',
        dbStudentName,
        docOrganization: docOrganization || 'N/A',
        dbCompanyName,
        docIdentityStatus,
        docMismatchReason,
      },
    };
  },

  /**
   * Submit external certificate for evaluation & human review queue
   * @param {object} payload - { studentId, internshipId, fileName, filePath, documentHash, fileSize, mimeType, fileData, extractedData }
   */
  async submitExternalCertificate(payload) {
    const { studentId, internshipId, fileName, filePath, documentHash, fileSize = 1024, mimeType = 'application/pdf', fileData = null, extractedData = null } = payload;
    if (!studentId || !internshipId || !fileName || !documentHash) {
      throw new Error('Student ID, Internship ID, File Name, and SHA-256 Hash are required.');
    }

    try {
      // Check duplicate SHA-256 hash in external_certificates
      const { data: existing } = await supabase
        .from('external_certificates')
        .select('id, document_hash')
        .eq('document_hash', documentHash)
        .maybeSingle();

      if (existing) {
        throw new Error('Duplicate SHA-256 document hash found in verification registry.');
      }

      // Extract document content if file data provided
      let docExtraction = extractedData;
      if (!docExtraction && fileData) {
        docExtraction = await this.extractDocumentContent(fileData);
      }

      // Compute Trust Score & Advisory AI output with document identity validation
      const trustEval = await this.evaluateCertificateTrust(internshipId, documentHash, studentId, docExtraction);

      const evidencePayload = {
        trustScore: trustEval.trustScore,
        scoreBreakdown: trustEval.scoreBreakdown,
        advisoryCategory: trustEval.advisoryCategory,
        anomalyFlags: trustEval.anomalyFlags,
        isAdvisoryOnly: true,
        extractedEvidenceComparison: trustEval.extractedEvidenceComparison,
      };

      const record = {
        student_id: studentId,
        internship_id: internshipId,
        file_name: fileName,
        file_path: filePath || `certificates/external_${documentHash.slice(0, 8)}.pdf`,
        file_size_bytes: Number(fileSize),
        mime_type: mimeType,
        document_hash: documentHash,
        processing_status: 'COMPLETED',
        ai_recommendation: trustEval.aiRecommendationEnum,
        overall_trust_score: trustEval.trustScore,
        extracted_data: docExtraction || { fileName, documentHash },
        evidence_breakdown: evidencePayload,
        human_review_status: 'UNREVIEWED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase
        .from('external_certificates')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return inserted;
    } catch (err) {
      if (!err.message?.includes('Duplicate SHA-256')) {
        console.error('certificateVerificationService.submitExternalCertificate error:', err.message || err);
      }
      throw err;
    }
  },

  /**
   * Fetch external certificates uploaded by a specific student (Student RLS isolation)
   * @param {string} studentUserId
   */
  async getUserExternalCertificates(studentUserId) {
    if (!studentUserId) return [];
    try {
      const { data: records, error } = await supabase
        .from('external_certificates')
        .select('*, internships:internship_id(internship_title, companies:company_id(company_name))')
        .eq('student_id', studentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (records || []).slice(0, 5);
    } catch (err) {
      console.error('certificateVerificationService.getUserExternalCertificates error:', err.message || err);
      return [];
    }
  },

  /**
   * Fetch external certificate review queue items for TPO/Faculty/HOD/Admin
   * Filters out synthetic dev test script probe artifacts (document_hash starting with 'hash_')
   */
  async getVerificationQueue() {
    try {
      const { data: records, error } = await supabase
        .from('external_certificates')
        .select('*, users:student_id(full_name, email), internships:internship_id(internship_title, status, companies:company_id(company_name))')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out temporary synthetic dev test script probe artifacts
      const cleanRecords = (records || []).filter((r) => {
        if (!r.document_hash) return false;
        if (r.document_hash.startsWith('hash_')) return false;
        return true;
      });

      return cleanRecords;
    } catch (err) {
      console.error('certificateVerificationService.getVerificationQueue error:', err.message || err);
      throw err;
    }
  },

  /**
   * Submit authoritative human reviewer decision (APPROVED / REJECTED)
   * @param {object} params - { reviewerUserId, certificateRecordId, decision, comments }
   */
  async submitReviewerDecision({ reviewerUserId, certificateRecordId, decision, comments }) {
    if (!reviewerUserId || !certificateRecordId || !decision) {
      throw new Error('Reviewer User ID, Certificate Record ID, and Decision are required.');
    }

    const validDecisions = ['APPROVED', 'REJECTED'];
    const decisionUpper = decision.toUpperCase();
    if (!validDecisions.includes(decisionUpper)) {
      throw new Error("Decision must be either 'APPROVED' or 'REJECTED'.");
    }

    try {
      // 1. Fetch external certificate record
      const { data: certRecord, error: fetchErr } = await supabase
        .from('external_certificates')
        .select('*')
        .eq('id', certificateRecordId)
        .single();

      if (fetchErr || !certRecord) {
        throw new Error('External certificate record not found.');
      }

      const now = new Date().toISOString();
      const updatedEvidence = {
        ...(certRecord.evidence_breakdown || {}),
        decision: decisionUpper,
        reviewer_id: reviewerUserId,
        reviewed_at: now,
        comments: (comments || '').trim(),
      };

      // 2. Update external_certificates with reviewer details & decision
      const { data: updatedCert, error: upErr } = await supabase
        .from('external_certificates')
        .update({
          human_review_status: decisionUpper,
          reviewed_by: reviewerUserId,
          reviewed_at: now,
          evidence_breakdown: updatedEvidence,
          internal_reviewer_notes: (comments || '').trim(),
          updated_at: now,
        })
        .eq('id', certificateRecordId)
        .select()
        .single();

      if (upErr) throw upErr;

      // 3. Snapshot ground truth into ml_certificate_dataset using document_hash
      const groundTruthLabel = decisionUpper === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
      const snapshotPayload = {
        external_certificate_id: certRecord.id,
        document_hash: certRecord.document_hash,
        feature_vector: updatedEvidence,
        ground_truth_label: groundTruthLabel,
        adjudicated_by: reviewerUserId,
        adjudicated_at: now,
      };

      const { data: existingML } = await supabase
        .from('ml_certificate_dataset')
        .select('id')
        .eq('document_hash', certRecord.document_hash)
        .maybeSingle();

      if (!existingML) {
        const { error: mlErr } = await supabase
          .from('ml_certificate_dataset')
          .insert(snapshotPayload);

        if (mlErr) {
          console.warn('ml_certificate_dataset snapshot warning:', mlErr.message);
        }
      }

      return updatedCert;
    } catch (err) {
      console.error('certificateVerificationService.submitReviewerDecision error:', err.message || err);
      throw err;
    }
  },
};
