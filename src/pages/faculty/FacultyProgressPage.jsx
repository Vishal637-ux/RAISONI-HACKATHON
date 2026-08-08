import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { facultyService } from '../../services/facultyService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MenteeProgressDrawer } from '../../components/faculty/MenteeProgressDrawer';
import { MidTermReviewModal } from '../../components/faculty/MidTermReviewModal';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  Award,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FacultyProgressPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [sortBy, setSortBy] = useState('Highest Progress');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal / Drawer States
  const [activeDrawerMentee, setActiveDrawerMentee] = useState(null);
  const [activeReviewMentee, setActiveReviewMentee] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = await facultyService.fetchAssignedMentees(user.id);
      setMentees(list || []);
    } catch (err) {
      console.error('Error loading progress data:', err);
      toast.error('Failed to load mentee progress records');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Summary Metrics Computation
  const summaryMetrics = useMemo(() => {
    const total = mentees.length;
    if (total === 0) return { avgProgress: 0, onTrack: 0, atRisk: 0, evaluationReady: 0 };

    const totalProgress = mentees.reduce((acc, m) => {
      const att = m.attendanceScore || 85;
      const wl = m.workLogScore || 80;
      return acc + Math.round(att * 0.4 + wl * 0.4 + 20);
    }, 0);

    const avgProgress = Math.round(totalProgress / total);
    const onTrack = mentees.filter((m) => m.riskStatus === 'On Track').length;
    const atRisk = mentees.filter((m) => ['Moderate Risk', 'High Risk'].includes(m.riskStatus)).length;
    const evaluationReady = mentees.filter((m) => (m.attendanceScore || 0) >= 80 && (m.workLogScore || 0) >= 80).length;

    return { avgProgress, onTrack, atRisk, evaluationReady };
  }, [mentees]);

  // Filter, Search & Sort Pipeline
  const filteredAndSortedMentees = useMemo(() => {
    let result = mentees.filter((mentee) => {
      const q = searchQuery.toLowerCase().trim();
      const attScore = mentee.attendanceScore || 85;
      const wlScore = mentee.workLogScore || 80;
      const progress = Math.round(attScore * 0.4 + wlScore * 0.4 + 20);

      const matchesSearch =
        !q ||
        mentee.studentName.toLowerCase().includes(q) ||
        mentee.rollNumber.toLowerCase().includes(q) ||
        mentee.companyName.toLowerCase().includes(q) ||
        mentee.department.toLowerCase().includes(q) ||
        mentee.status.toLowerCase().includes(q) ||
        mentee.riskStatus.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedTab === 'On Track') return mentee.riskStatus === 'On Track';
      if (selectedTab === 'At Risk') return ['Moderate Risk', 'High Risk'].includes(mentee.riskStatus);
      if (selectedTab === 'High Performance') return progress >= 90;
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const progressA = Math.round((a.attendanceScore || 85) * 0.4 + (a.workLogScore || 80) * 0.4 + 20);
      const progressB = Math.round((b.attendanceScore || 85) * 0.4 + (b.workLogScore || 80) * 0.4 + 20);

      if (sortBy === 'Highest Progress') return progressB - progressA;
      if (sortBy === 'Lowest Progress') return progressA - progressB;
      if (sortBy === 'Attendance %') return (b.attendanceScore || 0) - (a.attendanceScore || 0);
      if (sortBy === 'Work Log %') return (b.workLogScore || 0) - (a.workLogScore || 0);
      if (sortBy === 'Student Name') return a.studentName.localeCompare(b.studentName);
      return 0;
    });

    return result;
  }, [mentees, searchQuery, selectedTab, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredAndSortedMentees.length / rowsPerPage) || 1;
  const paginatedMentees = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedMentees.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredAndSortedMentees, currentPage, rowsPerPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedMentees.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTab('All');
    setSortBy('Highest Progress');
    setCurrentPage(1);
    toast.success('Search and filters cleared');
  };

  // CSV Export Handler
  const handleCSVExport = () => {
    const targetList = selectedIds.length > 0
      ? mentees.filter((m) => selectedIds.includes(m.id))
      : filteredAndSortedMentees;

    if (targetList.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['Student Name', 'Roll Number', 'Department', 'Company', 'Attendance %', 'Work Log %', 'Progress %', 'Risk Status', 'Export Date'];
    const rows = targetList.map((m) => {
      const att = m.attendanceScore || 85;
      const wl = m.workLogScore || 80;
      const prog = Math.round(att * 0.4 + wl * 0.4 + 20);
      return [
        `"${m.studentName}"`,
        `"${m.rollNumber}"`,
        `"${m.department}"`,
        `"${m.companyName}"`,
        `"${att}%"`,
        `"${wl}%"`,
        `"${prog}%"`,
        `"${m.riskStatus}"`,
        `"${new Date().toISOString().slice(0, 10)}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mentee_Progress_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${selectedIds.length > 0 ? selectedIds.length + ' Selected' : 'All'} Progress Records Exported to CSV`);
  };

  // Mid-Term Review Handler
  const handleReviewSubmit = async ({ menteeId, riskStatus, remarks, studentName }) => {
    const success = await facultyService.recordMidTermProgressReview({
      menteeId,
      riskStatus,
      remarks,
      facultyUserId: user?.id,
    });

    if (success) {
      toast.success(`✓ Mid-Term Review recorded for ${studentName}`);
      setActiveReviewMentee(null);

      // Update local mentee state smoothly
      setMentees((prev) =>
        prev.map((m) => (m.id === menteeId ? { ...m, riskStatus, hasMidTermReview: true } : m))
      );

      await loadData(); // Auto-refresh summary, table & counts
    }
  };

  const getRiskBadge = (risk) => {
    const tooltipText =
      risk === 'High Risk'
        ? 'Attendance Below Threshold & Missing Work Logs'
        : risk === 'Moderate Risk'
        ? 'Work Log Consistency Pending Review'
        : 'Satisfying Degree Requirements';

    switch (risk) {
      case 'High Risk':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
            title={`Reason: ${tooltipText}`}
          >
            <ShieldAlert size={12} />
            High Risk ⚠️
          </span>
        );
      case 'Moderate Risk':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 cursor-help"
            title={`Reason: ${tooltipText}`}
          >
            <AlertTriangle size={12} />
            Moderate Risk ⚡
          </span>
        );
      default:
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-help"
            title={`Reason: ${tooltipText}`}
          >
            <CheckCircle2 size={12} />
            On Track ✅
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
            Student Progress Monitoring
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Track academic progress metrics, monitor attendance regularity, identify at-risk mentees, and record mid-term evaluation notes.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={loadData}
          className="text-xs gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Refresh Progress</span>
        </Button>
      </div>

      {/* 4 Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                AVG MENTEE PROGRESS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.avgProgress}%</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Read-Only Metric Score</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                ON TRACK MENTEES
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.onTrack}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Satisfying Degree Progress</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                AT-RISK MENTEES
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.atRisk}</p>
              <span className="text-[10px] font-semibold text-rose-600">Requires Academic Intervention</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                EVALUATION READY
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.evaluationReady}</p>
              <span className="text-[10px] font-semibold text-blue-600">Eligible for Final Sign-off</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Progress Data Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        {/* Search, Filter & Sorting Bar */}
        <div className="flex flex-col gap-4 border-b border-[#E9DDFE] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Mentee Progress Monitoring Table</h3>
                <p className="text-xs text-[#6B7280]">
                  Showing {paginatedMentees.length} of {filteredAndSortedMentees.length} mentee(s)
                </p>
              </div>
            </div>

            {/* Controls */}
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
                  placeholder="Search by Student Name, Roll Number, Company, Department or Risk Status..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7] transition-all placeholder:text-[#6B7280]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer shrink-0"
              >
                <option value="Highest Progress">Highest Progress</option>
                <option value="Lowest Progress">Lowest Progress</option>
                <option value="Attendance %">Attendance %</option>
                <option value="Work Log %">Work Log %</option>
                <option value="Student Name">Student Name</option>
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

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] overflow-x-auto">
            {[
              { label: 'All Mentees', value: 'All' },
              { label: 'On Track', value: 'On Track' },
              { label: 'At Risk ⚠️', value: 'At Risk' },
              { label: 'High Performance (>= 90%)', value: 'High Performance' },
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

        {/* Content Table / Skeleton Loaders / Empty State */}
        {loading ? (
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
                <div className="h-3 bg-[#E9DDFE] rounded w-20 hidden md:block" />
                <div className="h-5 bg-[#E9DDFE] rounded-full w-24" />
                <div className="h-8 bg-[#E9DDFE] rounded-xl w-28" />
              </div>
            ))}
          </div>
        ) : paginatedMentees.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#F3EDFF]/20 rounded-xl border border-[#E9DDFE] min-h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center shadow-xs">
                <TrendingUp size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Students Match Your Search</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                No student progress records match your search query or filter criteria.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Button onClick={handleClearFilters} variant="primary" className="text-xs py-2 px-4">
                  Clear Filters
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
                        checked={selectedIds.length === paginatedMentees.length && paginatedMentees.length > 0}
                        className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                      />
                    </th>
                    <th className="py-3 px-4">Student Mentee</th>
                    <th className="py-3 px-4">Host Company & Role</th>
                    <th className="py-3 px-4">Attendance Regularity</th>
                    <th className="py-3 px-4">Work Log Consistency</th>
                    <th className="py-3 px-4">Overall Progress Score</th>
                    <th className="py-3 px-4">Academic Risk</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedMentees.map((mentee) => {
                    const isSelected = selectedIds.includes(mentee.id);
                    const att = mentee.attendanceScore || 85;
                    const wl = mentee.workLogScore || 80;
                    const progress = Math.round(att * 0.4 + wl * 0.4 + 20);

                    return (
                      <tr key={mentee.id} className={`hover:bg-[#F3EDFF]/20 transition-colors ${isSelected ? 'bg-[#F3EDFF]/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(mentee.id)}
                            className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                          />
                        </td>

                        {/* Student Mentee */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-xs shrink-0">
                              {mentee.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#171717]">{mentee.studentName}</p>
                              <p className="text-[11px] text-[#6B7280]">{mentee.rollNumber} • {mentee.department}</p>
                            </div>
                          </div>
                        </td>

                        {/* Host Company */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171717]">{mentee.companyName}</p>
                          <p className="text-[11px] text-[#6B7280]">{mentee.title}</p>
                        </td>

                        {/* Attendance */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                            {att}% Present
                          </span>
                        </td>

                        {/* Work Log */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 text-[11px]">
                            {wl}% Logged
                          </span>
                        </td>

                        {/* Overall Read-Only Progress Score Bar with Tooltip */}
                        <td className="py-3.5 px-4 w-44">
                          <div
                            className="space-y-1 cursor-help"
                            title={`Attendance: ${att}% | Work Log: ${wl}% | Status: ${mentee.status} | Company Feedback: Satisfactory | Overall Progress: ${progress}%`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-[#171717]">Progress</span>
                              <span className="text-[#A874F7]">{progress}%</span>
                            </div>
                            <div className="w-full bg-[#F3EDFF] rounded-full h-2 border border-[#E9DDFE]">
                              <div
                                className="bg-[#A874F7] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Risk Status Badge with Tooltip */}
                        <td className="py-3.5 px-4">{getRiskBadge(mentee.riskStatus)}</td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveDrawerMentee(mentee)}
                            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#A874F7] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
                            title="View Progress Breakdown Drawer"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveReviewMentee(mentee)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A874F7] text-white font-semibold text-xs hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
                          >
                            <ShieldCheck size={13} />
                            <span>{mentee.hasMidTermReview ? 'View Review' : 'Mid-Term Review'}</span>
                          </button>
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

      {/* Drawer & Modal Integrations */}
      <MenteeProgressDrawer
        isOpen={!!activeDrawerMentee}
        onClose={() => setActiveDrawerMentee(null)}
        mentee={activeDrawerMentee}
        onOpenReviewModal={(m) => setActiveReviewMentee(m)}
      />

      <MidTermReviewModal
        isOpen={!!activeReviewMentee}
        onClose={() => setActiveReviewMentee(null)}
        mentee={activeReviewMentee}
        onReviewSubmit={handleReviewSubmit}
      />
    </div>
  );
};
