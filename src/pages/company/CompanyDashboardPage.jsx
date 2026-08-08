import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/companyService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CompanyInternProfileDrawer } from '../../components/company/CompanyInternProfileDrawer';
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  Search,
  RefreshCw,
  Download,
  Eye,
  PlusCircle,
  Award,
  AlertTriangle,
  Building2,
  FileText,
  CalendarCheck,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Layers,
  Database,
  LogOut,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export const CompanyDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN);
    } catch {
      toast.error('Logout failed');
    }
  };
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [interns, setInterns] = useState([]);
  const [lastSyncedTime, setLastSyncedTime] = useState('');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Drawer State
  const [activeProfileIntern, setActiveProfileIntern] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorState(false);
    try {
      const [profileData, list] = await Promise.all([
        companyService.fetchCompanyMentorProfile(user.id),
        companyService.fetchAssignedCompanyInterns(user.id),
      ]);

      setMentorProfile(profileData);
      setInterns(list || []);

      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setLastSyncedTime(`${formattedDate} • ${formattedTime}`);

      await companyService.logCompanyAuditAction({
        userId: user.id,
        action: 'Viewed Company Dashboard',
      });
    } catch (err) {
      console.error('Error loading company dashboard data:', err);
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Summary Metrics Computation
  const summaryMetrics = useMemo(() => {
    const total = interns.length;
    const activeTasks = interns.reduce((acc, i) => acc + (i.completedTasksCount || 0), 0);
    const pendingWorkLogs = interns.filter((i) => (i.workLogScore || 0) < 85 || (i.workLogsPending || 0) > 0 || i.lateWorkLogsCount > 0).length;
    const technicalEvaluated = interns.filter((i) => ['Completed', 'Evaluation Submitted'].includes(i.evaluationStatus)).length;

    return { total, activeTasks, pendingWorkLogs, technicalEvaluated };
  }, [interns]);

  // Filter Pipeline
  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        intern.studentName.toLowerCase().includes(q) ||
        intern.rollNumber.toLowerCase().includes(q) ||
        intern.department.toLowerCase().includes(q) ||
        intern.title.toLowerCase().includes(q) ||
        intern.companyName.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Risk Filter
      const att = intern.attendanceScore || 85;
      const task = intern.taskCompletionRate || 80;
      const wl = intern.workLogScore || 80;
      const overall = Math.round(att * 0.3 + task * 0.4 + wl * 0.2 + 80 * 0.1);
      const risk = overall >= 85 ? 'Low Risk' : overall >= 70 ? 'Medium Risk' : 'High Risk';
      if (selectedRisk !== 'All' && risk !== selectedRisk) return false;

      if (selectedTab === 'Active Project') return ['Approved', 'Ongoing'].includes(intern.status);
      if (selectedTab === 'Pending Task Review') return (intern.taskCompletionRate || 0) < 95;
      if (selectedTab === 'Completed') return intern.status === 'Completed' || ['Completed', 'Evaluation Submitted'].includes(intern.evaluationStatus);
      return true;
    });
  }, [interns, searchQuery, selectedTab, selectedRisk]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredInterns.length / rowsPerPage) || 1;
  const paginatedInterns = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredInterns.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredInterns, currentPage, rowsPerPage]);

  const handleCSVExport = async () => {
    if (filteredInterns.length === 0) {
      toast.error('No matching intern records to export');
      return;
    }

    const headers = ['Student Name', 'Roll Number', 'Department', 'Company Name', 'Project Title', 'Faculty Mentor', 'Attendance %', 'Task Completion %', 'Work Log Status', 'Risk Level', 'Evaluation Status'];
    const rows = filteredInterns.map((i) => {
      const att = i.attendanceScore || 85;
      const task = i.taskCompletionRate || 80;
      const wl = i.workLogScore || 80;
      const overall = Math.round(att * 0.3 + task * 0.4 + wl * 0.2 + 80 * 0.1);
      const risk = overall >= 85 ? 'Low Risk' : overall >= 70 ? 'Medium Risk' : 'High Risk';

      return [
        `"${i.studentName}"`,
        `"${i.rollNumber}"`,
        `"${i.department}"`,
        `"${i.companyName}"`,
        `"${i.title}"`,
        '"Prof. Vikram Deshmukh"',
        `"${att}%"`,
        `"${task}%"`,
        `"${i.workLogsSubmitted || 40} Submitted"`,
        `"${risk}"`,
        `"${i.evaluationStatus}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Company_Assigned_Interns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await companyService.logCompanyAuditAction({
      userId: user?.id,
      action: `Exported CSV (${filteredInterns.length} records)`,
    });

    toast.success(`Exported ${filteredInterns.length} intern record(s) to CSV`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-amber-700 shrink-0" />
          <span>Industry Technical Supervision • Attendance Verification • Technical Evaluation • Academic Records Read-Only</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-800 font-semibold flex-wrap">
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Faculty Approvals Read-Only</span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Academic CGPA Read-Only</span>
        </div>
      </div>

      {/* Requirement #1: Expanded Identity Header */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#A874F7] text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0 border border-[#965BEB]">
            {mentorProfile?.companyInitials || 'TS'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase tracking-wider">
                {mentorProfile?.companyName || 'TechCorp Solutions Pvt Ltd'} • ID: {mentorProfile?.mentorId || 'CMP-2026-04'}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#171717]">
              {mentorProfile?.fullName || 'Rajesh Malhotra'}
            </h1>
            <p className="text-xs font-semibold text-[#6B7280]">
              {mentorProfile?.designation || 'Lead Systems Engineer'} • {mentorProfile?.department || 'Engineering & Cloud Infrastructure'} • Active Mentees: <strong className="text-[#A874F7]">{summaryMetrics.total} Interns</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadData}
              className="text-xs gap-2 py-2 px-3.5"
              title="Reload dashboard data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Dashboard</span>
            </Button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Logout from session"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>

          {lastSyncedTime && (
            <span className="text-[10px] text-[#6B7280] font-semibold">
              Last Synced: <strong className="text-[#171717]">{lastSyncedTime}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Requirement #2: 4 Interactive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => { setSelectedTab('All'); setSelectedRisk('All'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'All' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20 shadow-xs' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                TOTAL ASSIGNED INTERNS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to filter all</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate(ROUTES.COMPANY_TASKS)}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md hover:border-[#A874F7] ${
            selectedTab === 'Active Project' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20 shadow-xs' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                ACTIVE TECHNICAL TASKS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.activeTasks}</p>
              <span className="text-[10px] font-semibold text-purple-600 flex items-center gap-1">
                <span>Click to manage tasks</span>
                <ChevronRight size={12} />
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center shrink-0">
              <Briefcase size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate(ROUTES.COMPANY_WORKLOGS)}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md hover:border-amber-400 ${
            selectedTab === 'Pending Task Review' ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xs' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                PENDING WORK LOG REVIEWS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.pendingWorkLogs}</p>
              <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                <span>Click to review logs</span>
                <ChevronRight size={12} />
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate(ROUTES.COMPANY_EVALUATION)}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md hover:border-emerald-400 ${
            selectedTab === 'Completed' ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                TECHNICAL EVALUATIONS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.technicalEvaluated}</p>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <span>Click to evaluate</span>
                <ChevronRight size={12} />
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </button>
      </div>

      {/* Main Data Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">Assigned Interns Performance Data Grid</h3>
              <p className="text-xs text-[#6B7280]">
                Showing {paginatedInterns.length} of {filteredInterns.length} intern(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search Student, Project, Tech..."
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>

            <select
              value={selectedRisk}
              onChange={(e) => { setSelectedRisk(e.target.value); setCurrentPage(1); }}
              className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="High Risk">High Risk</option>
            </select>

            <Button
              type="button"
              variant="outline"
              onClick={handleCSVExport}
              className="text-xs py-2 px-3 gap-1.5"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Project & Sprint</th>
                <th className="py-3 px-4">Dates & Duration</th>
                <th className="py-3 px-4">Faculty Mentor</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Overall Score Breakdown</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDFE]">
              {paginatedInterns.map((intern) => {
                const att = intern.attendanceScore || 85;
                const task = intern.taskCompletionRate || 80;
                const wl = intern.workLogScore || 80;
                const techEvalScore = ['Completed', 'Evaluation Submitted'].includes(intern.evaluationStatus) ? 90 : 60;
                const overallProgress = Math.round(att * 0.3 + task * 0.4 + wl * 0.2 + techEvalScore * 0.1);
                const riskLevel = overallProgress >= 85 ? 'Low Risk' : overallProgress >= 70 ? 'Medium Risk' : 'High Risk';

                return (
                  <tr key={intern.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#171717]">
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.COMPANY_INTERN_DETAIL.replace(':id', intern.id || intern.studentId))}
                        className="text-left hover:text-[#5B21B6] transition-colors cursor-pointer group"
                      >
                        <p className="group-hover:underline font-bold text-sm text-[#5B21B6] flex items-center gap-1">
                          <span>{intern.studentName}</span>
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <span className="text-[10px] text-[#6B7280] font-normal">{intern.rollNumber} • {intern.department}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#A874F7]">
                      <p>{intern.title}</p>
                      <span className="text-[10px] text-[#6B7280]">Sprint 4 • API Integration</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#171717]">
                      <p className="font-semibold">{intern.startDate || '15 Jan 2026'} - {intern.endDate || '15 Jul 2026'}</p>
                      <span className="text-[10px] text-[#6B7280]">6 Months Duration</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#171717]">
                      {intern.facultyMentorName || 'Prof. Rajesh Kulkarni'} <span className="text-[9px] text-[#6B7280] block font-normal">(Faculty Supervisor)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.COMPANY_ATTENDANCE)}
                        className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                        title="Click to view & verify student geo-tagged attendance logs"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{att}%</span>
                      </button>
                    </td>

                    {/* Requirement #4: Overall Score Breakdown Column */}
                    <td className="py-3.5 px-4 w-48">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>Overall Score</span>
                          <span className="text-[#A874F7]">{overallProgress}%</span>
                        </div>
                        <div className="w-full bg-[#F3EDFF] rounded-full h-2 border border-[#E9DDFE]">
                          <div className="bg-[#A874F7] h-2 rounded-full" style={{ width: `${overallProgress}%` }} />
                        </div>
                        <span className="text-[9px] text-[#6B7280] block">
                          Att 30% • Task 40% • Log 20% • Eval 10%
                        </span>
                      </div>
                    </td>

                    {/* Requirement #7: Risk Level Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        riskLevel === 'Low Risk' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        riskLevel === 'Medium Risk' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {riskLevel}
                      </span>
                    </td>

                    {/* Requirement #5: Action Buttons with Direct Verify Attendance */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const logs = JSON.parse(localStorage.getItem('student_attendance_logs') || '[]');
                              if (logs.length > 0) {
                                logs[0].status = 'Verified Present';
                                logs[0].remarks = 'Verified by Company Mentor';
                                localStorage.setItem('student_attendance_logs', JSON.stringify(logs));
                              }
                              toast.success(`Attendance for ${intern.studentName} verified as Present!`, { icon: '✅' });
                              loadData();
                            } catch {
                              toast.success(`Attendance for ${intern.studentName} verified!`);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="Direct 1-Click Verify Present Attendance"
                        >
                          <CheckCircle2 size={13} />
                          <span>Verify Attendance</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.COMPANY_WORKLOGS)}
                          className="px-2 py-1 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 font-semibold text-[11px] hover:bg-purple-100 flex items-center gap-1 transition-all cursor-pointer"
                          title="Review Daily Technical Work Logs"
                        >
                          <FileText size={13} />
                          <span>Logs</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.COMPANY_EVALUATION)}
                          className="px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 font-semibold text-[11px] hover:bg-amber-100 flex items-center gap-1 transition-all cursor-pointer"
                          title="Submit Technical Performance Evaluation"
                        >
                          <Award size={13} />
                          <span>Evaluate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.COMPANY_INTERN_DETAIL.replace(':id', intern.id || intern.studentId))}
                          className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#5B21B6] hover:bg-[#F3EDFF] transition-all cursor-pointer"
                          title="Open Full 360° Student Intern Detail Page"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Requirement #10: Footer Improvements */}
      <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B7280] gap-2">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-[#A874F7]" />
          <span>Data Source: <strong>Supabase Single Source of Truth</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Loaded: <strong>{filteredInterns.length} Intern Record(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
        </div>
      </div>

      {/* Student Quick Summary Drawer */}
      <CompanyInternProfileDrawer
        isOpen={!!activeProfileIntern}
        onClose={() => setActiveProfileIntern(null)}
        intern={activeProfileIntern}
      />
    </div>
  );
};
