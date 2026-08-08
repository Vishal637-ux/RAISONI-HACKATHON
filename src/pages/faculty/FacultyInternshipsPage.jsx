import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { facultyService } from '../../services/facultyService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { OfferLetterModal } from '../../components/faculty/OfferLetterModal';
import { CompanyProfileModal } from '../../components/faculty/CompanyProfileModal';
import { StudentProfileModal } from '../../components/faculty/StudentProfileModal';
import { InternshipDetailsDrawer } from '../../components/faculty/InternshipDetailsDrawer';
import { ApprovalActionModal } from '../../components/faculty/ApprovalActionModal';
import { ApprovalConfirmationDialog } from '../../components/faculty/ApprovalConfirmationDialog';
import { ApprovalSuccessDialog } from '../../components/faculty/ApprovalSuccessDialog';
import {
  Briefcase,
  AlertCircle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Search,
  RefreshCw,
  FileText,
  Building2,
  User,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FacultyInternshipsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [summary, setSummary] = useState({
    pendingApprovals: 0,
    pendingWorkLogs: 0,
    activeInternships: 0,
    rejectedCount: 0,
    avgApprovalTimeDays: '2.4',
  });

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal / Drawer States (Lazy-loaded when triggered)
  const [activeOfferLetterMentee, setActiveOfferLetterMentee] = useState(null);
  const [activeCompanyMentee, setActiveCompanyMentee] = useState(null);
  const [activeStudentMentee, setActiveStudentMentee] = useState(null);
  const [activeDrawerMentee, setActiveDrawerMentee] = useState(null);
  const [activeActionMentee, setActiveActionMentee] = useState(null);
  const [pendingConfirmationData, setPendingConfirmationData] = useState(null);
  const [successDialogData, setSuccessDialogData] = useState(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [sumData, menteeList] = await Promise.all([
        facultyService.fetchFacultyDashboardSummary(user.id),
        facultyService.fetchAssignedMentees(user.id),
      ]);
      setSummary(sumData);
      setMentees(menteeList || []);
    } catch (err) {
      console.error('Error loading internship data:', err);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extended Client-Side Search, Filter & Sort Pipeline
  const filteredAndSortedMentees = useMemo(() => {
    let result = mentees.filter((mentee) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        mentee.studentName.toLowerCase().includes(q) ||
        mentee.rollNumber.toLowerCase().includes(q) ||
        mentee.companyName.toLowerCase().includes(q) ||
        mentee.title.toLowerCase().includes(q) ||
        mentee.department.toLowerCase().includes(q) ||
        mentee.status.toLowerCase().includes(q) ||
        (mentee.cgpa && mentee.cgpa.includes(q));

      if (!matchesSearch) return false;

      if (selectedTab === 'Pending Approval') return mentee.status === 'Applied';
      if (selectedTab === 'Under Review') return mentee.status === 'Under Review';
      if (selectedTab === 'Approved') return ['Approved', 'Ongoing'].includes(mentee.status);
      if (selectedTab === 'Revision Required') return mentee.status === 'Revision Required';
      if (selectedTab === 'Rejected') return mentee.status === 'Rejected';
      if (selectedTab === 'Older Than 7 Days') {
        const daysOld = (new Date() - new Date(mentee.created_at)) / (1000 * 60 * 60 * 24);
        return daysOld > 7;
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'Oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'Student Name') return a.studentName.localeCompare(b.studentName);
      if (sortBy === 'Company') return a.companyName.localeCompare(b.companyName);
      if (sortBy === 'CGPA') return parseFloat(b.cgpa || '0') - parseFloat(a.cgpa || '0');
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTab('All');
    setSortBy('Newest');
    setCurrentPage(1);
    toast.success('Search and filters cleared');
  };

  // Approval Decision Handler Triggering Pre-Submission Confirmation Dialog
  const handleDecisionModalSubmit = (decisionData) => {
    const targetMentee = mentees.find((m) => m.id === decisionData.internshipId);
    setPendingConfirmationData({
      ...decisionData,
      studentName: targetMentee?.studentName || 'Student Mentee',
      companyName: targetMentee?.companyName || 'Host Company',
      title: targetMentee?.title || 'Role Title',
    });
  };

  // Final Confirmed Execution
  const handleConfirmedSubmit = async () => {
    if (!pendingConfirmationData || isSubmittingDecision) return;
    setIsSubmittingDecision(true);

    try {
      const { internshipId, status, remarks, academicNotes, previousStatus, studentName, companyName, title } =
        pendingConfirmationData;

      const success = await facultyService.updateInternshipStatus({
        internshipId,
        status,
        remarks,
        academicNotes,
        facultyUserId: user?.id,
        previousStatus,
      });

      if (success) {
        toast.success(`Academic status updated to "${status}"`);
        setPendingConfirmationData(null);
        setActiveActionMentee(null);

        // Auto-refresh summary cards, tables, counts & badges
        await loadData();

        // Open Success Dialog
        setSuccessDialogData({
          studentName,
          companyName,
          title,
          status,
        });
      }
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const calculatePendingAge = (createdAt) => {
    if (!createdAt) return '3 Days';
    const diffDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    if (diffDays >= 14) return '14 Days';
    if (diffDays >= 7) return '7 Days';
    return `${Math.max(1, diffDays)} Days`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ongoing':
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            {status}
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-[#A874F7] border border-[#E9DDFE]">
            <Clock size={12} />
            Under Review (Hold)
          </span>
        );
      case 'Applied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle size={12} />
            Pending Approval
          </span>
        );
      case 'Revision Required':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <AlertTriangle size={12} />
            Revision Required
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Top Banner Header */}
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
            Mentee Internship Approval & Verification
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Inspect student offer letters, verify host company details, and issue academic internship approvals.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={loadData}
          className="text-xs gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Refresh Applications</span>
        </Button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                PENDING APPROVAL
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summary.pendingApprovals}</p>
              <span className="text-[10px] font-semibold text-amber-600">Requires Faculty Verification</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                UNDER REVIEW (HOLD)
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summary.pendingWorkLogs}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">In Academic Verification</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#E9DDFE] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                APPROVED
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summary.activeInternships}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Avg Time: {summary.avgApprovalTimeDays} Days</span>
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
                REJECTED / REVISION
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summary.rejectedCount || 0}</p>
              <span className="text-[10px] font-semibold text-rose-600">Academic Decision Issued</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Applications Data Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        {/* Header Bar: Search, Sorting & Filter Tabs */}
        <div className="flex flex-col gap-4 border-b border-[#E9DDFE] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Internship Applications Queue</h3>
                <p className="text-xs text-[#6B7280]">
                  Showing {paginatedMentees.length} of {filteredAndSortedMentees.length} application(s)
                </p>
              </div>
            </div>

            {/* Controls: Search & Table Sorting */}
            <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name, roll no, company, CGPA..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7] transition-all placeholder:text-[#6B7280]"
                />
              </div>

              {/* Sorting Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7] transition-all cursor-pointer"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Student Name">Student Name</option>
                  <option value="Company">Company Name</option>
                  <option value="CGPA">Highest CGPA</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] overflow-x-auto">
            {[
              { label: 'All Applications', value: 'All' },
              { label: 'Pending Approval', value: 'Pending Approval' },
              { label: 'Under Review (Hold)', value: 'Under Review' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Revision Required', value: 'Revision Required' },
              { label: 'Rejected', value: 'Rejected' },
              { label: 'Older Than 7 Days', value: 'Older Than 7 Days' },
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

        {/* Applications Data Table / Skeleton / Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] gap-2 p-8">
            <Loader size="md" />
            <p className="text-xs text-[#6B7280]">Loading applications queue...</p>
          </div>
        ) : paginatedMentees.length === 0 ? (
          /* Empty State with Clear Filters Action */
          <div className="text-center py-12 px-4 bg-[#F3EDFF]/20 rounded-xl border border-[#E9DDFE] min-h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
                <Briefcase size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Matching Applications Found</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                No internship applications match your search query or filter criteria.
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
                    <th className="py-3 px-4 rounded-l-xl">Student Mentee</th>
                    <th className="py-3 px-4">Academic Details</th>
                    <th className="py-3 px-4">Host Company & Role</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Duration</th>
                    <th className="py-3 px-4">Offer Letter</th>
                    <th className="py-3 px-4 hidden md:table-cell">Age Badge</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Actions & Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedMentees.map((mentee) => {
                    const pendingAge = calculatePendingAge(mentee.created_at);
                    const isDecisionLocked = ['Approved', 'Rejected', 'Completed'].includes(mentee.status);

                    return (
                      <tr key={mentee.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                        {/* Student Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-xs shrink-0">
                              {mentee.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#171717]">{mentee.studentName}</p>
                              <p className="text-[11px] text-[#6B7280]">{mentee.rollNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Academic Details */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171717]">{mentee.department}</p>
                          <p className="text-[11px] text-[#6B7280]">
                            {mentee.year} • CGPA: <span className="font-bold text-[#A874F7]">{mentee.cgpa || '8.5'}</span>
                          </p>
                        </td>

                        {/* Company Info */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171717]">{mentee.companyName}</p>
                          <p className="text-[11px] text-[#6B7280]">{mentee.title}</p>
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-4 hidden lg:table-cell text-[11px] text-[#6B7280]">
                          <span>{mentee.startDate ? new Date(mentee.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'May 15'} - {mentee.endDate ? new Date(mentee.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Aug 15'}</span>
                          <span className="block font-semibold text-[#171717]">12 Weeks</span>
                        </td>

                        {/* Offer Letter Status Trigger */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setActiveOfferLetterMentee(mentee)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-semibold text-[11px] hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer"
                          >
                            <FileText size={12} />
                            <span>View Letter</span>
                          </button>
                        </td>

                        {/* Pending Age Badge */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={11} />
                            {pendingAge}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">{getStatusBadge(mentee.status)}</td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveCompanyMentee(mentee)}
                            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#A874F7] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
                            title="Company Info & Technical Mentor"
                          >
                            <Building2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveStudentMentee(mentee)}
                            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#A874F7] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
                            title="Student Academic Profile"
                          >
                            <User size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveDrawerMentee(mentee)}
                            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#A874F7] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
                            title="Internship Details Drawer"
                          >
                            <Briefcase size={14} />
                          </button>

                          {/* Action Button: Locked Decision Mode switches to View Decision */}
                          {isDecisionLocked ? (
                            <button
                              type="button"
                              onClick={() => setActiveActionMentee(mentee)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-semibold text-xs hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer shadow-2xs"
                            >
                              <Eye size={13} />
                              <span>View Decision</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveActionMentee(mentee)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#A874F7] text-white font-semibold text-xs hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
                            >
                              <ShieldCheck size={13} />
                              <span>Take Action</span>
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
                  className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] rounded-lg px-2 py-1 focus:outline-none"
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
                    className="p-1 rounded-lg border border-[#E9DDFE] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F3EDFF] cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg border border-[#E9DDFE] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F3EDFF] cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Lazy-loaded Modals & Drawer */}
      <OfferLetterModal
        isOpen={!!activeOfferLetterMentee}
        onClose={() => setActiveOfferLetterMentee(null)}
        mentee={activeOfferLetterMentee}
      />

      <CompanyProfileModal
        isOpen={!!activeCompanyMentee}
        onClose={() => setActiveCompanyMentee(null)}
        mentee={activeCompanyMentee}
      />

      <StudentProfileModal
        isOpen={!!activeStudentMentee}
        onClose={() => setActiveStudentMentee(null)}
        mentee={activeStudentMentee}
      />

      <InternshipDetailsDrawer
        isOpen={!!activeDrawerMentee}
        onClose={() => setActiveDrawerMentee(null)}
        mentee={activeDrawerMentee}
      />

      <ApprovalActionModal
        isOpen={!!activeActionMentee}
        onClose={() => setActiveActionMentee(null)}
        mentee={activeActionMentee}
        onDecisionSubmit={handleDecisionModalSubmit}
      />

      <ApprovalConfirmationDialog
        isOpen={!!pendingConfirmationData}
        onClose={() => setPendingConfirmationData(null)}
        onConfirm={handleConfirmedSubmit}
        mentee={pendingConfirmationData}
        targetStatus={pendingConfirmationData?.status}
        isLoading={isSubmittingDecision}
      />

      <ApprovalSuccessDialog
        isOpen={!!successDialogData}
        onClose={() => setSuccessDialogData(null)}
        data={successDialogData}
        onViewDetails={(d) => {
          const mentee = mentees.find((m) => m.studentName === d.studentName);
          if (mentee) setActiveDrawerMentee(mentee);
        }}
      />
    </div>
  );
};
