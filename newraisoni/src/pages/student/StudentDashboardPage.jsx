import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { internshipService } from '../../services/internshipService';
import { GraduationCap, MapPin, CheckCircle, Clock, FileText, UserCheck, Mail, Building2 } from 'lucide-react';

export const StudentDashboardPage = () => {
  const { profile, user } = useAuth();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentInternship() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const masterRow = await internshipService.getMyInternship(user.id);
        setInternship(masterRow);
      } catch (err) {
        console.error('Error loading student internship:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentInternship();
  }, [user]);

  const assignedFaculty = internship?.faculty_mentors;
  const facultyUser = assignedFaculty?.users || {};
  const facultyDept = assignedFaculty?.departments?.department_name || 'Academic Dept';

  return (
    <PortalLayout title="Student Dashboard" roleLabel="Student">
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#18201B]">
              Welcome back, {profile?.full_name || 'Student'}!
            </h2>
            <p className="text-sm text-[#66706A] mt-1">
              Track your verified internship status, assigned faculty mentor, and academic placement lifecycle.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Assigned Faculty Mentor Card (Phase 5 Feature) */}
        {assignedFaculty ? (
          <div className="bg-white p-5 rounded-xl border border-[#C5E3CC] bg-[#F8FAF9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#2F8F46]" />
                <h3 className="text-sm font-bold text-[#18201B]">Assigned Academic Faculty Mentor</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
                {facultyDept}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <span className="text-[11px] font-semibold text-[#66706A]">Faculty Member</span>
                <p className="text-sm font-bold text-[#18201B]">{facultyUser.full_name || 'Faculty Mentor'}</p>
                <p className="text-xs text-[#66706A]">{assignedFaculty.designation || 'Faculty Mentor'}</p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#66706A]">Contact Email</span>
                <p className="text-xs font-semibold text-[#18201B] flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#2F8F46]" />
                  {facultyUser.email || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#66706A]">Supervised Internship</span>
                <p className="text-xs font-bold text-[#18201B] flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-[#2F8F46]" />
                  {internship?.internship_title} ({internship?.companies?.company_name})
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] text-xs text-[#66706A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D97706]" />
              <span>Academic Faculty Mentor: <strong className="text-[#18201B]">Pending Allocation by TPO</strong></span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-semibold text-[11px]">
              TPO Queue Active
            </span>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#66706A]">Attendance Engine</span>
              <MapPin className="w-4 h-4 text-[#2F8F46]" />
            </div>
            <p className="text-2xl font-bold text-[#18201B] mt-2">Geofence Ready</p>
            <p className="text-xs text-[#2F8F46] font-medium mt-1">Single Source of Truth</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#66706A]">Master Internship Status</span>
              <CheckCircle className="w-4 h-4 text-[#2F8F46]" />
            </div>
            <p className="text-xl font-bold text-[#18201B] mt-2">
              {internship?.status || 'No Internship'}
            </p>
            <p className="text-xs text-[#66706A] mt-1">
              {internship?.status === 'FACULTY_ASSIGNED' ? 'Ready for Phase 6 Active Engine' : 'Verification Pipeline Active'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#66706A]">User Account</span>
              <FileText className="w-4 h-4 text-[#2F8F46]" />
            </div>
            <p className="text-sm font-semibold text-[#18201B] mt-2 truncate">{user?.email}</p>
            <p className="text-xs text-[#2F8F46] font-medium mt-1">Role: Student Candidate</p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
