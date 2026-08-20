import React from 'react';
import { Calendar, CheckCircle2, ShieldAlert, Compass, Clock } from 'lucide-react';

export const AttendanceHistoryTable = ({ logs = [], role = 'student', loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-sm text-[#66706A]">
        Loading attendance history records...
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18201B]">No Attendance Records Found</h3>
        <p className="text-xs text-[#66706A]">
          There are no daily GPS check-in attendance logs recorded yet for this view.
        </p>
      </div>
    );
  }

  const isStudent = role === 'student';
  const isCompany = role === 'company';
  const isFaculty = role === 'faculty';
  const isHod = role === 'hod';
  const isTpoOrAdmin = role === 'tpo' || role === 'admin';

  return (
    <div className="bg-white rounded-xl border border-[#E1E7E2] overflow-hidden shadow-xs">
      <div className="p-4 bg-[#F8FAF9] border-b border-[#E1E7E2] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#2F8F46]" />
          <h3 className="text-sm font-bold text-[#18201B]">Attendance History ({logs.length} Entries)</h3>
        </div>
        <span className="text-xs font-semibold text-[#1F6B32] bg-[#EAF4EC] px-2.5 py-1 rounded-full">
          GPS Single Source of Truth
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
              <th className="py-3.5 px-4">Date</th>
              {!isStudent && <th className="py-3.5 px-4">Student Name</th>}
              {(isFaculty || isHod) && <th className="py-3.5 px-4">Roll Number</th>}
              {!isStudent && <th className="py-3.5 px-4">Department</th>}
              {!isStudent && <th className="py-3.5 px-4">Internship</th>}
              {(isHod || isTpoOrAdmin) && <th className="py-3.5 px-4">Company</th>}
              <th className="py-3.5 px-4">Check-In Time</th>
              <th className="py-3.5 px-4">Check-Out Time</th>
              <th className="py-3.5 px-4">Geofence Verdict</th>
              <th className="py-3.5 px-4">Distance</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
            {logs.map((log) => {
              const isVerifiedGeofence = log.geofence_status === 'VERIFIED_GEOFENCE';
              const internship = log.internship || log.internships || {};
              const studentUser = internship.users || {};
              const studentProfile = internship.student_profile || {};
              const department = studentProfile.departments || {};
              const company = internship.companies || {};

              // Real Student Name Resolution: Uses exact database full_name
              const studentName = studentUser.full_name || studentUser.email || 'Unspecified Student';
              const studentEmail = studentUser.email || '';
              const rollNo = studentProfile.roll_number || 'N/A';
              const deptName = department.department_name || 'N/A';
              const compName = company.company_name || 'N/A';
              const title = internship.internship_title || 'Internship';

              // Format Check-In Time
              const checkInTime = log.created_at
                ? new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                : log.check_in_time || '09:00 AM';

              // Format Check-Out Time (from DB, localStorage, or default)
              const savedCheckout = typeof localStorage !== 'undefined'
                ? localStorage.getItem(`checkout_${log.internship_id || internship.id}_${log.attendance_date}`)
                : null;
              const checkOutTime = log.check_out_time || savedCheckout || '05:00 PM';

              return (
                <tr key={log.id} className="hover:bg-[#F8FAF9] transition-colors">
                  {/* Date */}
                  <td className="py-3.5 px-4 font-bold text-[#18201B]">
                    {log.attendance_date}
                  </td>

                  {/* Student Name */}
                  {!isStudent && (
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#18201B]">{studentName}</div>
                      {studentEmail && <div className="text-[11px] text-[#66706A]">{studentEmail}</div>}
                    </td>
                  )}

                  {/* Roll Number */}
                  {(isFaculty || isHod) && (
                    <td className="py-3.5 px-4 font-mono font-medium text-[#18201B]">
                      {rollNo}
                    </td>
                  )}

                  {/* Department */}
                  {!isStudent && (
                    <td className="py-3.5 px-4 font-semibold text-[#18201B]">
                      {deptName}
                    </td>
                  )}

                  {/* Internship */}
                  {!isStudent && (
                    <td className="py-3.5 px-4 text-[#18201B]">
                      {title}
                    </td>
                  )}

                  {/* Company */}
                  {(isHod || isTpoOrAdmin) && (
                    <td className="py-3.5 px-4 font-semibold text-[#18201B]">
                      {compName}
                    </td>
                  )}

                  {/* Check-In Time */}
                  <td className="py-3.5 px-4 font-bold text-[#1F6B32]">
                    <span className="inline-flex items-center gap-1 bg-[#EAF4EC] px-2 py-0.5 rounded-md border border-[#C5E3CC]">
                      <Clock className="w-3 h-3 text-[#2F8F46]" />
                      {checkInTime}
                    </span>
                  </td>

                  {/* Check-Out Time */}
                  <td className="py-3.5 px-4 font-bold text-[#1F6B32]">
                    <span className="inline-flex items-center gap-1 bg-[#EAF4EC] px-2 py-0.5 rounded-md border border-[#C5E3CC]">
                      <Clock className="w-3 h-3 text-[#2F8F46]" />
                      {checkOutTime}
                    </span>
                  </td>

                  {/* Geofence Verdict */}
                  <td className="py-3.5 px-4">
                    {isVerifiedGeofence ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8F46]" />
                        VERIFIED GEOFENCE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        OUT OF BOUNDS
                      </span>
                    )}
                  </td>

                  {/* Distance */}
                  <td className="py-3.5 px-4 font-semibold text-[#18201B]">
                    {log.distance_meters !== null ? `${log.distance_meters} m` : 'N/A'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${
                      log.status === 'Present' || log.status === 'VERIFIED'
                        ? 'text-[#2F8F46]'
                        : 'text-[#D97706]'
                    }`}>
                      {log.status}
                    </span>
                  </td>

                  {/* Remarks */}
                  <td className="py-3.5 px-4 text-[#66706A] italic">
                    {log.remarks || 'No remarks'}
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
