import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { facultyService } from '../../services/facultyService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AttendanceReviewModal } from '../../components/faculty/AttendanceReviewModal';
import { WorkLogReviewModal } from '../../components/faculty/WorkLogReviewModal';
import { BulkVerificationModal } from '../../components/faculty/BulkVerificationModal';
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  Check,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FacultyAttendanceLogsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'work_logs'

  // Data states
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [workLogRecords, setWorkLogRecords] = useState([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    pendingAttendance: 0,
    pendingWorkLogs: 0,
    verifiedCount: 0,
  });

  // Filter, Search, Sorting & Selection States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal States
  const [activeAttendanceRecord, setActiveAttendanceRecord] = useState(null);
  const [activeWorkLogRecord, setActiveWorkLogRecord] = useState(null);
  const [bulkModalData, setBulkModalData] = useState(null);
  const [isExecutingBulk, setIsExecutingBulk] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [attList, wlList] = await Promise.all([
        facultyService.fetchAttendanceRecords(user.id),
        facultyService.fetchWorkLogRecords(user.id),
      ]);
      setAttendanceRecords(attList || []);
      setWorkLogRecords(wlList || []);

      const pendingAtt = (attList || []).filter((a) => a.verificationStatus === 'Pending').length;
      const pendingWl = (wlList || []).filter((w) => w.verificationStatus === 'Pending').length;
      const verAtt = (attList || []).filter((a) => a.verificationStatus === 'Verified').length;
      const verWl = (wlList || []).filter((w) => w.verificationStatus === 'Verified').length;

      setSummary({
        totalRecords: (attList || []).length + (wlList || []).length,
        pendingAttendance: pendingAtt,
        pendingWorkLogs: pendingWl,
        verifiedCount: verAtt + verWl,
      });
    } catch (err) {
      console.error('Error loading attendance and work log data:', err);
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset Selection on Tab Change
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSelectedIds([]);
    setCurrentPage(1);
  };

  // Active Target Dataset
  const activeDataset = activeTab === 'attendance' ? attendanceRecords : workLogRecords;

  // Filter & Search Pipeline
  const filteredAndSortedRecords = useMemo(() => {
    let result = activeDataset.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.studentName.toLowerCase().includes(q) ||
        item.rollNumber.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.date.includes(q) ||
        item.verificationStatus.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'Pending') return item.verificationStatus === 'Pending';
      if (statusFilter === 'Verified') return item.verificationStatus === 'Verified';
      if (statusFilter === 'Correction Requested') return item.verificationStatus === 'Correction Requested';
      if (statusFilter === 'Rejected') return item.verificationStatus === 'Rejected';
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.date || b.updated_at) - new Date(a.date || a.updated_at);
      if (sortBy === 'Oldest') return new Date(a.date || a.updated_at) - new Date(b.date || b.updated_at);
      if (sortBy === 'Student Name') return a.studentName.localeCompare(b.studentName);
      if (sortBy === 'Pending First') {
        if (a.verificationStatus === 'Pending' && b.verificationStatus !== 'Pending') return -1;
        if (a.verificationStatus !== 'Pending' && b.verificationStatus === 'Pending') return 1;
      }
      return 0;
    });

    return result;
  }, [activeDataset, searchQuery, statusFilter, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredAndSortedRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRecords.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredAndSortedRecords, currentPage, rowsPerPage]);

  // Selection Logic
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortBy('Newest');
    setCurrentPage(1);
    toast.success('Search and filters cleared');
  };

  // CSV Export Handler
  const handleCSVExport = () => {
    const targetList = selectedIds.length > 0
      ? activeDataset.filter((r) => selectedIds.includes(r.id))
      : filteredAndSortedRecords;

    if (targetList.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['Student Name', 'Roll Number', 'Company', 'Date', 'Status', 'Verification Status'];
    const rows = targetList.map((r) => [
      `"${r.studentName}"`,
      `"${r.rollNumber}"`,
      `"${r.companyName}"`,
      `"${r.date}"`,
      `"${r.status || r.hoursLogged + ' Hours'}"`,
      `"${r.verificationStatus}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeTab === 'attendance' ? 'Attendance' : 'WorkLog'}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${selectedIds.length > 0 ? selectedIds.length + ' Selected' : 'All'} Records Exported to CSV`);
  };

  // Single Record Verification Handler with User-Friendly Toasts
  const handleSingleAttendanceSubmit = async ({ attendanceId, status, remarks, internalNotes }) => {
    const success = await facultyService.verifyAttendanceRecord({
      attendanceId,
      status,
      remarks,
      internalNotes,
      facultyUserId: user?.id,
    });

    if (success) {
      if (status === 'Verified') {
        toast.success('✓ Attendance Record Verified Successfully');
      } else if (status === 'Correction Requested') {
        toast.success('✓ Correction Request Sent Successfully');
      } else {
        toast.success('✓ Attendance Decision Updated Successfully');
      }
      setActiveAttendanceRecord(null);
      await loadData();
    }
  };

  const handleSingleWorkLogSubmit = async ({ workLogId, status, remarks, internalNotes }) => {
    const success = await facultyService.verifyWorkLogRecord({
      workLogId,
      status,
      remarks,
      internalNotes,
      facultyUserId: user?.id,
    });

    if (success) {
      if (status === 'Verified') {
        toast.success('✓ Work Log Record Verified Successfully');
      } else if (status === 'Correction Requested') {
        toast.success('✓ Correction Request Sent Successfully');
      } else {
        toast.success('✓ Work Log Decision Updated Successfully');
      }
      setActiveWorkLogRecord(null);
      await loadData();
    }
  };

  // Bulk Verification Action Handler with User-Friendly Toast
  const handleExecuteBulk = async ({ status, remarks }) => {
    if (selectedIds.length === 0 || isExecutingBulk) return;
    setIsExecutingBulk(true);
    try {
      const count = selectedIds.length;
      const typeLabel = activeTab === 'attendance' ? 'Attendance' : 'Work Log';

      const success = await facultyService.bulkVerifyRecords({
        recordIds: selectedIds,
        type: activeTab,
        status,
        remarks,
        facultyUserId: user?.id,
      });

      if (success) {
        if (status === 'Verified') {
          toast.success(`✓ ${count} ${typeLabel} Record(s) Verified Successfully`);
        } else if (status === 'Correction Requested') {
          toast.success(`✓ ${count} Correction Request(s) Sent Successfully`);
        } else {
          toast.success(`✓ ${count} Record(s) Updated Successfully`);
        }
        setSelectedIds([]);
        setBulkModalData(null);
        await loadData();
      }
    } finally {
      setIsExecutingBulk(false);
    }
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Verified
          </span>
        );
      case 'Correction Requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-[#A874F7] border border-[#E9DDFE]">
            <AlertTriangle size={12} />
            Correction Requested
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Pending Verification
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              Faculty Mentor Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
              Academic Supervisor • Read-Only Technical Access
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Attendance & Work Log Verification
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Verify student daily attendance check-ins, inspect work log reports, and track academic regularity.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={loadData}
          className="text-xs gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Refresh Records</span>
        </Button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                TOTAL RECORDS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summary.totalRecords}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Logged System Records</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                PENDING ATTENDANCE
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summary.pendingAttendance}</p>
              <span className="text-[10px] font-semibold text-amber-600">Check-ins Pending</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                PENDING WORK LOGS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summary.pendingWorkLogs}</p>
              <span className="text-[10px] font-semibold text-blue-600">Work Logs Pending</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                VERIFIED & APPROVED
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summary.verifiedCount}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Academic Verified</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Verification Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        {/* Header Controls: Sub-Tabs, Search, Sorting */}
        <div className="flex flex-col gap-4 border-b border-[#E9DDFE] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Dual Sub-Tabs Switcher */}
            <div className="flex items-center gap-2 bg-[#F3EDFF]/50 p-1.5 rounded-xl border border-[#E9DDFE]">
              <button
                type="button"
                onClick={() => handleTabSwitch('attendance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'attendance'
                    ? 'bg-white text-[#A874F7] shadow-2xs border border-[#E9DDFE]'
                    : 'text-[#6B7280] hover:text-[#171717]'
                }`}
              >
                <Clock size={16} />
                <span>Attendance Verification</span>
                {summary.pendingAttendance > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {summary.pendingAttendance}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('work_logs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'work_logs'
                    ? 'bg-white text-[#A874F7] shadow-2xs border border-[#E9DDFE]'
                    : 'text-[#6B7280] hover:text-[#171717]'
                }`}
              >
                <FileText size={16} />
                <span>Work Log Verification</span>
                {summary.pendingWorkLogs > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                    {summary.pendingWorkLogs}
                  </span>
                )}
              </button>
            </div>

            {/* Search, Sort & Dynamic CSV Export Button */}
            <div className="flex items-center gap-2 max-w-lg w-full sm:w-auto">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name, roll no, date, company..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7] transition-all placeholder:text-[#6B7280]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer shrink-0"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Student Name">Student Name</option>
                <option value="Pending First">Pending First</option>
              </select>

              <Button
                type="button"
                variant="outline"
                onClick={handleCSVExport}
                className="text-xs py-2 px-3 gap-1.5 shrink-0"
              >
                <Download size={13} />
                <span>{selectedIds.length > 0 ? 'Export Selected' : 'Export All Records'}</span>
              </Button>
            </div>
          </div>

          {/* Status Filter Tabs & Prominent Bulk Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] overflow-x-auto">
              {['All', 'Pending', 'Verified', 'Correction Requested', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-white text-[#A874F7] shadow-2xs border border-[#E9DDFE]'
                      : 'text-[#6B7280] hover:text-[#171717]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Prominent Bulk Action Bar */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-[#F3EDFF] p-1.5 px-3 rounded-xl border border-[#E9DDFE] animate-in fade-in duration-200">
                <span className="text-xs font-extrabold text-[#A874F7] px-2 py-0.5 rounded-md bg-white border border-[#E9DDFE]">
                  {selectedIds.length} Records Selected
                </span>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setBulkModalData('Verified')}
                  className="text-xs py-1 px-3 gap-1 bg-emerald-600 hover:bg-emerald-700 shadow-2xs"
                >
                  <Check size={13} />
                  <span>Verify ({selectedIds.length})</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBulkModalData('Correction Requested')}
                  className="text-xs py-1 px-3 gap-1 border-purple-300 text-[#A874F7] hover:bg-white"
                >
                  <AlertTriangle size={13} />
                  <span>Request Correction</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content Data Table / Proper Skeleton Loaders / Polished Empty State */}
        {loading ? (
          /* Table Skeleton Loader (Matching Table Structure) */
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-[#F3EDFF]/30 border border-[#E9DDFE] rounded-xl animate-pulse flex items-center px-4 justify-between gap-4">
                <div className="w-5 h-5 bg-[#E9DDFE] rounded-md" />
                <div className="flex items-center gap-3 w-44">
                  <div className="w-8 h-8 rounded-xl bg-[#E9DDFE] shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-[#E9DDFE] rounded w-28" />
                    <div className="h-2 bg-[#E9DDFE] rounded w-20" />
                  </div>
                </div>
                <div className="h-3 bg-[#E9DDFE] rounded w-24 hidden sm:block" />
                <div className="h-3 bg-[#E9DDFE] rounded w-28 hidden md:block" />
                <div className="h-5 bg-[#E9DDFE] rounded-full w-20" />
                <div className="h-8 bg-[#E9DDFE] rounded-xl w-24" />
              </div>
            ))}
          </div>
        ) : paginatedRecords.length === 0 ? (
          /* Centered Icon Empty State */
          <div className="text-center py-12 px-4 bg-[#F3EDFF]/20 rounded-xl border border-[#E9DDFE] min-h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center shadow-xs">
                {activeTab === 'attendance' ? <Clock size={28} /> : <FileText size={28} />}
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Matching Verification Records</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                No {activeTab === 'attendance' ? 'attendance check-ins' : 'work log reports'} match your search query or filter criteria.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Button onClick={handleClearFilters} variant="primary" className="text-xs py-2 px-4">
                  Clear All Filters
                </Button>
                <Button onClick={loadData} variant="outline" className="text-xs gap-1.5 py-2 px-4">
                  <RefreshCw size={13} />
                  <span>Refresh</span>
                </Button>
              </div>
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
                    <th className="py-3 px-4">Student Mentee</th>
                    <th className="py-3 px-4">Date & Logged Info</th>
                    <th className="py-3 px-4">Host Company</th>
                    <th className="py-3 px-4">{activeTab === 'attendance' ? 'Attendance Status' : 'Task Summary'}</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedRecords.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isLocked = ['Verified', 'Rejected', 'Correction Requested'].includes(item.verificationStatus);

                    return (
                      <tr key={item.id} className={`hover:bg-[#F3EDFF]/20 transition-colors ${isSelected ? 'bg-[#F3EDFF]/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(item.id)}
                            className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                          />
                        </td>

                        {/* Student Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-xs shrink-0">
                              {item.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#171717]">{item.studentName}</p>
                              <p className="text-[11px] text-[#6B7280]">{item.rollNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Date & Logged Info */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#171717]">{item.date}</p>
                          <p className="text-[11px] text-[#6B7280]">
                            {activeTab === 'attendance' ? `${item.checkIn} - ${item.checkOut}` : `${item.hoursLogged} Logged Hours`}
                          </p>
                        </td>

                        {/* Company */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#171717]">{item.companyName}</span>
                        </td>

                        {/* Status / Task Summary */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {activeTab === 'attendance' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.status}
                            </span>
                          ) : (
                            <p className="text-[11px] text-[#4B5563] truncate">
                              {item.tasksCompleted || 'Integrated API endpoints and updated dashboard components.'}
                            </p>
                          )}
                        </td>

                        {/* Verification Status */}
                        <td className="py-3.5 px-4">{getVerificationBadge(item.verificationStatus)}</td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {isLocked ? (
                            <button
                              type="button"
                              onClick={() => (activeTab === 'attendance' ? setActiveAttendanceRecord(item) : setActiveWorkLogRecord(item))}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-semibold text-xs hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>View Decision</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => (activeTab === 'attendance' ? setActiveAttendanceRecord(item) : setActiveWorkLogRecord(item))}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A874F7] text-white font-semibold text-xs hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
                            >
                              <Check size={13} />
                              <span>Review Record</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
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

      {/* Verification Modals */}
      <AttendanceReviewModal
        isOpen={!!activeAttendanceRecord}
        onClose={() => setActiveAttendanceRecord(null)}
        record={activeAttendanceRecord}
        onDecisionSubmit={handleSingleAttendanceSubmit}
      />

      <WorkLogReviewModal
        isOpen={!!activeWorkLogRecord}
        onClose={() => setActiveWorkLogRecord(null)}
        record={activeWorkLogRecord}
        onDecisionSubmit={handleSingleWorkLogSubmit}
      />

      <BulkVerificationModal
        isOpen={!!bulkModalData}
        onClose={() => setBulkModalData(null)}
        selectedCount={selectedIds.length}
        targetStatus={bulkModalData}
        type={activeTab === 'attendance' ? 'Attendance' : 'Work Log'}
        onConfirm={handleExecuteBulk}
        isLoading={isExecutingBulk}
      />
    </div>
  );
};
