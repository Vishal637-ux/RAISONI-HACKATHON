import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { LogOut, User, Shield, ShieldCheck, Building2, GraduationCap, Award, BookOpen, LayoutDashboard, Briefcase, FileText, PlusCircle, Users, FileCheck, UserCheck, Compass, MapPin, CheckSquare, Star } from 'lucide-react';

export const PortalLayout = ({ title, roleLabel, children }) => {
  const { user, profile, role, hodDepartment, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#18201B] flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-[#E1E7E2] sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2F8F46] text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
            IT
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#18201B]">INTERTRACK</h1>
            <p className="text-xs text-[#66706A] font-medium">Institutional Internship & Verification Platform</p>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#18201B]">{profile?.full_name || user?.email}</p>
            <div className="flex items-center justify-end gap-1.5 text-xs text-[#1F6B32] font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2F8F46]"></span>
              <span>{roleLabel || ROLE_LABELS[role] || role}</span>
              {role === 'hod' && hodDepartment && (
                <span className="text-[#66706A]">({hodDepartment.name})</span>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#66706A] hover:text-[#1F6B32] hover:bg-[#EAF4EC] border border-[#E1E7E2] rounded-lg transition-colors"
            title="Sign out of InterTrack"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body with Navigation Sidebar and Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#E1E7E2] p-4 hidden md:flex flex-col justify-between">
          <nav className="space-y-1.5">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#66706A]">
              Navigation
            </div>

            {/* Role Navigation Items */}
            {role === 'student' ? (
              <>
                <Link
                  to={ROUTES.STUDENT_DASHBOARD}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_DASHBOARD
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#2F8F46]" />
                  <span>Student Dashboard</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_PROFILE}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_PROFILE
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <User className="w-4 h-4 text-[#2F8F46]" />
                  <span>Academic Profile</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_ELIGIBILITY}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_ELIGIBILITY
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#2F8F46]" />
                  <span>Eligibility Engine</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_INTERNSHIPS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_INTERNSHIPS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#2F8F46]" />
                  <span>Browse Internships</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_APPLICATIONS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_APPLICATIONS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#2F8F46]" />
                  <span>My Applications</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_ATTENDANCE}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_ATTENDANCE
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Compass className="w-4 h-4 text-[#2F8F46]" />
                  <span>GPS Attendance Check-In</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_WORK_LOGS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_WORK_LOGS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#2F8F46]" />
                  <span>Daily Work Logs</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_TASKS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_TASKS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-[#2F8F46]" />
                  <span>Tasks & Deliverables</span>
                </Link>
                <Link
                  to={ROUTES.STUDENT_PROGRESS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_PROGRESS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#2F8F46]" />
                  <span>Progress & Analytics</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_FEEDBACK}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_FEEDBACK
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Star className="w-4 h-4 text-[#2F8F46]" />
                  <span>Mentor Feedback</span>
                </Link>

                <Link
                  to={ROUTES.STUDENT_CERTIFICATE}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.STUDENT_CERTIFICATE
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#2F8F46]" />
                  <span>Digital Certificate</span>
                </Link>
              </>
            ) : role === 'faculty' ? (
              <>
                <Link
                  to={ROUTES.FACULTY_DASHBOARD}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.FACULTY_DASHBOARD
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#2F8F46]" />
                  <span>Faculty Dashboard</span>
                </Link>

                <Link
                  to={ROUTES.FACULTY_ATTENDANCE}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.FACULTY_ATTENDANCE
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Compass className="w-4 h-4 text-[#2F8F46]" />
                  <span>Mentee Attendance Logs</span>
                </Link>

                <Link
                  to={ROUTES.FACULTY_WORK_LOGS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.FACULTY_WORK_LOGS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#2F8F46]" />
                  <span>Mentee Work Logs</span>
                </Link>

                <Link
                  to={ROUTES.FACULTY_PROGRESS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.FACULTY_PROGRESS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#2F8F46]" />
                  <span>Mentee Progress</span>
                </Link>

                <Link
                  to={ROUTES.FACULTY_EVALUATION}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.FACULTY_EVALUATION
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Star className="w-4 h-4 text-[#2F8F46]" />
                  <span>Mentee Evaluations</span>
                </Link>
              </>
            ) : role === 'company' ? (
              <>
                <Link
                  to={ROUTES.COMPANY_DASHBOARD}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.COMPANY_DASHBOARD
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#2F8F46]" />
                  <span>Company Dashboard</span>
                </Link>

                <Link
                  to={ROUTES.COMPANY_POSTINGS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.COMPANY_POSTINGS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#2F8F46]" />
                  <span>Manage Postings</span>
                </Link>

                <Link
                  to={ROUTES.COMPANY_POSTING_CREATE}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.COMPANY_POSTING_CREATE
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-[#2F8F46]" />
                  <span>Post New Internship</span>
                </Link>

                <Link
                  to={ROUTES.COMPANY_APPLICANTS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.COMPANY_APPLICANTS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#2F8F46]" />
                  <span>Review Applicants</span>
                </Link>

                <Link
                  to={ROUTES.COMPANY_ATTENDANCE}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.COMPANY_ATTENDANCE
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-[#2F8F46]" />
                  <span>Geofence & Attendance</span>
                </Link>

                <Link
                  to={ROUTES.COMPANY_TASKS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.COMPANY_TASKS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-[#2F8F46]" />
                  <span>Intern Tasks</span>
                </Link>

                <Link
                  to={ROUTES.COMPANY_EVALUATION}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.COMPANY_EVALUATION
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Star className="w-4 h-4 text-[#2F8F46]" />
                  <span>Intern Evaluations</span>
                </Link>
              </>
            ) : role === 'hod' ? (
              <>
                <Link
                  to={ROUTES.HOD_DASHBOARD}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.HOD_DASHBOARD
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#2F8F46]" />
                  <span>HOD Dashboard</span>
                </Link>

                <Link
                  to={ROUTES.HOD_ATTENDANCE}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.HOD_ATTENDANCE
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Compass className="w-4 h-4 text-[#2F8F46]" />
                  <span>Department Attendance</span>
                </Link>

                <Link
                  to={ROUTES.HOD_PROGRESS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.HOD_PROGRESS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#2F8F46]" />
                  <span>Department Progress</span>
                </Link>
              </>
            ) : role === 'tpo' ? (
              <>
                <Link
                  to={ROUTES.TPO_DASHBOARD}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.TPO_DASHBOARD
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#2F8F46]" />
                  <span>TPO Dashboard</span>
                </Link>

                <Link
                  to={ROUTES.TPO_OFFER_VERIFICATION}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.TPO_OFFER_VERIFICATION
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-[#2F8F46]" />
                  <span>Offer Verification Queue</span>
                </Link>

                <Link
                  to={ROUTES.TPO_FACULTY_ASSIGNMENT}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.TPO_FACULTY_ASSIGNMENT
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-[#2F8F46]" />
                  <span>Faculty Mentor Allocation</span>
                </Link>

                <Link
                  to={ROUTES.TPO_PPO_RECORDS}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.TPO_PPO_RECORDS
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#2F8F46]" />
                  <span>Completion & PPO Records</span>
                </Link>

                <Link
                  to={ROUTES.TPO_CERTIFICATE_VERIFICATION}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    window.location.pathname === ROUTES.TPO_CERTIFICATE_VERIFICATION
                      ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#EAF4EC]'
                      : 'text-[#66706A] hover:bg-[#F8FAF9] hover:text-[#18201B]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#2F8F46]" />
                  <span>Certificate Verification AI</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#EAF4EC] text-[#1F6B32] font-semibold text-sm shadow-xs border border-[#EAF4EC]">
                <LayoutDashboard className="w-4 h-4 text-[#2F8F46]" />
                <span>{title || 'Dashboard'}</span>
              </div>
            )}
          </nav>

          {/* Department Scope Footer Banner if HOD */}
          {role === 'hod' && (
            <div className="p-3 bg-[#F5FAF6] border border-[#E1E7E2] rounded-lg text-xs">
              <span className="font-semibold text-[#1F6B32] block mb-1">Department Scope Active</span>
              <span className="text-[#66706A] block">
                {hodDepartment?.name ? `Department: ${hodDepartment.name}` : 'Department: Computer Science & Engineering (CSE)'}
              </span>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
