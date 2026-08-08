import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tpoService } from '../../services/tpoService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Users,
  GraduationCap,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TPOStudentsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleString('en-GB'));

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const records = await tpoService.fetchTPOStudentPlacements();
      setStudents(records || []);
      setLastSyncedTime(new Date().toLocaleString('en-GB'));

      await tpoService.logTPOAuditAction({
        userId: user?.id,
        action: 'Viewed Student Placement Oversight Page',
      });
    } catch (err) {
      console.error('Error loading student placements:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = students.length;
    const placed = students.filter((s) => s.placementStatus === 'Placed').length;
    const unplaced = students.filter((s) => s.placementStatus === 'Unplaced').length;
    const multiple = students.filter((s) => s.offersCount > 1).length;
    return { total, placed, unplaced, multiple };
  }, [students]);

  // Filter Pipeline
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const name = s.studentName || '';
      const roll = s.rollNumber || '';
      const company = s.companyPlaced || '';

      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        roll.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (selectedDept !== 'All' && s.department !== selectedDept) return false;

      if (selectedTab === 'Placed') return s.placementStatus === 'Placed';
      if (selectedTab === 'Unplaced') return s.placementStatus === 'Unplaced';
      if (selectedTab === 'Multiple Offers') return s.offersCount > 1;
      return true;
    });
  }, [students, searchQuery, selectedTab, selectedDept]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredStudents.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredStudents, currentPage, rowsPerPage]);

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Department', 'CGPA', 'Attendance', 'Offers Count', 'Placement Status', 'Company Placed', 'Offered Package'];
    const rows = filteredStudents.map((s) => [
      `"${s.studentName}"`,
      `"${s.rollNumber}"`,
      `"${s.department}"`,
      `"${s.cgpa}"`,
      `"${s.attendancePct}"`,
      `"${s.offersCount}"`,
      `"${s.placementStatus}"`,
      `"${s.companyPlaced}"`,
      `"${s.offeredPackage}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Placement_Status_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exported student placement data to CSV');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-amber-700 shrink-0" />
          <span>Institutional Student Placement Oversight • Placement Eligibility Monitoring • Academic Records Read-Only</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-800 font-semibold flex-wrap">
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Academic CGPA Read-Only</span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Faculty Approvals Read-Only</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              TPO Master Placement Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase tracking-wider">
              Student Placement Eligibility & Allocation Monitoring
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Student Placement Oversight & Allocation
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor institutional student placement statistics, track individual student offer counts, and verify placement allocation statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={loadData}
            className="text-xs gap-1.5 py-2 px-3"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 py-2 px-3"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 4 Clickable Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => { setSelectedTab('All'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'All' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                TOTAL ENROLLED
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to view all students</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedTab('Placed'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Placed' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                PLACED STUDENTS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.placed}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Click to view placed</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedTab('Unplaced'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Unplaced' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                UNPLACED STUDENTS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.unplaced}</p>
              <span className="text-[10px] font-semibold text-amber-600">Click to view unplaced</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedTab('Multiple Offers'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Multiple Offers' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                MULTIPLE OFFERS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.multiple}</p>
              <span className="text-[10px] font-semibold text-purple-600">Click to view multiple</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
          </div>
        </button>
      </div>

      {/* Data Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">Institutional Students Placement Data Grid</h3>
              <p className="text-xs text-[#6B7280]">
                Showing {paginatedStudents.length} of {filteredStudents.length} student(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search Student, Roll No, Company..."
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">CGPA (Read-Only)</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Offers Recd</th>
                <th className="py-3 px-4">Placement Status</th>
                <th className="py-3 px-4">Recruiter & CTC Package</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDFE]">
              {paginatedStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#171717]">
                    <p>{s.studentName}</p>
                    <span className="text-[10px] text-[#6B7280]">{s.rollNumber}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#171717]">{s.department}</td>
                  <td className="py-3.5 px-4 font-bold text-purple-700">{s.cgpa} CGPA</td>
                  <td className="py-3.5 px-4 text-[#171717]">{s.attendancePct}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-700">{s.offersCount} Offer(s)</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.placementStatus === 'Placed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {s.placementStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#171717]">{s.companyPlaced}</p>
                    <span className="text-[10px] text-emerald-700 font-bold">{s.offeredPackage}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing profile for ${s.studentName}`)}
                      className="px-3 py-1 rounded-xl font-semibold text-xs bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer"
                    >
                      View Student
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Footer */}
      <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B7280] gap-2">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-[#A874F7]" />
          <span>Data Source: <strong>Supabase Single Source of Truth</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Loaded: <strong>{filteredStudents.length} Student Record(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
        </div>
      </div>
    </div>
  );
};
