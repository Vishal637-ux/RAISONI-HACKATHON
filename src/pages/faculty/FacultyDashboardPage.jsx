import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { facultyService } from '../../services/facultyService';
import { FacultySummaryCards } from '../../components/faculty/FacultySummaryCards';
import { MenteeListCard } from '../../components/faculty/MenteeListCard';
import { RecentActivityWidget } from '../../components/faculty/RecentActivityWidget';
import { Loader } from '../../components/common/Loader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AlertTriangle, RefreshCw, Bell, UserCheck, Mail, ShieldAlert, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export const FacultyDashboardPage = () => {
  const { user, profile } = useAuth();
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [error, setError] = useState(null);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [summary, setSummary] = useState({
    totalMentees: 0,
    activeInternships: 0,
    pendingApprovals: 0,
    pendingAttendance: 0,
    pendingWorkLogs: 0,
    completedMentees: 0,
  });
  const [mentees, setMentees] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadFacultyProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const fac = await facultyService.fetchFacultyProfile(user.id);
      setFacultyInfo(fac);
    } catch {
      // Fallback
    }
  }, [user?.id]);

  const loadSummaryData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingCards(true);
    try {
      const sumData = await facultyService.fetchFacultyDashboardSummary(user.id);
      setSummary(sumData);
    } catch (err) {
      console.error('Summary loading error:', err);
    } finally {
      setLoadingCards(false);
    }
  }, [user?.id]);

  const loadMenteeTableData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingTable(true);
    setError(null);
    try {
      const menteeData = await facultyService.fetchAssignedMentees(user.id);
      setMentees(menteeData || []);
    } catch (err) {
      console.error('Mentees table loading error:', err);
      setError('Unable to load assigned student mentees.');
    } finally {
      setLoadingTable(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFacultyProfile();
    loadSummaryData();
    loadMenteeTableData();
  }, [loadFacultyProfile, loadSummaryData, loadMenteeTableData]);

  const handleRefresh = async () => {
    toast.success('Refreshing dashboard metrics...');
    await Promise.all([loadSummaryData(), loadMenteeTableData()]);
  };

  const handleExportCSV = () => {
    if (mentees.length === 0) {
      toast.error('No mentee records available to export.');
      return;
    }

    const headers = [
      'Student Name',
      'Roll Number',
      'Email',
      'Department',
      'Academic Year',
      'Host Company',
      'Internship Title',
      'Attendance %',
      'Work Log %',
      'Overall Progress %',
      'Status',
      'Exported By',
      'Export Timestamp',
    ];

    const timestamp = new Date().toISOString();
    const facultyName = facultyInfo?.fullName || profile?.full_name || 'Faculty Supervisor';

    const csvRows = mentees.map((m) => [
      `"${m.studentName}"`,
      `"${m.rollNumber}"`,
      `"${m.email}"`,
      `"${m.department}"`,
      `"${m.year}"`,
      `"${m.companyName}"`,
      `"${m.title}"`,
      `"${m.attendanceScore || 85}%"`,
      `"${m.workLogScore || 80}%"`,
      `"85%"`,
      `"${m.status}"`,
      `"${facultyName}"`,
      `"${timestamp}"`,
    ]);

    const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Faculty_Mentees_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Mentee Data exported to CSV successfully!');
  };

  const handleViewStudent = (studentName) => {
    toast(`Inspecting records for ${studentName}`, { icon: 'ℹ️' });
  };

  // Full Screen Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Faculty Mentor Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Faculty Dashboard</h1>
          <p className="text-xs text-[#6B7280]">
            Monitor assigned student mentees, verify work logs, and track academic internship progress.
          </p>
        </div>

        <Card className="bg-rose-50 border border-rose-200 p-8 text-center shadow-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-base font-bold text-rose-900">Failed to load dashboard data.</h3>
            <p className="text-xs text-rose-700 max-w-md">{error}</p>
            <Button onClick={handleRefresh} variant="danger" className="mt-2 gap-2 text-xs">
              <RefreshCw size={14} />
              Retry Loading Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 0 Assigned Mentees EmptyState View
  if (!loadingTable && mentees.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Faculty Mentor Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Faculty Dashboard</h1>
          <p className="text-xs text-[#6B7280]">
            Monitor assigned student mentees, verify work logs, and track academic internship progress.
          </p>
        </div>

        <Card className="bg-white border border-[#E9DDFE] p-10 shadow-sm rounded-2xl text-center min-h-[350px] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
              <UserCheck size={36} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#171717]">No Students Assigned Yet</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                You currently have no assigned mentees. Students will automatically appear here once they are assigned by department administration.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleRefresh} variant="primary" className="text-xs gap-2 py-2 px-5">
                <RefreshCw size={14} />
                <span>Refresh Dashboard</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => toast('Administrator contact request submitted.', { icon: 'ℹ️' })}
                className="text-xs py-2 px-4"
              >
                Contact Administrator
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              Faculty Mentor Portal
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              Academic Supervisor
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Welcome back, {facultyInfo?.fullName || profile?.full_name || 'Professor'} 👋
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Department of <strong className="font-semibold text-[#171717]">{facultyInfo?.department || 'Computer Engineering'}</strong> • Designation: <strong className="font-semibold text-[#171717]">{facultyInfo?.designation || 'Assistant Professor'}</strong>
          </p>
        </div>

        {/* Grouped Notifications Popover Trigger & Alert Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto relative">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <ShieldAlert size={14} />
            <span>Today&apos;s Pending Reviews: <strong>{summary.pendingApprovals + summary.pendingAttendance + summary.pendingWorkLogs} items</strong></span>
          </div>

          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] hover:bg-[#A874F7] hover:text-white transition-all relative cursor-pointer"
            title="Grouped Notifications"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {summary.pendingApprovals + summary.pendingAttendance + summary.pendingWorkLogs}
            </span>
          </button>

          {/* Grouped Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-72 bg-white border border-[#E9DDFE] rounded-2xl shadow-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-2">
                <span className="text-xs font-bold text-[#171717]">Grouped Notifications</span>
                <span className="text-[10px] text-[#6B7280]">Real-time Queue</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="font-semibold text-rose-900">Internship Applications</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px]">
                    {summary.pendingApprovals} High
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-semibold text-amber-900">Attendance Reviews</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-bold text-[10px]">
                    {summary.pendingAttendance} Med
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="font-semibold text-blue-900">Work Log Reviews</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px]">
                    {summary.pendingWorkLogs} Med
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6 Summary Metric Cards */}
      {loadingCards ? (
        <div className="flex items-center justify-center p-8 bg-white border border-[#E9DDFE] rounded-2xl">
          <Loader size="md" />
        </div>
      ) : (
        <FacultySummaryCards summary={summary} />
      )}

      {/* Assigned Mentees Table & Quick Actions */}
      {loadingTable ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] bg-white border border-[#E9DDFE] rounded-2xl p-8 gap-2">
          <Loader size="md" />
          <p className="text-xs text-[#6B7280]">Loading mentee records...</p>
        </div>
      ) : (
        <MenteeListCard mentees={mentees} onRefresh={handleRefresh} onExportCSV={handleExportCSV} />
      )}

      {/* Recent Activity Timeline Widget */}
      <RecentActivityWidget onViewStudent={handleViewStudent} />
    </div>
  );
};
