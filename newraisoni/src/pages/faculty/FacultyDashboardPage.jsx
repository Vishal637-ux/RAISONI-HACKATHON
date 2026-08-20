import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { facultyService } from '../../services/facultyService';
import { AssignedStudentsTable } from '../../components/faculty/AssignedStudentsTable';
import { UserCheck, Users, RefreshCw, AlertCircle, Building2 } from 'lucide-react';

export const FacultyDashboardPage = () => {
  const { profile, user } = useAuth();

  const [facultyProfile, setFacultyProfile] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadFacultyData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');

      // Fetch faculty profile & assigned mentees
      const fProf = await facultyService.getFacultyProfile(user.id);
      setFacultyProfile(fProf);

      const assignedList = await facultyService.getAssignedMentees(user.id);
      setMentees(assignedList);
    } catch (err) {
      console.error('Error loading faculty dashboard data:', err);
      setErrorMsg(err.message || 'Failed to load assigned mentees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, [user]);

  return (
    <PortalLayout title="Faculty Mentor Dashboard" roleLabel="Faculty Mentor">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1F6B32] mb-1">
              <Building2 className="w-4 h-4" />
              <span>{facultyProfile?.departments?.department_name || facultyProfile?.department || 'Academic Department'}</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">
              Welcome, {profile?.full_name || 'Faculty Mentor'}!
            </h2>
            <p className="text-sm text-[#66706A] mt-1">
              Oversee your assigned student mentees, track internship progress, and verify attendance logs.
            </p>
          </div>

          <button
            onClick={loadFacultyData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh assigned mentees list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#66706A]">Assigned Student Mentees</span>
            <p className="text-2xl font-bold text-[#18201B] mt-2">{mentees.length}</p>
            <p className="text-xs text-[#2F8F46] font-semibold mt-1">Active Mentorship Allocation</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#66706A]">Department Scope</span>
            <p className="text-base font-bold text-[#18201B] mt-2 truncate">
              {facultyProfile?.departments?.department_name || facultyProfile?.department || 'CSE'}
            </p>
            <p className="text-xs text-[#66706A] mt-1">Designation: {facultyProfile?.designation || 'Faculty Mentor'}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
            <span className="text-xs font-semibold text-[#66706A]">Authenticated Account</span>
            <p className="text-sm font-semibold text-[#18201B] mt-2 truncate">{user?.email}</p>
            <p className="text-xs text-[#2F8F46] font-medium mt-1">RLS Mentee Isolation Active</p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Assigned Mentees Table */}
        <AssignedStudentsTable mentees={mentees} loading={loading} />
      </div>
    </PortalLayout>
  );
};
