import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { hodService } from '../../services/hodService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Users,
  Search,
  RefreshCw,
  Download,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  Database,
  Award,
  BarChart3,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HODFacultyPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [facultyList, setFacultyList] = useState([]);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleString('en-GB'));

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkload, setSelectedWorkload] = useState('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const records = await hodService.fetchHODFacultyList();
      setFacultyList(records || []);
      setLastSyncedTime(new Date().toLocaleString('en-GB'));

      await hodService.logHODAuditAction({
        userId: user?.id,
        action: 'Viewed Faculty Workload Analytics Page',
      });
    } catch (err) {
      console.error('Error loading faculty list:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Pipeline
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const name = f.facultyName || '';
      const desig = f.designation || '';

      const matchesSearch = !q || name.toLowerCase().includes(q) || desig.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (selectedWorkload !== 'All' && f.workloadStatus !== selectedWorkload) return false;
      return true;
    });
  }, [facultyList, searchQuery, selectedWorkload]);

  const handleExportCSV = async () => {
    const headers = ['Faculty Name', 'Designation', 'Assigned Students', 'Active Internships', 'Pending Reviews', 'Completed Reviews', 'Workload Status', 'Email'];
    const rows = filteredFaculty.map((f) => [
      `"${f.facultyName}"`,
      `"${f.designation}"`,
      `"${f.assignedStudentsCount}"`,
      `"${f.activeInternshipsCount}"`,
      `"${f.pendingReviewsCount}"`,
      `"${f.completedReviewsCount}"`,
      `"${f.workloadStatus}"`,
      `"${f.email}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Faculty_Mentorship_Workload_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await hodService.logHODAuditAction({
      userId: user?.id,
      action: 'Exported Faculty Mentorship Workload CSV',
    });

    toast.success('Exported Faculty Workload Report to CSV');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-amber-700 shrink-0" />
          <span>Faculty Academic Mentorship Oversight • Mentee Allocation Administration • Workload Monitoring</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-800 font-semibold flex-wrap">
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Academic Records Read-Only</span>
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
              Faculty Mentors Workload & Mentee Allocation Oversight
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Faculty Mentors & Workload Analytics
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitor department faculty mentee allocations, track pending work log review queues, and analyze faculty mentorship workload distribution.
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

      {/* Faculty Data Grid */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">Department Faculty Mentors Workload Analytics</h3>
              <p className="text-xs text-[#6B7280]">
                Showing {filteredFaculty.length} faculty mentor(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Faculty Name, Designation..."
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>

            <select
              value={selectedWorkload}
              onChange={(e) => setSelectedWorkload(e.target.value)}
              className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="All">All Workloads</option>
              <option value="High">High Workload</option>
              <option value="Medium">Medium Workload</option>
              <option value="Low">Low Workload</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                <th className="py-3 px-4">Faculty Mentor</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Assigned Students</th>
                <th className="py-3 px-4">Active Internships</th>
                <th className="py-3 px-4">Pending Reviews</th>
                <th className="py-3 px-4">Completed Reviews</th>
                <th className="py-3 px-4">Workload Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDFE]">
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#171717]">
                    <p>{f.facultyName}</p>
                    <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
                      <Mail size={10} /> {f.email}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#171717] font-semibold">{f.designation}</td>
                  <td className="py-3.5 px-4 font-bold text-[#A874F7]">{f.assignedStudentsCount} Mentees</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-700">{f.activeInternshipsCount} Active</td>
                  <td className="py-3.5 px-4 font-bold text-amber-700">{f.pendingReviewsCount} Pending</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">{f.completedReviewsCount} Completed</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      f.workloadStatus === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      f.workloadStatus === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {f.workloadStatus} Workload
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing mentees for ${f.facultyName}`)}
                      className="px-3 py-1 rounded-xl font-semibold text-xs bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer"
                    >
                      Inspect Mentees
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
          <span>Loaded: <strong>{filteredFaculty.length} Faculty Record(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
        </div>
      </div>
    </div>
  );
};
