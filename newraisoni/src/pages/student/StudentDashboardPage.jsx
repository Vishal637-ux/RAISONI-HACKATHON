import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { internshipService } from '../../services/internshipService';
import { supabase } from '../../supabase/client.js';
import {
  GraduationCap,
  MapPin,
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
  Mail,
  Building2,
} from 'lucide-react';

const TodayStatusCard = ({ internship, userId }) => {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!internship?.id) return;
    fetchTodayStatus();
  }, [internship?.id]);

  async function fetchTodayStatus() {
    try {
      setLoadingStatus(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const internshipId = internship.id;

      const { data: attRows } = await supabase
        .from('attendance')
        .select('id')
        .eq('internship_id', internshipId)
        .eq('attendance_date', todayStr);
      const attendanceDone = Boolean(attRows && attRows.length > 0);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const { data: logRows } = await supabase
        .from('work_logs')
        .select('id')
        .eq('internship_id', internshipId)
        .gte('submitted_at', todayStart.toISOString())
        .lte('submitted_at', todayEnd.toISOString());
      const worklogDone = Boolean(logRows && logRows.length > 0);

      const { data: allTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('internship_id', internshipId);
      let pendingTaskCount = 0;
      if (allTasks && allTasks.length > 0) {
        const taskIds = allTasks.map((t) => t.id);
        const { data: submissions } = await supabase
          .from('task_submissions')
          .select('task_id')
          .in('task_id', taskIds)
          .eq('student_id', userId);
        const submittedSet = new Set((submissions || []).map((s) => s.task_id));
        pendingTaskCount = taskIds.filter((id) => !submittedSet.has(id)).length;
      }

      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);
      const { data: compEvals } = await supabase
        .from('company_evaluations')
        .select('id')
        .eq('internship_id', internshipId)
        .gte('created_at', thisMonthStart.toISOString());
      const { data: facEvals } = await supabase
        .from('faculty_evaluations')
        .select('id')
        .eq('internship_id', internshipId)
        .gte('created_at', thisMonthStart.toISOString());
      const evalPending = !(compEvals?.length > 0 && facEvals?.length > 0);

      let progressPct = 0;
      if (internship.start_date && internship.end_date) {
        const start = new Date(internship.start_date).getTime();
        const end = new Date(internship.end_date).getTime();
        const now = Date.now();
        if (end > start) {
          progressPct = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
        }
      }

      setStatus({ attendanceDone, worklogDone, pendingTaskCount, evalPending, progressPct });
    } catch (err) {
      console.error('TodayStatusCard fetch error:', err.message || err);
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  if (loadingStatus) {
    return (
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs">
        <p className="text-xs text-[#66706A]">Loading today's status...</p>
      </div>
    );
  }

  if (!status) return null;

  const { attendanceDone, worklogDone, pendingTaskCount, evalPending, progressPct } = status;

  const rows = [
    {
      label: 'Aaj Attendance Jhali Ka?',
      value: attendanceDone ? 'Present' : 'Not marked yet',
      ok: attendanceDone,
      link: '/student/attendance',
      linkLabel: attendanceDone ? null : 'Mark Now',
    },
    {
      label: 'Aajcha Worklog',
      value: worklogDone ? 'Submitted' : 'Pending',
      ok: worklogDone,
      link: '/student/work-logs',
      linkLabel: worklogDone ? null : 'Submit Now',
    },
    {
      label: 'Pending Tasks',
      value:
        pendingTaskCount === 0
          ? 'All tasks done'
          : `${pendingTaskCount} task${pendingTaskCount > 1 ? 's' : ''} pending`,
      ok: pendingTaskCount === 0,
      link: '/student/tasks',
      linkLabel: pendingTaskCount > 0 ? 'View Tasks' : null,
    },
    {
      label: 'Monthly Evaluation',
      value: evalPending ? 'Pending from mentors' : 'Done this month',
      ok: !evalPending,
      link: '/student/feedback',
      linkLabel: null,
    },
  ];

  const barColor =
    progressPct >= 75 ? '#1F6B32' : progressPct >= 40 ? '#2F8F46' : '#D97706';

  return (
    <div className="bg-white rounded-xl border border-[#E1E7E2] shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E1E7E2] bg-[#F8FAF9]">
        <div className="flex items-center gap-2">
          <span className="text-lg">??</span>
          <h3 className="text-sm font-bold text-[#18201B]">Today's Internship Status</h3>
        </div>
        <span className="text-[11px] font-semibold text-[#66706A]">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>

      <div className="divide-y divide-[#F1F5F3]">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  row.ok ? 'bg-[#2F8F46]' : 'bg-[#D97706]'
                }`}
              />
              <span className="text-xs font-semibold text-[#18201B]">{row.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold flex items-center gap-1 ${
                  row.ok ? 'text-[#1F6B32]' : 'text-[#D97706]'
                }`}
              >
                {row.ok ? '?' : '?'} {row.value}
              </span>
              {row.linkLabel && (
                <Link
                  to={row.link}
                  className="px-2.5 py-1 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-[11px] font-bold rounded-lg transition-colors"
                >
                  {row.linkLabel}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-[#E1E7E2] bg-[#F8FAF9]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#18201B]">Internship Progress</span>
          <span className="text-xs font-bold text-[#2F8F46]">{progressPct}% complete</span>
        </div>
        <div className="w-full h-2 bg-[#E1E7E2] rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: barColor }}
          />
        </div>
        {internship.start_date && internship.end_date && (
          <p className="text-[10px] text-[#66706A] mt-1.5">
            {new Date(internship.start_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            &nbsp;to&nbsp;
            {new Date(internship.end_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export const StudentDashboardPage = () => {
  const { profile, user } = useAuth();

  const [internship, setInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [masterRow, myApps] = await Promise.all([
          internshipService.getMyInternship(user.id),
          internshipService.getMyApplications(user.id),
        ]);
        setInternship(masterRow);
        setApplications(myApps || []);
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [user]);

  const assignedFaculty = internship?.faculty_mentors;
  const facultyUser = assignedFaculty?.users || {};
  const facultyDept = assignedFaculty?.departments?.department_name || 'Academic Dept';

  const offerApp = (applications || []).find((a) => {
    const list = Array.isArray(a.offer_letters)
      ? a.offer_letters
      : a.offer_letters
      ? [a.offer_letters]
      : [];
    return list.length > 0;
  });

  const offerRecord = offerApp
    ? Array.isArray(offerApp.offer_letters)
      ? offerApp.offer_letters[offerApp.offer_letters.length - 1]
      : offerApp.offer_letters
    : null;

  return (
    <PortalLayout title="Student Dashboard" roleLabel="Student">
      <div className="space-y-6">
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

        {offerRecord && (
          <div className="bg-white p-5 rounded-xl border border-[#C5E3CC] bg-[#F8FAF9] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#EAF4EC] text-[#2F8F46] shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#18201B]">
                    {offerRecord.verification_status === 'TPO_VERIFIED'
                      ? '? Offer Letter Verified'
                      : '?? Offer Letter Received'}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      offerRecord.verification_status === 'TPO_VERIFIED'
                        ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]'
                        : 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                    }`}
                  >
                    {offerRecord.verification_status === 'TPO_VERIFIED'
                      ? 'TPO VERIFIED'
                      : 'Awaiting TPO Verification'}
                  </span>
                </div>
                <p className="text-xs text-[#66706A] mt-1">
                  {offerApp?.internship_postings?.companies?.company_name || 'Host Company'} has provided your internship offer letter for{' '}
                  <strong className="text-[#18201B]">
                    {offerApp?.internship_postings?.title || 'Internship Position'}
                  </strong>.
                </p>
              </div>
            </div>
            <Link
              to="/student/applications"
              className="px-4 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {offerRecord.verification_status === 'TPO_VERIFIED' ? 'View Verified Offer' : 'View Offer'}
              </span>
            </Link>
          </div>
        )}

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
              <span>
                Academic Faculty Mentor:{' '}
                <strong className="text-[#18201B]">Pending Allocation by TPO</strong>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-semibold text-[11px]">
              TPO Queue Active
            </span>
          </div>
        )}

        {internship && <TodayStatusCard internship={internship} userId={user?.id} />}

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
              {internship?.status === 'FACULTY_ASSIGNED'
                ? 'Ready for Phase 6 Active Engine'
                : 'Verification Pipeline Active'}
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
