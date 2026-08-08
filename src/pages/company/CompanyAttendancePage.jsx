import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/companyService';
import { companyAttendanceService } from '../../services/companyAttendanceService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CompanyAttendanceModal } from '../../components/company/CompanyAttendanceModal';
import {
  CalendarCheck,
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
  MapPin,
  Users,
  Building2,
  Calendar,
  Layers,
  Camera,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyAttendancePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  // Core Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);

  // View Mode: 'table' vs 'grid'
  const [viewMode, setViewMode] = useState('table');

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [sortBy, setSortBy] = useState('Date');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [activeModalRecord, setActiveModalRecord] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorState(false);
    try {
      const [profileData, records] = await Promise.all([
        companyService.fetchCompanyMentorProfile(user.id),
        companyAttendanceService.fetchCompanyAttendanceRecords(user.id),
      ]);

      setMentorProfile(profileData);
      setAttendanceRecords(records || []);

      await companyAttendanceService.logAttendanceAuditAction({
        userId: user.id,
        action: 'Viewed Attendance Page',
      });
    } catch (err) {
      console.error('Error loading attendance page data:', err);
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
    const total = attendanceRecords.length;
    const verified = attendanceRecords.filter((r) => r.status === 'Verified Present').length;
    const late = attendanceRecords.filter((r) => r.status === 'Late').length;
    const absent = attendanceRecords.filter((r) => r.status === 'Absent').length;

    return { total, verified, late, absent };
  }, [attendanceRecords]);

  // Filter, Search & Sort Pipeline
  const filteredAndSortedRecords = useMemo(() => {
    let result = attendanceRecords.filter((record) => {
      const q = searchQuery.toLowerCase().trim();

      const studentName = record.studentName || '';
      const rollNumber = record.rollNumber || '';
      const location = record.workLocation || '';
      const date = record.attendanceDate || '';
      const status = record.status || '';

      const matchesSearch =
        !q ||
        studentName.toLowerCase().includes(q) ||
        rollNumber.toLowerCase().includes(q) ||
        location.toLowerCase().includes(q) ||
        date.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedTab === 'Pending Verification') return status === 'Pending Verification';
      if (selectedTab === 'Verified Present') return status === 'Verified Present';
      if (selectedTab === 'Late') return status === 'Late';
      if (selectedTab === 'Absent') return status === 'Absent';
      if (selectedTab === 'Needs Review') return status === 'Pending Verification' || status === 'Late' || status === 'Absent';
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.attendanceDate || 0).getTime();
      const dateB = new Date(b.attendanceDate || 0).getTime();

      if (sortBy === 'Date') return dateB - dateA;
      if (sortBy === 'Student Name') return (a.studentName || '').localeCompare(b.studentName || '');
      if (sortBy === 'Punch-In Time') return (a.punchInTime || '').localeCompare(b.punchInTime || '');
      if (sortBy === 'Status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });

    return result;
  }, [attendanceRecords, searchQuery, selectedTab, sortBy]);

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
      ? attendanceRecords.filter((r) => selectedIds.includes(r.id))
      : filteredAndSortedRecords;

    if (targetList.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['Student Name', 'Roll Number', 'Department', 'Company', 'Attendance Date', 'Punch-In Time', 'Work Location', 'Geolocation', 'Status', 'Supervisor Remarks'];
    const rows = targetList.map((r) => [
      `"${r.studentName || ''}"`,
      `"${r.rollNumber || ''}"`,
      `"${r.department || ''}"`,
      `"${r.companyName || ''}"`,
      `"${r.attendanceDate || ''}"`,
      `"${r.punchInTime || ''}"`,
      `"${r.workLocation || ''}"`,
      `"${r.geolocationCoordinates || ''}"`,
      `"${r.status || ''}"`,
      `"${(r.supervisorRemarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Industry_Attendance_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await companyAttendanceService.logAttendanceAuditAction({
      userId: user?.id,
      action: `Exported Attendance CSV (${targetList.length} records)`,
    });

    toast.success(`Exported ${targetList.length} attendance record(s) to CSV`);
  };

  // Bulk Verification Action
  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one attendance record to verify');
      return;
    }

    if (window.confirm(`Are you sure you want to verify present for ${selectedIds.length} selected attendance record(s)?`)) {
      await companyAttendanceService.bulkVerifyAttendance(user?.id, selectedIds);
      toast.success(`Bulk verified ${selectedIds.length} attendance record(s) Present`);
      setSelectedIds([]);
      await loadData();
    }
  };

  const handleVerifySingle = async (id, data) => {
    await companyAttendanceService.verifyAttendance(user?.id, id, data);
    await loadData();
  };

  const handleMarkLateSingle = async (id, data) => {
    await companyAttendanceService.markLateAttendance(user?.id, id, data);
    await loadData();
  };

  const handleMarkAbsentSingle = async (id, data) => {
    await companyAttendanceService.markAbsentAttendance(user?.id, id, data);
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
              Student Attendance Verification & Punch-In Oversight
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Industry Attendance Verification
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor daily student punch-in timestamps, verify GPS geofenced work locations, review on-site photos, and sign off industry attendance.
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

      {/* Interactive Clickable Summary Dashboard Cards */}
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
                TOTAL ATTENDANCE RECORDS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to view all records</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <CalendarCheck size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Verified Present');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Verified Present' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                VERIFIED PRESENT
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.verified}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Click to view verified present</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Late');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Late' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                MARKED LATE
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.late}</p>
              <span className="text-[10px] font-semibold text-amber-600">Click to view late check-ins</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Absent');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Absent' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                MARKED ABSENT / FLAGGED
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.absent}</p>
              <span className="text-[10px] font-semibold text-rose-600">Click to view absent records</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
          </div>
        </button>
      </div>

      {/* Main Data Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        {/* Controls */}
        <div className="flex flex-col gap-4 border-b border-[#E9DDFE] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
                <CalendarCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Student Punch-In Verification Table</h3>
                <p className="text-xs text-[#6B7280]">
                  Showing {paginatedRecords.length} of {filteredAndSortedRecords.length} record(s)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Student, Roll No, Location, Date..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Date">Attendance Date</option>
                <option value="Student Name">Student Name</option>
                <option value="Punch-In Time">Punch-In Time</option>
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
              { label: 'Verified Present', value: 'Verified Present' },
              { label: 'Late Punch-Ins', value: 'Late' },
              { label: 'Absent / Unexcused', value: 'Absent' },
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
        </div>

        {/* Table & Empty State */}
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
                <CalendarCheck size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Attendance Records Found</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Student attendance punch-in records will appear here as interns submit their daily check-ins.
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
                    <th className="py-3 px-4">Date & Punch-In Time</th>
                    <th className="py-3 px-4">Work Location & GPS</th>
                    <th className="py-3 px-4">Student Remarks</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedRecords.map((record) => {
                    const isSelected = selectedIds.includes(record.id);
                    const isVerified = record.status === 'Verified Present' || record.status === 'Late';

                    return (
                      <tr key={record.id} className={`hover:bg-[#F3EDFF]/20 transition-colors ${isSelected ? 'bg-[#F3EDFF]/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(record.id)}
                            className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                          />
                        </td>

                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-xs shrink-0">
                              {record.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#171717]">{record.studentName}</p>
                              <p className="text-[11px] text-[#6B7280]">{record.rollNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Date & Punch-In */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#171717]">{record.attendanceDate}</p>
                          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.2 rounded border border-purple-200">
                            {record.punchInTime}
                          </span>
                        </td>

                        {/* Location & GPS */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171717] flex items-center gap-1">
                            <MapPin size={12} className="text-[#A874F7]" />
                            <span>{record.workLocation}</span>
                          </p>
                          <span className="text-[10px] text-[#6B7280] font-semibold">GPS: {record.geolocationCoordinates}</span>
                        </td>

                        {/* Remarks */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="line-clamp-2 text-[#6B7280] leading-relaxed">
                            {record.studentRemarks || 'Daily punch-in'}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            record.status === 'Verified Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            record.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            record.status === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {record.status}
                          </span>
                        </td>

                        {/* Action Buttons with Decision Locking */}
                        <td className="py-3.5 px-4 text-right">
                          {isVerified ? (
                            <button
                              type="button"
                              onClick={() => setActiveModalRecord(record)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-semibold text-xs hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="View Sign-Off (Read-Only)"
                            >
                              <Eye size={13} />
                              <span>View Sign-Off</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveModalRecord(record)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A874F7] text-white font-semibold text-xs hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
                              title="Verify Industry Attendance Punch-In"
                            >
                              <CalendarCheck size={13} />
                              <span>Verify Punch-In</span>
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

      {/* Modal Integration */}
      <CompanyAttendanceModal
        isOpen={!!activeModalRecord}
        onClose={() => setActiveModalRecord(null)}
        record={activeModalRecord}
        onVerify={handleVerifySingle}
        onMarkLate={handleMarkLateSingle}
        onMarkAbsent={handleMarkAbsentSingle}
      />
    </div>
  );
};
