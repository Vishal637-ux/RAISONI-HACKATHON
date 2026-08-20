import React, { useState } from 'react';
import { CheckCircle2, Clock, XCircle, FileUp, User, Building2, AlertCircle, FileText } from 'lucide-react';
import { internshipService } from '../../services/internshipService';

export const ApplicantReviewTable = ({ applicants = [], onStatusUpdate }) => {
  const [selectedApp, setSelectedApp] = useState(null); // App selected for offer upload
  const [offerFile, setOfferFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [updatingAppId, setUpdatingAppId] = useState(null);

  if (!applicants || applicants.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Applicants Found</h3>
        <p className="text-xs text-[#66706A]">
          No student applications have been submitted for your company's internship postings yet.
        </p>
      </div>
    );
  }

  const handleShortlist = async (appId) => {
    try {
      setUpdatingAppId(appId);
      await internshipService.updateApplicationStatus(appId, 'Shortlisted');
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleReject = async (appId) => {
    if (!window.confirm('Are you sure you want to mark this applicant as Rejected?')) return;
    try {
      setUpdatingAppId(appId);
      await internshipService.updateApplicationStatus(appId, 'Rejected');
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    setUploadSuccess('');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Invalid format. Please select a PDF file (.pdf).');
      setOfferFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      setOfferFile(null);
      return;
    }

    setOfferFile(file);
  };

  const handleUploadOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp || !offerFile) {
      setUploadError('Please select an offer letter PDF file.');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadSuccess('');

      await internshipService.uploadOfferLetter(
        selectedApp.id,
        selectedApp.student_id,
        selectedApp.company_id,
        offerFile
      );

      setUploadSuccess('Offer letter uploaded successfully! Sent to TPO verification queue.');
      setTimeout(() => {
        setSelectedApp(null);
        setOfferFile(null);
        setUploadSuccess('');
        if (onStatusUpdate) onStatusUpdate();
      }, 1500);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload offer letter.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusChip = (status, offerLetter) => {
    if (offerLetter?.verification_status === 'OFFER_PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          <Clock className="w-3.5 h-3.5" />
          Offer Pending TPO
        </span>
      );
    }

    if (offerLetter?.verification_status === 'TPO_VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8F46]" />
          TPO Verified
        </span>
      );
    }

    switch (status) {
      case 'Selected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selected
          </span>
        );
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Clock className="w-3.5 h-3.5" />
            Shortlisted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'Applied':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F3F4F6] text-[#66706A] border border-[#E5E7EB]">
            <Clock className="w-3.5 h-3.5" />
            Applied
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-[#E1E7E2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
                <th className="py-3.5 px-4">Applicant Student</th>
                <th className="py-3.5 px-4">Target Opportunity</th>
                <th className="py-3.5 px-4">Academic Details</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
              {applicants.map((app) => {
                const studentUser = app.users || {};
                const profile = app.student_profile || {};
                const posting = app.internship_postings || {};
                const offerLetter = Array.isArray(app.offer_letters) ? app.offer_letters[0] : app.offer_letters;

                return (
                  <tr key={app.id} className="hover:bg-[#F8FAF9] transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-[#18201B]">
                        {studentUser.full_name || 'Student Applicant'}
                      </div>
                      <div className="text-[11px] text-[#66706A] mt-0.5">{studentUser.email}</div>
                    </td>

                    {/* Target Posting */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#18201B]">{posting.title || 'Role'}</div>
                      <div className="text-[11px] text-[#2F8F46] mt-0.5">
                        {posting.mode} • {posting.stipend}
                      </div>
                    </td>

                    {/* Academic Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#18201B]">
                        {profile.department || 'CSE'} {profile.roll_number ? `(${profile.roll_number})` : ''}
                      </div>
                      <div className="text-[11px] text-[#66706A] mt-0.5">
                        CGPA: <span className="font-bold text-[#18201B]">{profile.cgpa ?? 'N/A'}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#66706A]">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusChip(app.status, offerLetter)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'Applied' && (
                          <button
                            onClick={() => handleShortlist(app.id)}
                            disabled={updatingAppId === app.id}
                            className="px-2.5 py-1 rounded bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] font-semibold text-[11px]"
                          >
                            Shortlist
                          </button>
                        )}

                        {app.status !== 'Rejected' && app.status !== 'Selected' && (
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2F8F46] text-white hover:bg-[#1F6B32] font-semibold text-[11px]"
                          >
                            <FileUp className="w-3 h-3" />
                            Select & Issue Offer
                          </button>
                        )}

                        {app.status !== 'Rejected' && (
                          <button
                            onClick={() => handleReject(app.id)}
                            disabled={updatingAppId === app.id}
                            className="px-2.5 py-1 rounded bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] font-semibold text-[11px]"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Upload Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 border border-[#E1E7E2]">
            <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#18201B]">Issue Offer Letter</h3>
                <p className="text-xs text-[#66706A] mt-0.5">
                  Candidate: {selectedApp.users?.full_name || selectedApp.users?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setOfferFile(null);
                  setUploadError('');
                }}
                className="text-[#66706A] hover:text-[#18201B] font-bold text-lg"
              >
                ×
              </button>
            </div>

            {uploadError && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-[#EAF4EC] border border-[#C5E3CC] text-[#1F6B32] p-3 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2F8F46] shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUploadOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#18201B] mb-1.5">
                  Upload Offer Letter PDF (Max 10MB) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E1E7E2] text-xs text-[#18201B] file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#EAF4EC] file:text-[#1F6B32] hover:file:bg-[#D5EAD8]"
                />
                <p className="text-[11px] text-[#66706A] mt-1">
                  Private path: <code className="bg-[#F8FAF9] px-1 py-0.5 rounded">{selectedApp.student_id}/offer_letter.pdf</code>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4F1]">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-3.5 py-2 rounded-lg border border-[#E1E7E2] text-xs font-semibold text-[#66706A] hover:bg-[#F8FAF9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !offerFile}
                  className="px-4 py-2 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold disabled:bg-[#9CA3AF] transition-all shadow-xs"
                >
                  {uploading ? 'Uploading Offer...' : 'Upload & Select Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
