import React, { useState, useEffect } from 'react';
import { UserCheck, Building2, User, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { facultyService } from '../../services/facultyService';
import { tpoService } from '../../services/tpoService';

export const FacultyAssignmentModal = ({ internship, isOpen, onClose, onAssignmentComplete }) => {
  const [facultyMentors, setFacultyMentors] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadFaculty() {
      if (!internship) return;
      try {
        setLoading(true);
        setErrorMsg('');
        const deptId = internship.student_profile?.department_id || null;

        // Fetch department-matched faculty mentors
        let mentors = await facultyService.getEligibleFacultyMentors(deptId);

        // Fallback: If no department-matched mentors, load all faculty mentors
        if (!mentors || mentors.length === 0) {
          mentors = await facultyService.getEligibleFacultyMentors(null);
        }

        setFacultyMentors(mentors);

        // Pre-select currently assigned faculty if present
        if (internship.faculty_id) {
          setSelectedFacultyId(internship.faculty_id);
        } else if (mentors.length > 0) {
          setSelectedFacultyId(mentors[0].id);
        }
      } catch (err) {
        setErrorMsg('Failed to load eligible faculty mentors list.');
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && internship) {
      loadFaculty();
    }
  }, [isOpen, internship]);

  if (!isOpen || !internship) return null;

  const studentUser = internship.users || {};
  const studentProfile = internship.student_profile || {};
  const company = internship.companies || {};

  const selectedFaculty = facultyMentors.find((f) => f.id === selectedFacultyId);
  const isDeptMatch = selectedFaculty && studentProfile.department_id && selectedFaculty.department_id === studentProfile.department_id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacultyId) {
      setErrorMsg('Please select a Faculty Mentor to assign.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      await tpoService.assignFacultyMentor(internship.id, selectedFacultyId);

      setSuccessMsg('Faculty Mentor assigned successfully! Status updated to FACULTY_ASSIGNED.');
      setTimeout(() => {
        onClose();
        if (onAssignmentComplete) onAssignmentComplete();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to assign Faculty Mentor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-[#E1E7E2]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18201B]">
                {internship.faculty_id ? 'Reassign Faculty Mentor' : 'Assign Faculty Mentor'}
              </h3>
              <p className="text-xs text-[#66706A]">Institutional Mentorship Allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#66706A] hover:text-[#18201B] font-bold text-lg"
          >
            ×
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#EAF4EC] border border-[#C5E3CC] text-[#1F6B32] p-3 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2F8F46] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Internship Summary Card */}
        <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#E1E7E2] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#2F8F46] font-bold">
              <User className="w-3.5 h-3.5" />
              <span>{studentUser.full_name || 'Student Intern'}</span>
            </div>
            <span className="bg-[#EAF4EC] text-[#1F6B32] px-2 py-0.5 rounded font-semibold text-[11px]">
              {studentProfile.departments?.department_name || studentProfile.department || 'Academic Department'}
            </span>
          </div>
          <p className="text-[#66706A]">
            Internship: <span className="font-semibold text-[#18201B]">{internship.internship_title}</span>
          </p>
          <p className="text-[#66706A]">
            Company: <span className="font-semibold text-[#18201B]">{company.company_name}</span> • Location:{' '}
            <span className="font-semibold text-[#18201B]">{internship.work_location || 'Office'}</span>
          </p>
        </div>

        {/* Assignment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#18201B] mb-1.5">
              Select Faculty Mentor <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="p-3 text-xs text-[#66706A] bg-[#F8FAF9] rounded-lg border border-[#E1E7E2]">
                Loading eligible faculty mentors...
              </div>
            ) : facultyMentors.length === 0 ? (
              <div className="p-3 text-xs text-[#DC2626] bg-[#FEF2F2] rounded-lg border border-[#FCA5A5]">
                No active faculty mentors registered in system.
              </div>
            ) : (
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-[#E1E7E2] text-xs font-medium text-[#18201B] bg-white focus:outline-none focus:border-[#2F8F46]"
              >
                {facultyMentors.map((faculty) => {
                  const fUser = faculty.users || {};
                  const fDept = faculty.departments?.department_name || faculty.department || 'Faculty';
                  return (
                    <option key={faculty.id} value={faculty.id}>
                      {fUser.full_name || fUser.email} — {fDept} ({faculty.designation || 'Faculty Mentor'})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Department Match Badge */}
          {selectedFaculty && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
              isDeptMatch
                ? 'bg-[#EAF4EC] text-[#1F6B32] border-[#C5E3CC]'
                : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
            }`}>
              {isDeptMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#2F8F46] shrink-0" />
                  <span>Department Match Verified: Faculty and Student are both in same department.</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>Cross-Department Notice: Faculty member belongs to a different department.</span>
                </>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4F1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E1E7E2] text-xs font-semibold text-[#66706A] hover:bg-[#F8FAF9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading || facultyMentors.length === 0}
              className="px-5 py-2 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold disabled:bg-[#9CA3AF] transition-all shadow-xs"
            >
              {submitting ? 'Assigning Mentor...' : internship.faculty_id ? 'Confirm Reassignment' : 'Assign Faculty Mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
