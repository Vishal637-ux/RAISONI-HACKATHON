import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { hodService } from '../../services/hodService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Briefcase,
  Search,
  RefreshCw,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Database,
  Building2,
  User,
  GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HODInternshipsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleString('en-GB'));

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const records = await hodService.fetchHODInternships();
      setInternships(records || []);
      setLastSyncedTime(new Date().toLocaleString('en-GB'));

      await hodService.logHODAuditAction({
        userId: user?.id,
        action: 'Viewed Department Internships Page',
      });
    } catch (err) {
      console.error('Error loading department internships:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Pipeline
  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const title = item.title || '';
      const student = item.studentName || '';
      const company = item.companyName || '';
      const mentor = item.facultyMentor || '';

      const matchesSearch =
        !q ||
        title.toLowerCase().includes(q) ||
        student.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        mentor.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      return true;
    });
  }, [internships, searchQuery]);

  const handleExportCSV = async () => {
    const headers = ['Internship Title', 'Student Name', 'Roll Number', 'Company Name', 'Faculty Mentor', 'Company Mentor', 'Attendance %', 'Work Log Progress', 'Tech Evaluation Status', 'Academic Status', 'Duration'];
    const rows = filteredInternships.map((i) => [
      `"${i.title}"`,
      `"${i.studentName}"`,
      `"${i.rollNumber}"`,
      `"${i.companyName}"`,
      `"${i.facultyMentor}"`,
      `"${i.companyMentor}"`,
      `"${i.attendancePct}"`,
      `"${i.workLogProgressPct}"`,
      `"${i.techEvaluationStatus}"`,
      `"${i.academicStatus}"`,
      `"${i.duration}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Department_Internships_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await hodService.logHODAuditAction({
      userId: user?.id,
      action: 'Exported Department Internships Audit CSV',
    });

    toast.success('Exported Department Internships Audit Report to CSV');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-amber-700 shrink-0" />
          <span>Department Internship Monitoring • Academic Approvals & Work Log Audit • Technical Evaluation Read-Only</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-800 font-semibold flex-wrap">
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Company Technical Review Read-Only</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              HOD Master Department Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase tracking-wider">
              Department Internship Logs & Attendance Audit
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Department Internships Monitoring
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Audit student internship work logs, monitor monthly attendance verification by faculty, and review academic approval status.
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

      {/* Data Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">Department Internship Records Data Grid</h3>
              <p className="text-xs text-[#6B7280]">
                Showing {filteredInternships.length} internship record(s)
              </p>
            </div>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Title, Student, Company, Mentor..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                <th className="py-3 px-4">Internship Role & Student</th>
                <th className="py-3 px-4">Company & Mentors</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Work Log Progress</th>
                <th className="py-3 px-4">Tech Evaluation (Read-Only)</th>
                <th className="py-3 px-4">Academic Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDFE]">
              {filteredInternships.map((item) => (
                <tr key={item.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#171717]">
                    <p className="text-[#A874F7]">{item.title}</p>
                    <span className="text-[11px] text-[#171717] block font-bold">{item.studentName}</span>
                    <span className="text-[10px] text-[#6B7280]">{item.rollNumber}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#171717]">
                    <p className="font-bold">{item.companyName}</p>
                    <span className="text-[10px] text-[#6B7280] block">Faculty: {item.facultyMentor}</span>
                    <span className="text-[10px] text-[#6B7280] block">Company: {item.companyMentor}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-700">{item.attendancePct}</td>
                  <td className="py-3.5 px-4 font-bold text-purple-700">{item.workLogProgressPct}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.techEvaluationStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.academicStatus.includes('Approved') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.academicStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#6B7280] text-[11px] font-medium">{item.duration}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing internship logs for ${item.studentName}`)}
                      className="px-3 py-1 rounded-xl font-semibold text-xs bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer"
                    >
                      Inspect Logs
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
          <span>Loaded: <strong>{filteredInternships.length} Internship Record(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
        </div>
      </div>
    </div>
  );
};
