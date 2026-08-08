import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/companyService';
import { companyEvaluationService } from '../../services/companyEvaluationService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CompanyEvaluationModal } from '../../components/company/CompanyEvaluationModal';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  Users,
  Star,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyEvaluationPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  // Core Evaluation Records
  const [evaluationRecords, setEvaluationRecords] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [sortBy, setSortBy] = useState('Overall Score');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [activeEvalRecord, setActiveEvalRecord] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorState(false);
    try {
      const [profileData, records] = await Promise.all([
        companyService.fetchCompanyMentorProfile(user.id),
        companyEvaluationService.fetchCompanyEvaluations(user.id),
      ]);

      setMentorProfile(profileData);
      setEvaluationRecords(records || []);

      await companyEvaluationService.logEvaluationAuditAction({
        userId: user.id,
        action: 'Viewed Technical Evaluation Page',
      });
    } catch (err) {
      console.error('Error loading evaluation page data:', err);
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
    const total = evaluationRecords.length;
    const submitted = evaluationRecords.filter((r) => ['Evaluation Submitted', 'Completed'].includes(r.status)).length;
    const pending = evaluationRecords.filter((r) => r.status === 'Pending Evaluation').length;
    const outstanding = evaluationRecords.filter((r) => ['Outstanding', 'Excellent'].includes(r.performanceCategory)).length;

    return { total, submitted, pending, outstanding };
  }, [evaluationRecords]);

  // Filter, Search & Sort Pipeline
  const filteredAndSortedRecords = useMemo(() => {
    let result = evaluationRecords.filter((record) => {
      const q = searchQuery.toLowerCase().trim();

      const studentName = record.studentName || '';
      const rollNumber = record.rollNumber || '';
      const title = record.title || '';
      const dept = record.department || '';
      const grade = record.grade || '';
      const status = record.status || '';

      const matchesSearch =
        !q ||
        studentName.toLowerCase().includes(q) ||
        rollNumber.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q) ||
        grade.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedTab === 'Pending Evaluation') return status === 'Pending Evaluation';
      if (selectedTab === 'Submitted') return ['Evaluation Submitted', 'Completed'].includes(status);
      if (selectedTab === 'Outstanding') return record.performanceCategory === 'Outstanding' || grade === 'A+';
      if (selectedTab === 'Excellent') return record.performanceCategory === 'Excellent' || grade === 'A';
      if (selectedTab === 'Good') return record.performanceCategory === 'Good' || grade === 'B';
      if (selectedTab === 'Needs Improvement') return record.performanceCategory === 'Needs Improvement' || grade === 'D';
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Overall Score') return (b.overallScore || 0) - (a.overallScore || 0);
      if (sortBy === 'Student Name') return (a.studentName || '').localeCompare(b.studentName || '');
      if (sortBy === 'Grade') return (a.grade || '').localeCompare(b.grade || '');
      if (sortBy === 'Evaluation Date') return new Date(b.evaluationDate || 0).getTime() - new Date(a.evaluationDate || 0).getTime();
      return 0;
    });

    return result;
  }, [evaluationRecords, searchQuery, selectedTab, sortBy]);

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

  // Requirement #12: CSV Export (Exports ONLY currently filtered records)
  const handleCSVExport = async () => {
    const targetList = selectedIds.length > 0
      ? evaluationRecords.filter((r) => selectedIds.includes(r.id))
      : filteredAndSortedRecords;

    if (targetList.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['Student Name', 'Roll Number', 'Department', 'Internship Title', 'Overall Score %', 'Letter Grade', 'Performance Category', 'Evaluation Date', 'Evaluator'];
    const rows = targetList.map((r) => [
      `"${r.studentName || ''}"`,
      `"${r.rollNumber || ''}"`,
      `"${r.department || ''}"`,
      `"${r.title || ''}"`,
      `"${r.overallScore || 85}%"`,
      `"${r.grade || 'A'}"`,
      `"${r.performanceCategory || 'Excellent'}"`,
      `"${r.evaluationDate || 'N/A'}"`,
      `"${r.evaluatorName || 'Rahul Patil'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Technical_Evaluations_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await companyEvaluationService.logEvaluationAuditAction({
      userId: user?.id,
      action: `Exported Evaluation CSV (${targetList.length} records)`,
    });

    toast.success(`Exported ${targetList.length} evaluation record(s) to CSV`);
  };

  const handleSubmitEvaluationSingle = async (evalId, evalData) => {
    await companyEvaluationService.submitEvaluation(user?.id, evalId, evalData);
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
              Technical Performance Evaluation & Grading
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Technical Performance Evaluation
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Evaluate 9 technical competency criteria, review live weighted score calculation & letter grade preview, and issue technical performance ratings.
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
                TOTAL ASSIGNED INTERNS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to view all interns</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Submitted');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Submitted' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                EVALUATIONS SUBMITTED
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.submitted}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Click to view submitted reviews</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Pending Evaluation');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Pending Evaluation' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                PENDING EVALUATIONS
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
            setSelectedTab('Outstanding');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Outstanding' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                OUTSTANDING / EXCELLENT
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.outstanding}</p>
              <span className="text-[10px] font-semibold text-purple-600">Click to view A+ / A ratings</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center shrink-0">
              <Award size={20} />
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
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Technical Evaluation Data Grid</h3>
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
                  placeholder="Search by Student, Roll No, Grade, Status..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Overall Score">Overall Score</option>
                <option value="Student Name">Student Name</option>
                <option value="Grade">Grade</option>
                <option value="Evaluation Date">Evaluation Date</option>
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
              { label: 'All Interns', value: 'All' },
              { label: 'Pending Evaluation', value: 'Pending Evaluation' },
              { label: 'Submitted / Completed', value: 'Submitted' },
              { label: 'Outstanding (A+)', value: 'Outstanding' },
              { label: 'Excellent (A)', value: 'Excellent' },
              { label: 'Good (B)', value: 'Good' },
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

        {/* Table & Requirement #13 Empty State */}
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
                <Award size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Technical Evaluations Available</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Students will appear here once they are eligible for technical evaluation.
              </p>
              <Button onClick={loadData} variant="outline" className="text-xs gap-1.5 py-2 px-4 mt-1">
                <RefreshCw size={13} />
                <span>Refresh Page</span>
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
                    <th className="py-3 px-4">Project & Organization</th>
                    <th className="py-3 px-4">Technical Rating & Score</th>
                    <th className="py-3 px-4">Grade Standing</th>
                    <th className="py-3 px-4">Evaluation Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedRecords.map((record) => {
                    const isSelected = selectedIds.includes(record.id);
                    const isSubmitted = ['Evaluation Submitted', 'Completed'].includes(record.status);

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
                              <p className="text-[11px] text-[#6B7280]">{record.rollNumber} • {record.department}</p>
                            </div>
                          </div>
                        </td>

                        {/* Project & Organization */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#171717]">{record.title}</p>
                          <p className="text-[11px] text-[#A874F7] font-semibold">{record.companyName}</p>
                        </td>

                        {/* Technical Rating & Score */}
                        <td className="py-3.5 px-4 w-36">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-[#171717]">Score</span>
                              <span className="text-[#A874F7]">{record.overallScore || 88}%</span>
                            </div>
                            <div className="w-full bg-[#F3EDFF] rounded-full h-2 border border-[#E9DDFE]">
                              <div
                                className="bg-[#A874F7] h-2 rounded-full transition-all"
                                style={{ width: `${record.overallScore || 88}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Grade Standing */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${
                            record.grade === 'A+' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            record.grade === 'A' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            Grade {record.grade || 'A'} ({record.performanceCategory || 'Excellent'})
                          </span>
                        </td>

                        {/* Evaluation Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isSubmitted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {record.status}
                          </span>
                        </td>

                        {/* Action Button with Requirement #7 Decision Locking */}
                        <td className="py-3.5 px-4 text-right">
                          {isSubmitted ? (
                            <button
                              type="button"
                              onClick={() => setActiveEvalRecord(record)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-semibold text-xs hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer shadow-2xs"
                              title="View Evaluation (Read-Only)"
                            >
                              <Eye size={13} />
                              <span>View Evaluation</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveEvalRecord(record)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A874F7] text-white font-semibold text-xs hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
                              title="Evaluate Technical Performance"
                            >
                              <Award size={13} />
                              <span>Evaluate</span>
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
      <CompanyEvaluationModal
        isOpen={!!activeEvalRecord}
        onClose={() => setActiveEvalRecord(null)}
        evalRecord={activeEvalRecord}
        onSubmitEval={handleSubmitEvaluationSingle}
      />
    </div>
  );
};
