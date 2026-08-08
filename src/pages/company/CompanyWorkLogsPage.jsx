import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/companyService';
import { workLogService } from '../../services/workLogService';
import { taskService } from '../../services/taskService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CompanyWorkLogReviewModal } from '../../components/company/CompanyWorkLogReviewModal';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  Lock,
  ExternalLink,
  Users,
  Building2,
  Briefcase,
  Layers,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyWorkLogsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  // Core Data
  const [workLogs, setWorkLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);

  // Sub-Tab Switcher State: 'work-logs' vs 'deliverables'
  const [activeSubTab, setActiveSubTab] = useState('work-logs');

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [sortBy, setSortBy] = useState('Submission Date');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Active Review Modal
  const [activeReviewLog, setActiveReviewLog] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorState(false);
    try {
      const [profileData, logList, taskList] = await Promise.all([
        companyService.fetchCompanyMentorProfile(user.id),
        workLogService.fetchCompanyWorkLogs(user.id),
        taskService.fetchCompanyTasks(user.id),
      ]);

      setMentorProfile(profileData);
      setWorkLogs(logList || []);
      setTasks(taskList || []);

      await workLogService.logCompanyWorkLogAudit({
        userId: user.id,
        action: 'Viewed Work Logs Page',
      });
    } catch (err) {
      console.error('Error loading company work log data:', err);
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
    const total = workLogs.length;
    const pending = workLogs.filter((l) => l.status === 'Pending Verification').length;
    const verified = workLogs.filter((l) => l.status === 'Verified').length;
    const flagged = workLogs.filter((l) => ['Needs Revision', 'Flagged'].includes(l.status)).length;

    return { total, pending, verified, flagged };
  }, [workLogs]);

  // Requirement #8: Filter, Search & Sort Pipeline
  const filteredAndSortedRecords = useMemo(() => {
    const dataset = activeSubTab === 'work-logs' ? workLogs : tasks;

    let result = dataset.filter((item) => {
      const q = searchQuery.toLowerCase().trim();

      const studentName = item.studentName || '';
      const rollNumber = item.rollNumber || '';
      const title = item.title || item.taskName || '';
      const desc = item.description || '';
      const status = item.status || '';

      const matchesSearch =
        !q ||
        studentName.toLowerCase().includes(q) ||
        rollNumber.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedTab === 'Pending Verification') return status === 'Pending Verification' || status === 'Assigned' || status === 'Submitted';
      if (selectedTab === 'Verified') return status === 'Verified' || status === 'Completed';
      if (selectedTab === 'Needs Revision') return status === 'Needs Revision';
      if (selectedTab === 'Flagged') return status === 'Needs Revision' || status === 'Flagged';
      if (selectedTab === 'Recently Submitted') return (item.date || item.createdAt || '').includes('2026-08');
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date || a.submittedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.submittedAt || b.createdAt || 0).getTime();

      if (sortBy === 'Submission Date') return dateB - dateA;
      if (sortBy === 'Student Name') return (a.studentName || '').localeCompare(b.studentName || '');
      if (sortBy === 'Hours Logged') return (b.hoursLogged || 0) - (a.hoursLogged || 0);
      if (sortBy === 'Status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });

    return result;
  }, [activeSubTab, workLogs, tasks, searchQuery, selectedTab, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredAndSortedRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRecords.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredAndSortedRecords, currentPage, rowsPerPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // CSV Export Handler
  const handleCSVExport = async () => {
    const targetList = selectedIds.length > 0
      ? workLogs.filter((l) => selectedIds.includes(l.id))
      : filteredAndSortedRecords;

    if (targetList.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['Student Name', 'Roll Number', 'Department', 'Task / Work Log', 'Date', 'Hours Logged', 'Status', 'Work Description'];
    const rows = targetList.map((l) => [
      `"${l.studentName || ''}"`,
      `"${l.rollNumber || ''}"`,
      `"${l.department || ''}"`,
      `"${l.taskName || l.title || ''}"`,
      `"${l.date || l.createdAt || ''}"`,
      `"${l.hoursLogged || 8}"`,
      `"${l.status || ''}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Technical_Work_Logs_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await workLogService.logCompanyWorkLogAudit({
      userId: user?.id,
      action: `Exported Work Logs CSV (${targetList.length} records)`,
    });

    toast.success(`Exported ${targetList.length} record(s) to CSV`);
  };

  // Requirement #7: Bulk Verification Action with Confirmation
  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one work log to verify');
      return;
    }

    if (window.confirm(`Are you sure you want to verify and sign off ${selectedIds.length} selected work log(s)?`)) {
      await workLogService.bulkVerifyWorkLogs(user?.id, selectedIds);
      toast.success(`Bulk verified ${selectedIds.length} work log(s)`);
      setSelectedIds([]);
      await loadData();
    }
  };

  const handleVerifySingle = async (workLogId, feedbackData) => {
    await workLogService.verifyWorkLog(user?.id, workLogId, feedbackData);
    await loadData();
  };

  const handleFlagSingle = async (workLogId, feedbackData) => {
    await workLogService.flagWorkLog(user?.id, workLogId, feedbackData);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              Company Mentor Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase tracking-wider">
              Technical Work Logs & Deliverables Sign-Off
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Task Review & Work Log Sign-Off
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Review student daily work logs, verify technical task deliverables, provide code review feedback, and issue technical sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={loadData}
            className="text-xs gap-1.5 py-2 px-3"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Records</span>
          </Button>

          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="primary"
              onClick={handleBulkVerify}
              className="text-xs gap-1.5 py-2 px-4 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check size={14} />
              <span>Verify Selected ({selectedIds.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Requirement #3: Interactive Clickable Summary Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setSelectedTab('All');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'All' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                TOTAL WORK LOGS SUBMITTED
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to view all work logs</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Pending Verification');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Pending Verification' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                PENDING VERIFICATION
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.pending}</p>
              <span className="text-[10px] font-semibold text-amber-600">Click to view pending reviews</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Verified');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Verified' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                VERIFIED & SIGNED OFF
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.verified}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Click to view verified logs</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Needs Revision');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Needs Revision' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                FLAGGED FOR REVISION
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.flagged}</p>
              <span className="text-[10px] font-semibold text-rose-600">Click to view flagged logs</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
          </div>
        </button>
      </div>

      {/* Main Container with Dual Sub-Tabs */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        {/* Requirement #4: Dual Independent Sub-Tabs Switcher */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#F3EDFF]/60 p-1 rounded-xl border border-[#E9DDFE]">
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('work-logs');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'work-logs'
                  ? 'bg-white text-[#A874F7] shadow-xs border border-[#E9DDFE]'
                  : 'text-[#6B7280] hover:text-[#171717]'
              }`}
            >
              <FileText size={15} />
              <span>Daily Work Logs Submissions</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab('deliverables');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'deliverables'
                  ? 'bg-white text-[#A874F7] shadow-xs border border-[#E9DDFE]'
                  : 'text-[#6B7280] hover:text-[#171717]'
              }`}
            >
              <Briefcase size={15} />
              <span>Task Deliverables Submissions</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Student, Roll No, Task, Description..."
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="Submission Date">Submission Date</option>
              <option value="Student Name">Student Name</option>
              <option value="Hours Logged">Hours Logged</option>
              <option value="Status">Status</option>
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] overflow-x-auto">
          {[
            { label: 'All Records', value: 'All' },
            { label: 'Pending Verification', value: 'Pending Verification' },
            { label: 'Verified & Signed Off', value: 'Verified' },
            { label: 'Needs Revision', value: 'Needs Revision' },
            { label: 'Recently Submitted', value: 'Recently Submitted' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSelectedTab(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedTab === tab.value
                  ? 'bg-white text-[#A874F7] shadow-2xs border border-[#E9DDFE]'
                  : 'text-[#6B7280] hover:text-[#171717]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table & Requirement #18 Empty State */}
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#F3EDFF]/30 border border-[#E9DDFE] rounded-xl animate-pulse flex items-center px-4 justify-between gap-4">
                <div className="w-5 h-5 bg-[#E9DDFE] rounded-md" />
                <div className="h-4 bg-[#E9DDFE] rounded w-48" />
                <div className="h-4 bg-[#E9DDFE] rounded w-32" />
                <div className="h-4 bg-[#E9DDFE] rounded w-20" />
                <div className="h-8 bg-[#E9DDFE] rounded-xl w-24" />
              </div>
            ))}
          </div>
        ) : paginatedRecords.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#F3EDFF]/20 rounded-xl border border-[#E9DDFE] min-h-[260px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
                <FileText size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Work Logs Found</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Student work logs and task submissions will appear here after interns submit their daily updates.
              </p>
              <Button onClick={loadData} variant="outline" className="text-xs gap-1.5 py-2 px-4 mt-1">
                <RefreshCw size={13} />
                <span>Refresh Records</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0}
                        className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                      />
                    </th>
                    <th className="py-3 px-4">Student Intern</th>
                    <th className="py-3 px-4">Task Deliverable</th>
                    <th className="py-3 px-4">Date & Hours</th>
                    <th className="py-3 px-4">Work Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedRecords.map((log) => {
                    const isSelected = selectedIds.includes(log.id);
                    const isVerified = log.status === 'Verified' || log.status === 'Completed';

                    return (
                      <tr key={log.id} className={`hover:bg-[#F3EDFF]/20 transition-colors ${isSelected ? 'bg-[#F3EDFF]/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(log.id)}
                            className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                          />
                        </td>

                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-xs shrink-0">
                              {log.studentName?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="font-bold text-[#171717]">{log.studentName}</p>
                              <p className="text-[11px] text-[#6B7280]">{log.rollNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Task Deliverable */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#171717]">{log.taskName || log.title || 'Daily Engineering Log'}</p>
                          <p className="text-[11px] text-[#A874F7] font-semibold">{log.companyName}</p>
                        </td>

                        {/* Date & Hours Logged */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#171717]">{log.date || '2026-08-03'}</p>
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.2 rounded border border-purple-200">
                            {log.hoursLogged || 8} Hours
                          </span>
                        </td>

                        {/* Work Description Snippet */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="line-clamp-2 text-[#6B7280] leading-relaxed">
                            {log.description}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            log.status === 'Needs Revision' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {log.status}
                          </span>
                        </td>

                        {/* Action Buttons with Requirement #16 Decision Locking */}
                        <td className="py-3.5 px-4 text-right">
                          {isVerified ? (
                            <button
                              type="button"
                              onClick={() => setActiveReviewLog(log)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-semibold text-xs hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="View Sign-Off (Read-Only)"
                            >
                              <Eye size={13} />
                              <span>View Sign-Off</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveReviewLog(log)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A874F7] text-white font-semibold text-xs hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
                              title="Review & Sign Off Technical Work Log"
                            >
                              <FileText size={13} />
                              <span>Review Log</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E9DDFE] text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280]">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[#6B7280]">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-lg border border-[#E9DDFE] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg border border-[#E9DDFE] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Review Modal Integration */}
      <CompanyWorkLogReviewModal
        isOpen={!!activeReviewLog}
        onClose={() => setActiveReviewLog(null)}
        log={activeReviewLog}
        onVerify={handleVerifySingle}
        onFlag={handleFlagSingle}
      />
    </div>
  );
};
