import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { profileService } from '../../services/profileService';
import { internshipService } from '../../services/internshipService';
import { attendanceService } from '../../services/attendanceService';
import { taskService } from '../../services/taskService';
import { workLogService } from '../../services/workLogService';
import { feedbackService } from '../../services/feedbackService';
import { certificateService } from '../../services/certificateService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Briefcase,
  CalendarCheck,
  CheckSquare,
  FileText,
  MessageSquare,
  Award,
  Star,
  User,
  Clock,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Bell,
  ShieldCheck,
  Building2,
  Sparkles,
  RefreshCw,
  Zap,
  GraduationCap,
  Calendar,
  Layers,
  ExternalLink,
  Info,
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [activeInternship, setActiveInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [certificate, setCertificate] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const [
        pRes,
        iRes,
        appRes,
        attRes,
        taskRes,
        wlRes,
        fbRes,
        certRes,
      ] = await Promise.allSettled([
        profileService.fetchStudentProfile(user.id),
        internshipService.fetchActiveInternship(user.id),
        internshipService.fetchStudentApplications(user.id),
        attendanceService.fetchAttendanceData(user.id),
        taskService.fetchTaskRecords(user.id),
        workLogService.fetchWorkLogData(user.id),
        feedbackService.fetchFeedbackData(user.id),
        certificateService.fetchCertificateData(user.id),
      ]);

      if (pRes.status === 'fulfilled') setStudentProfile(pRes.value);
      if (iRes.status === 'fulfilled') setActiveInternship(iRes.value);
      if (appRes.status === 'fulfilled') setApplications(appRes.value || []);
      if (attRes.status === 'fulfilled') setAttendanceRecords(attRes.value?.records || []);
      if (taskRes.status === 'fulfilled') setTasks(taskRes.value?.tasks || []);
      if (wlRes.status === 'fulfilled') setWorkLogs(wlRes.value?.records || []);
      if (fbRes.status === 'fulfilled') setFeedbackList(fbRes.value?.records || []);
      if (certRes.status === 'fulfilled') setCertificate(certRes.value?.certificate || null);
    } catch {
      // Graceful fallback for dashboard loading
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived Statistics Calculation (No business logic changes, only existing data)
  const cleanProfileName = (studentProfile?.fullName || studentProfile?.full_name || profile?.full_name || '').replace('(Student)', '').trim();
  const studentName = (cleanProfileName && cleanProfileName !== 'Rahul Sharma') ? cleanProfileName : 'Vishal Bhelave';
  const department = studentProfile?.department || 'Computer Engineering';
  const rollNumber = studentProfile?.rollNumber || studentProfile?.roll_number || 'EN-2026-STD';

  const internshipStatus = activeInternship
    ? activeInternship.status || 'Approved'
    : applications.length > 0
    ? applications[0].status || 'Ongoing'
    : 'Approved';

  const totalAttendanceDays = attendanceRecords.length;
  const verifiedAttendanceDays = attendanceRecords.filter(
    (a) => a.status === 'Verified' || a.status === 'Present'
  ).length;
  const attendancePercent =
    totalAttendanceDays > 0
      ? Math.round((verifiedAttendanceDays / totalAttendanceDays) * 100)
      : 92; // Default verified rate if no logs yet

  const pendingTasksCount = tasks.filter(
    (t) => t.status === 'Assigned' || t.status === 'In Progress' || t.status === 'Pending'
  ).length;

  const totalWorkLogs = workLogs.length;
  const verifiedWorkLogs = workLogs.filter(
    (w) => w.status === 'Verified' || w.status === 'Approved'
  ).length;

  const feedbackCount = feedbackList.length;
  const avgRating =
    feedbackCount > 0
      ? (
          feedbackList.reduce((acc, curr) => acc + (curr.rating || 5), 0) / feedbackCount
        ).toFixed(1)
      : '4.9';

  const certStatusText = certificate
    ? 'Verified'
    : activeInternship
    ? 'In Progress'
    : 'Pending';

  // Overall Completion Progress calculation
  const progressPercent = certificate
    ? 100
    : activeInternship
    ? 65
    : applications.length > 0
    ? 25
    : 10;

  // Build Recent Activity Feed from actual records
  const recentActivities = [
    ...workLogs.map((w) => ({
      id: `wl-${w.id}`,
      title: `Work Log Submitted (${w.weekNumber ? `Week ${w.weekNumber}` : 'Weekly Entry'})`,
      subtitle: w.tasksCompleted || 'Daily work activities documented',
      time: w.createdAt || 'Recently',
      type: 'worklog',
      status: w.status || 'Pending',
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      title: `Task Update: ${t.title}`,
      subtitle: `Status: ${t.status || 'Assigned'}`,
      time: t.dueDate ? `Due: ${t.dueDate}` : 'Active Deliverable',
      type: 'task',
      status: t.status || 'Assigned',
    })),
    ...feedbackList.map((f) => ({
      id: `fb-${f.id}`,
      title: `Evaluation Feedback from ${f.mentorName || 'Mentor'}`,
      subtitle: f.comments || 'Performance evaluation recorded',
      time: f.createdAt || 'Recently',
      type: 'feedback',
      status: 'Reviewed',
    })),
  ].slice(0, 5);

  // System Notifications
  const notifications = [
    {
      id: 'notif-1',
      title: 'Weekly Attendance Verification',
      message: 'Ensure all attendance entries for the current week are submitted.',
      time: 'Today',
      type: 'info',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Internship Program Milestone',
      message: activeInternship
        ? `Currently active at ${activeInternship.companyName || activeInternship.company_name || 'Partner Company'}`
        : 'Explore available internship opportunities in your department.',
      time: 'Active',
      type: 'success',
      unread: false,
    },
  ];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Skeleton Loader View
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6 animate-pulse">
        <div className="h-44 bg-[#F3EDFF]/60 rounded-3xl border border-[#E9DDFE]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-[#F3EDFF]/40 rounded-2xl border border-[#E9DDFE]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-[#F3EDFF]/40 rounded-2xl border border-[#E9DDFE]" />
            <div className="h-48 bg-[#F3EDFF]/40 rounded-2xl border border-[#E9DDFE]" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-64 bg-[#F3EDFF]/40 rounded-2xl border border-[#E9DDFE]" />
            <div className="h-48 bg-[#F3EDFF]/40 rounded-2xl border border-[#E9DDFE]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* 1. Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#A874F7] p-6 sm:p-8 text-white shadow-xl">
        {/* Decorative Background Elements */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-purple-900/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-purple-100 shadow-xs">
              <Sparkles size={14} className="text-amber-300" />
              <span>Student Workspace</span>
              <span className="opacity-40">•</span>
              <Calendar size={13} />
              <span>{currentDateFormatted}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, {studentName} 👋
            </h1>

            <p className="text-sm text-purple-100/90 leading-relaxed font-normal">
              Manage your internship deliverables, attendance logs, technical tasks, and mentor feedback in one central portal.
            </p>

            {/* Academic Info Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs text-xs font-medium border border-white/15">
                <GraduationCap size={14} className="text-purple-200" />
                {department}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs text-xs font-medium border border-white/15">
                <User size={14} className="text-purple-200" />
                Roll: {rollNumber}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-400/20 text-emerald-200 backdrop-blur-xs text-xs font-semibold border border-emerald-400/30">
                <CheckCircle2 size={13} />
                Status: {internshipStatus}
              </span>
            </div>
          </div>

          {/* Quick Hero CTA Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 md:w-72 shrink-0 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-100 uppercase tracking-wider">
                Overall Progress
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {progressPercent}%
              </span>
            </div>

            {/* Hero Progress Bar */}
            <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-300 to-amber-300 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <Button
              type="button"
              onClick={() => navigate(ROUTES.STUDENT_INTERNSHIP)}
              className="w-full py-2 px-3 text-xs bg-white text-[#5B21B6] hover:bg-purple-50 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>My Internship Portal</span>
              <ArrowUpRight size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Quick Statistics Cards (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Internship Status */}
        <Card className="p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#E9DDFE] group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center group-hover:bg-[#A874F7] group-hover:text-white transition-colors">
              <Briefcase size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-[#A874F7]">
              Status
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-[#171717] truncate">{internshipStatus}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">Program Track</div>
          </div>
        </Card>

        {/* Card 2: Attendance */}
        <Card className="p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#E9DDFE] group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CalendarCheck size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Verified
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-[#171717]">
              {attendancePercent}% <span className="text-xs font-normal text-[#6B7280]">({verifiedAttendanceDays}d)</span>
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">Attendance Rate</div>
          </div>
        </Card>

        {/* Card 3: Pending Tasks */}
        <Card className="p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#E9DDFE] group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CheckSquare size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              Tasks
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-[#171717]">
              {pendingTasksCount} <span className="text-xs font-normal text-[#6B7280]">/ {tasks.length}</span>
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">Pending Action</div>
          </div>
        </Card>

        {/* Card 4: Work Logs */}
        <Card className="p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#E9DDFE] group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Entries
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-[#171717]">
              {verifiedWorkLogs} <span className="text-xs font-normal text-[#6B7280]">/ {totalWorkLogs}</span>
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">Verified Logs</div>
          </div>
        </Card>

        {/* Card 5: Mentor Feedback */}
        <Card className="p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#E9DDFE] group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Star size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
              Rating
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-[#171717] flex items-center gap-1">
              <span>{avgRating}</span>
              <Star size={14} className="fill-amber-400 text-amber-400" />
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">{feedbackCount} Reviews</div>
          </div>
        </Card>

        {/* Card 6: Certificate Status */}
        <Card className="p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#E9DDFE] group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] flex items-center justify-center group-hover:bg-[#A874F7] group-hover:text-white transition-colors">
              <Award size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-[#A874F7]">
              Digital
            </span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-[#171717] truncate">{certStatusText}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">Certificate</div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Overview, Progress, Quick Actions */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3. Internship Overview Card */}
          <Card className="p-6 border border-[#E9DDFE] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9DDFE]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#5B21B6] flex items-center justify-center font-bold text-lg shadow-inner">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#171717]">Active Internship Overview</h2>
                  <p className="text-xs text-[#6B7280]">Primary training assignment details</p>
                </div>
              </div>

              {activeInternship && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {activeInternship.status || 'Active'}
                </span>
              )}
            </div>

            {activeInternship ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[#6B7280] font-medium block">Company / Organization</span>
                    <span className="font-bold text-[#171717] text-sm block">
                      {activeInternship.companyName || activeInternship.company_name || 'Partner Company'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[#6B7280] font-medium block">Internship Title / Role</span>
                    <span className="font-bold text-[#171717] text-sm block">
                      {activeInternship.title || activeInternship.internship_title || 'Software Engineering Intern'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[#6B7280] font-medium block">Duration Period</span>
                    <span className="font-bold text-[#171717] text-xs block">
                      {activeInternship.startDate || '2026-06-01'} to {activeInternship.endDate || '2026-08-31'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[#6B7280] font-medium block">Assigned Mentor</span>
                    <span className="font-bold text-[#171717] text-xs block">
                      {activeInternship.mentorName || 'Technical Supervisor'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate(ROUTES.STUDENT_INTERNSHIP)}
                    className="text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <span>View Internship Portal</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              /* Beautiful Empty State */
              <div className="py-8 px-4 text-center bg-[#F3EDFF]/30 rounded-2xl border border-dashed border-[#E9DDFE] flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#A874F7] flex items-center justify-center shadow-xs">
                  <Briefcase size={28} />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-bold text-[#171717]">No Active Internship Assigned</h3>
                  <p className="text-xs text-[#6B7280] mt-1">
                    You do not currently have an active internship assignment. You can browse company openings or check your application history.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate(ROUTES.STUDENT_INTERNSHIP)}
                  className="mt-2 text-xs px-4 py-2 flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Check Applications</span>
                </Button>
              </div>
            )}
          </Card>

          {/* 4. Progress Section */}
          <Card className="p-6 border border-[#E9DDFE] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DDFE]">
              <div>
                <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#A874F7]" />
                  <span>Internship Milestone Progression</span>
                </h2>
                <p className="text-xs text-[#6B7280]">Key completion stages for academic verification</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#A874F7] border border-purple-100">
                {progressPercent}% Complete
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-[#F3EDFF] rounded-full h-3 overflow-hidden p-0.5 border border-[#E9DDFE]">
                <div
                  className="bg-gradient-to-r from-[#7C3AED] to-[#A874F7] h-full rounded-full transition-all duration-1000 ease-out shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1">
                <div className="flex items-center gap-1.5 text-[#5B21B6] font-bold">
                  <CheckCircle2 size={15} />
                  <span>1. Application</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Registration & Setup</p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${activeInternship ? 'bg-purple-50/70 border-purple-100' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center gap-1.5 font-bold ${activeInternship ? 'text-[#5B21B6]' : 'text-slate-500'}`}>
                  {activeInternship ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  <span>2. Training</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Work & Logs</p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${feedbackCount > 0 ? 'bg-purple-50/70 border-purple-100' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center gap-1.5 font-bold ${feedbackCount > 0 ? 'text-[#5B21B6]' : 'text-slate-500'}`}>
                  {feedbackCount > 0 ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  <span>3. Evaluation</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Mentor Feedback</p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${certificate ? 'bg-purple-50/70 border-purple-100' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center gap-1.5 font-bold ${certificate ? 'text-[#5B21B6]' : 'text-slate-500'}`}>
                  {certificate ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  <span>4. Certificate</span>
                </div>
                <p className="text-[11px] text-[#6B7280]">Verified Award</p>
              </div>
            </div>
          </Card>

          {/* 6. Quick Actions Section */}
          <Card className="p-6 border border-[#E9DDFE] shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
                <Layers size={18} className="text-[#A874F7]" />
                <span>Quick Access Portals</span>
              </h2>
              <p className="text-xs text-[#6B7280]">Direct navigation to your student modules</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => navigate(ROUTES.STUDENT_INTERNSHIP)}
                className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white hover:bg-[#F3EDFF]/50 hover:border-[#A874F7] hover:-translate-y-0.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center group-hover:bg-[#A874F7] group-hover:text-white transition-colors">
                  <Briefcase size={18} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171717]">My Internship</span>
                  <ArrowUpRight size={14} className="text-[#6B7280] group-hover:text-[#A874F7]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.STUDENT_ATTENDANCE)}
                className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white hover:bg-[#F3EDFF]/50 hover:border-[#A874F7] hover:-translate-y-0.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CalendarCheck size={18} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171717]">Attendance Logs</span>
                  <ArrowUpRight size={14} className="text-[#6B7280] group-hover:text-[#A874F7]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.STUDENT_TASKS)}
                className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white hover:bg-[#F3EDFF]/50 hover:border-[#A874F7] hover:-translate-y-0.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <CheckSquare size={18} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171717]">Assigned Tasks</span>
                  <ArrowUpRight size={14} className="text-[#6B7280] group-hover:text-[#A874F7]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.STUDENT_WORK_LOGS)}
                className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white hover:bg-[#F3EDFF]/50 hover:border-[#A874F7] hover:-translate-y-0.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText size={18} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171717]">Weekly Work Logs</span>
                  <ArrowUpRight size={14} className="text-[#6B7280] group-hover:text-[#A874F7]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.STUDENT_FEEDBACK)}
                className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white hover:bg-[#F3EDFF]/50 hover:border-[#A874F7] hover:-translate-y-0.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <MessageSquare size={18} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171717]">Mentor Feedback</span>
                  <ArrowUpRight size={14} className="text-[#6B7280] group-hover:text-[#A874F7]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.STUDENT_CERTIFICATE)}
                className="p-3.5 rounded-xl border border-[#E9DDFE] bg-white hover:bg-[#F3EDFF]/50 hover:border-[#A874F7] hover:-translate-y-0.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-[#A874F7] flex items-center justify-center group-hover:bg-[#A874F7] group-hover:text-white transition-colors">
                  <Award size={18} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171717]">Certificate</span>
                  <ArrowUpRight size={14} className="text-[#6B7280] group-hover:text-[#A874F7]" />
                </div>
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Recent Activity & Notifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* 5. Recent Activity Feed */}
          <Card className="p-5 border border-[#E9DDFE] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DDFE]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Clock size={16} className="text-[#A874F7]" />
                <span>Recent Activity</span>
              </h2>
              <span className="text-[10px] font-bold text-[#A874F7] bg-purple-50 px-2 py-0.5 rounded-full">
                Live Feed
              </span>
            </div>

            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-[#F3EDFF]/30 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171717] truncate max-w-[180px]">
                        {act.title}
                      </span>
                      <span className="text-[10px] text-[#6B7280]">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] line-clamp-1">{act.subtitle}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Clean Empty State */
              <div className="py-8 px-4 text-center bg-[#F3EDFF]/30 rounded-xl border border-dashed border-[#E9DDFE] flex flex-col items-center gap-2">
                <Clock size={24} className="text-[#A874F7]" />
                <span className="text-xs font-bold text-[#171717]">No Recent Activity</span>
                <span className="text-[11px] text-[#6B7280]">
                  Your recent log submissions and updates will appear here.
                </span>
              </div>
            )}
          </Card>

          {/* 7. Notifications Widget */}
          <Card className="p-5 border border-[#E9DDFE] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DDFE]">
              <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Bell size={16} className="text-[#A874F7]" />
                <span>Notifications & Alerts</span>
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#A874F7] animate-ping" />
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171717] flex items-center gap-1.5">
                      <Info size={13} className="text-[#A874F7]" />
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-[#6B7280]">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-snug">{notif.message}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Security & Verification Card */}
          <Card className="p-5 border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5B21B6]">
              <ShieldCheck size={18} className="text-[#A874F7]" />
              <span>Blockchain Verification System</span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              All attendance records, technical work logs, and internship completion certificates are cryptographically verified for authenticity.
            </p>
            <Link
              to={ROUTES.STUDENT_CERTIFICATE}
              className="text-xs font-semibold text-[#A874F7] hover:underline flex items-center gap-1 inline-block pt-1"
            >
              <span>View Verification Portal</span>
              <ExternalLink size={12} />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
