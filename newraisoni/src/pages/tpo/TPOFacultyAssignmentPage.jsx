import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { tpoService } from '../../services/tpoService';
import { FacultyAssignmentModal } from '../../components/tpo/FacultyAssignmentModal';
import { UserCheck, RefreshCw, AlertCircle, CheckCircle2, Clock, Building2, User } from 'lucide-react';

export const TPOFacultyAssignmentPage = () => {
  const { user } = useAuth();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const list = await tpoService.getVerifiedInternshipsForAssignment();
      setInternships(list);
    } catch (err) {
      console.error('Error loading verified internships for assignment:', err);
      setErrorMsg(err.message || 'Failed to load verified internships queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const stats = {
    total: internships.length,
    unassigned: internships.filter((i) => !i.faculty_id || i.status === 'TPO_VERIFIED').length,
    assigned: internships.filter((i) => i.faculty_id && i.status === 'FACULTY_ASSIGNED').length,
  };

  return (
    <PortalLayout title="Faculty Mentorship Assignment" roleLabel="Training & Placement Officer">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1F6B32] mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Phase 5 — Academic Supervision Allocation</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Faculty Mentor Allocation</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Assign qualified academic Faculty Mentors to TPO-verified student internships before active check-in begins.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh assignment queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#66706A]">Total Verified Internships</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.total}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#D97706]">Pending Mentor Assignment</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.unassigned}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#2F8F46]">Faculty Assigned</span>
            <p className="text-2xl font-bold text-[#18201B] mt-1">{stats.assigned}</p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Internships Table */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
            Loading verified internships for faculty mentor allocation...
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">No Internships Ready for Assignment</h3>
            <p className="text-xs text-[#66706A]">
              There are currently no TPO-verified student internships requiring faculty mentor assignment.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E1E7E2] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
                    <th className="py-3.5 px-4">Student Intern</th>
                    <th className="py-3.5 px-4">Company & Position</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Assigned Faculty Mentor</th>
                    <th className="py-3.5 px-4">Assignment Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
                  {internships.map((internship) => {
                    const studentUser = internship.users || {};
                    const profile = internship.student_profile || {};
                    const company = internship.companies || {};
                    const assignedFaculty = internship.faculty_mentors;
                    const facultyUser = assignedFaculty?.users || {};

                    const isAssigned = !!internship.faculty_id;

                    return (
                      <tr key={internship.id} className="hover:bg-[#F8FAF9] transition-colors">
                        {/* Student */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-sm text-[#18201B]">
                            {studentUser.full_name || 'Student Candidate'}
                          </div>
                          <div className="text-[11px] text-[#66706A] mt-0.5">{studentUser.email}</div>
                        </td>

                        {/* Company & Role */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#18201B]">{company.company_name || 'Company'}</div>
                          <div className="text-[11px] text-[#2F8F46] font-medium mt-0.5">
                            {internship.internship_title}
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#18201B]">
                            {profile.departments?.department_name || profile.department || 'Academic Department'}
                          </span>
                        </td>

                        {/* Assigned Faculty */}
                        <td className="py-3.5 px-4">
                          {isAssigned ? (
                            <div>
                              <div className="font-bold text-[#18201B]">
                                {facultyUser.full_name || 'Faculty Mentor'}
                              </div>
                              <div className="text-[11px] text-[#66706A]">
                                {facultyUser.email} • {assignedFaculty.designation || 'Faculty'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#9CA3AF] italic">Not Assigned Yet</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          {isAssigned ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8F46]" />
                              Faculty Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                              <Clock className="w-3.5 h-3.5" />
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedInternship(internship)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{isAssigned ? 'Reassign' : 'Assign Faculty'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Faculty Assignment Modal */}
        <FacultyAssignmentModal
          internship={selectedInternship}
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          onAssignmentComplete={() => loadData()}
        />
      </div>
    </PortalLayout>
  );
};
