import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { facultyService } from '../../services/facultyService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FinalEvaluationModal } from '../../components/faculty/FinalEvaluationModal';
import { CertificatePreviewModal } from '../../components/faculty/CertificatePreviewModal';
import {
  Award,
  Clock,
  CheckCircle2,
  FileCheck,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FacultyEvaluationPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [sortBy, setSortBy] = useState('Highest Score');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal States
  const [activeEvaluationMentee, setActiveEvaluationMentee] = useState(null);
  const [activeCertMentee, setActiveCertMentee] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = await facultyService.fetchAssignedMentees(user.id);
      setMentees(list || []);
    } catch (err) {
      console.error('Error loading evaluation data:', err);
      toast.error('Failed to load evaluation records');
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
    const pending = mentees.filter((m) => m.evaluationStatus === 'Pending').length;
    const approved = mentees.filter((m) => ['Approved & Signed Off', 'Completed'].includes(m.evaluationStatus) || m.status === 'Completed').length;
    const certificates = mentees.filter((m) => m.certificateRecommended).length;

    return { total, pending, approved, certificates };
  }, [mentees]);

  // Filter, Search & Sort Pipeline
  const filteredAndSortedMentees = useMemo(() => {
    let result = mentees.filter((mentee) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        mentee.studentName.toLowerCase().includes(q) ||
        mentee.rollNumber.toLowerCase().includes(q) ||
        mentee.companyName.toLowerCase().includes(q) ||
        mentee.department.toLowerCase().includes(q) ||
        (mentee.evaluationStatus && mentee.evaluationStatus.toLowerCase().includes(q)) ||
        (mentee.finalGrade && mentee.finalGrade.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedTab === 'Pending Evaluation') return mentee.evaluationStatus === 'Pending';
      if (selectedTab === 'Approved & Signed Off') return ['Approved & Signed Off', 'Completed'].includes(mentee.evaluationStatus) || mentee.status === 'Completed';
      if (selectedTab === 'Certificate Recommended') return mentee.certificateRecommended;
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const scoreA = a.evaluationScore || 0;
      const scoreB = b.evaluationScore || 0;

      if (sortBy === 'Highest Score') return scoreB - scoreA;
      if (sortBy === 'Lowest Score') return scoreA - scoreB;
      if (sortBy === 'Attendance Rate') return (b.attendanceScore || 0) - (a.attendanceScore || 0);
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
    setSortBy('Highest Score');
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

    const headers = ['Student Name', 'Roll Number', 'Department', 'Company', 'Attendance %', 'Work Log %', 'Final Grade', 'Evaluation Score', 'Sign-Off Status', 'Certificate Recommended'];
    const rows = targetList.map((m) => [
      `"${m.studentName}"`,
      `"${m.rollNumber}"`,
      `"${m.department}"`,
      `"${m.companyName}"`,
      `"${m.attendanceScore || 85}%"`,
      `"${m.workLogScore || 80}%"`,
      `"${m.finalGrade || 'N/A'}"`,
      `"${m.evaluationScore || 'N/A'}"`,
      `"${m.evaluationStatus}"`,
      `"${m.certificateRecommended ? 'Yes' : 'No'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Final_Academic_Evaluations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${selectedIds.length > 0 ? selectedIds.length + ' Selected' : 'All'} Evaluation Records Exported to CSV`);
  };

  // Final Evaluation Submit Handler
  const handleEvaluationSubmit = async ({ menteeId, finalGrade, evaluationScore, certificateRecommended, remarks, internalNotes, studentName }) => {
    const success = await facultyService.submitFinalEvaluation({
      menteeId,
      finalGrade,
      evaluationScore,
      certificateRecommended,
      remarks,
      academicNotes: internalNotes,
      facultyUserId: user?.id,
    });

    if (success) {
      toast.success(`✓ Final Degree Approval & Grade ${finalGrade} issued for ${studentName}`);
      setActiveEvaluationMentee(null);

      // Smooth state update
      setMentees((prev) =>
        prev.map((m) =>
          m.id === menteeId
            ? { ...m, evaluationStatus: 'Approved & Signed Off', finalGrade, evaluationScore, certificateRecommended, status: 'Completed' }
            : m
        )
      );

      await loadData(); // Auto-refresh summary, table & counts
    }
  };

  const getStatusBadge = (status, menteeStatus) => {
    if (['Approved & Signed Off', 'Completed'].includes(status) || menteeStatus === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} />
          Approved & Signed Off
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={12} />
        Pending Evaluation
      </span>
    );
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
            Academic Evaluation & Final Approval
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Perform final academic evaluations, assign letter grades, recommend completion certificates, and issue final degree sign-offs.
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

      {/* 4 Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                TOTAL EVALUATIONS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Assigned Degree Candidates</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                PENDING EVALUATIONS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.pending}</p>
              <span className="text-[10px] font-semibold text-amber-600">Awaiting Final Sign-Off</span>
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
                APPROVED & SIGNED OFF
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.approved}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Degree Approval Issued</span>
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
                CERTIFICATES ISSUED
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.certificates}</p>
              <span className="text-[10px] font-semibold text-blue-600">Completion Certificate Ready</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <FileCheck size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Evaluation Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        {/* Search, Filter & Sorting Bar */}
        <div className="flex flex-col gap-4 border-b border-[#E9DDFE] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Academic Degree Evaluation Queue</h3>
                <p className="text-xs text-[#6B7280]">
                  Showing {paginatedMentees.length} of {filteredAndSortedMentees.length} record(s)
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
                  placeholder="Search by Student Name, Roll Number, Company, Department, Grade or Status..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7] transition-all placeholder:text-[#6B7280]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer shrink-0"
              >
                <option value="Highest Score">Highest Score</option>
                <option value="Lowest Score">Lowest Score</option>
                <option value="Attendance Rate">Attendance Rate</option>
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
              { label: 'Pending Evaluation', value: 'Pending Evaluation' },
              { label: 'Approved & Signed Off', value: 'Approved & Signed Off' },
              { label: 'Certificate Recommended', value: 'Certificate Recommended' },
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
                <Award size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Academic Evaluation Records Match Your Search</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                No evaluation records match your search query or filter criteria.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Button onClick={handleClearFilters} variant="primary" className="text-xs py-2 px-4">
                  Clear Filters
                </Button>
                <Button onClick={loadData} variant="outline" className="text-xs gap-1.5 py-2 px-4">
                  <RefreshCw size={13} />
                  <span>Refresh Records</span>
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
                    <th className="py-3 px-4">Attendance Baseline</th>
                    <th className="py-3 px-4">Work Log Consistency</th>
                    <th className="py-3 px-4">Final Grade</th>
                    <th className="py-3 px-4">Approval Status</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedMentees.map((mentee) => {
                    const isSelected = selectedIds.includes(mentee.id);
                    const isSignedOff = ['Approved & Signed Off', 'Completed'].includes(mentee.evaluationStatus) || mentee.status === 'Completed';

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

                        {/* Attendance Baseline */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                            {mentee.attendanceScore || 85}% Present
                          </span>
                        </td>

                        {/* Work Log Consistency */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 text-[11px]">
                            {mentee.workLogScore || 80}% Logged
                          </span>
                        </td>

                        {/* Final Grade */}
                        <td className="py-3.5 px-4">
                          {mentee.finalGrade ? (
                            <span className="font-extrabold text-[#A874F7] bg-[#F3EDFF] px-2.5 py-0.5 rounded-md border border-[#E9DDFE] text-[11px]">
                              {mentee.finalGrade}
                            </span>
                          ) : (
                            <span className="text-[#6B7280] text-[11px]">Pending Grade</span>
                          )}
                        </td>

                        {/* Approval Status */}
                        <td className="py-3.5 px-4">{getStatusBadge(mentee.evaluationStatus, mentee.status)}</td>

                        {/* Actions (Requirement #1: "View Sign-Off" for completed/signed off) */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {mentee.certificateRecommended && (
                            <button
                              type="button"
                              onClick={() => setActiveCertMentee(mentee)}
                              className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#A874F7] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
                              title="Preview Recommended Certificate"
                            >
                              <FileCheck size={14} />
                            </button>
                          )}

                          {isSignedOff ? (
                            <button
                              type="button"
                              onClick={() => setActiveEvaluationMentee(mentee)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-semibold text-xs hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer shadow-2xs"
                            >
                              <Eye size={13} />
                              <span>View Sign-Off</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveEvaluationMentee(mentee)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A874F7] text-white font-semibold text-xs hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
                            >
                              <ShieldCheck size={13} />
                              <span>Final Evaluation</span>
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

      {/* Modal Integrations */}
      <FinalEvaluationModal
        isOpen={!!activeEvaluationMentee}
        onClose={() => setActiveEvaluationMentee(null)}
        mentee={activeEvaluationMentee}
        onEvaluationSubmit={handleEvaluationSubmit}
      />

      <CertificatePreviewModal
        isOpen={!!activeCertMentee}
        onClose={() => setActiveCertMentee(null)}
        mentee={activeCertMentee}
      />
    </div>
  );
};
