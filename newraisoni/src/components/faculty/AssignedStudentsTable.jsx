import React from 'react';
import { UserCheck, Building2, User, CheckCircle2, Clock, MapPin, Mail, Phone } from 'lucide-react';

export const AssignedStudentsTable = ({ mentees = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
        Loading assigned student mentees...
      </div>
    );
  }

  if (!mentees || mentees.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Assigned Mentees Yet</h3>
        <p className="text-xs text-[#66706A] max-w-md mx-auto">
          You currently have no student mentees assigned. Once the TPO/Admin assigns student internships to your mentorship, they will appear here dynamically.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E1E7E2] overflow-hidden shadow-xs">
      <div className="p-4 bg-[#F8FAF9] border-b border-[#E1E7E2] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#2F8F46]" />
          <h3 className="text-sm font-bold text-[#18201B]">Assigned Student Mentees ({mentees.length})</h3>
        </div>
        <span className="text-xs font-semibold text-[#1F6B32] bg-[#EAF4EC] px-2.5 py-1 rounded-full">
          Academic Supervision Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
              <th className="py-3.5 px-4">Student Candidate</th>
              <th className="py-3.5 px-4">Academic Profile</th>
              <th className="py-3.5 px-4">Internship Position</th>
              <th className="py-3.5 px-4">Company & Location</th>
              <th className="py-3.5 px-4">Mentorship Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
            {mentees.map((mentee) => {
              const studentUser = mentee.users || {};
              const profile = mentee.student_profile || {};
              const company = mentee.companies || {};

              return (
                <tr key={mentee.id} className="hover:bg-[#F8FAF9] transition-colors">
                  {/* Student */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-sm text-[#18201B]">
                      {studentUser.full_name || 'Student Candidate'}
                    </div>
                    <div className="text-[11px] text-[#66706A] mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#2F8F46]" />
                        {studentUser.email}
                      </span>
                      {studentUser.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#66706A]" />
                          {studentUser.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Academic Profile */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#18201B]">
                      {profile.departments?.department_name || profile.department || 'Academic Department'}
                    </div>
                    <div className="text-[11px] text-[#66706A] mt-0.5">
                      Roll: <span className="font-semibold text-[#18201B]">{profile.roll_number || 'N/A'}</span> • CGPA:{' '}
                      <span className="font-semibold text-[#18201B]">{profile.cgpa ?? 'N/A'}</span>
                    </div>
                  </td>

                  {/* Internship Position */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#18201B]">{mentee.internship_title}</div>
                    <div className="text-[11px] text-[#2F8F46] font-semibold mt-0.5">
                      {mentee.status}
                    </div>
                  </td>

                  {/* Company & Location */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#18201B]">{company.company_name}</div>
                    <div className="text-[11px] text-[#66706A] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#2F8F46]" />
                      <span>{mentee.work_location || 'Office Location'}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8F46]" />
                      Assigned Mentee
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
