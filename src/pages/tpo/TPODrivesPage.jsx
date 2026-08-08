import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tpoService } from '../../services/tpoService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Building2,
  Users,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  MapPin,
  GraduationCap,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TPODrivesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleString('en-GB'));

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [driveForm, setDriveForm] = useState({
    companyName: '',
    driveTitle: '',
    driveDate: '',
    venue: '',
    eligibleDepts: 'Computer, IT, ENTC',
    minCgpa: '6.5',
    rolesOffered: '',
    packageOffered: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const records = await tpoService.fetchTPOPlacementDrives();
      setDrives(records || []);
      setLastSyncedTime(new Date().toLocaleString('en-GB'));

      await tpoService.logTPOAuditAction({
        userId: user?.id,
        action: 'Viewed Placement Drives Page',
      });
    } catch (err) {
      console.error('Error loading placement drives:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = drives.length;
    const upcoming = drives.filter((d) => d.status === 'Upcoming').length;
    const ongoing = drives.filter((d) => d.status === 'Ongoing').length;
    const completed = drives.filter((d) => d.status === 'Completed').length;
    return { total, upcoming, ongoing, completed };
  }, [drives]);

  // Filter Pipeline
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const company = d.companyName || '';
      const title = d.driveTitle || '';
      const venue = d.venue || '';

      const matchesSearch =
        !q ||
        company.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        venue.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (selectedTab === 'Upcoming') return d.status === 'Upcoming';
      if (selectedTab === 'Ongoing') return d.status === 'Ongoing';
      if (selectedTab === 'Completed') return d.status === 'Completed';
      return true;
    });
  }, [drives, searchQuery, selectedTab]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredDrives.length / rowsPerPage) || 1;
  const paginatedDrives = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredDrives.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredDrives, currentPage, rowsPerPage]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!driveForm.companyName || !driveForm.driveTitle || !driveForm.driveDate) {
      toast.error('Please fill in all mandatory drive fields');
      return;
    }

    await tpoService.schedulePlacementDrive(user?.id, driveForm);
    toast.success(`Scheduled Campus Drive: ${driveForm.driveTitle} for ${driveForm.companyName}`);
    setShowScheduleModal(false);
    setDriveForm({
      companyName: '',
      driveTitle: '',
      driveDate: '',
      venue: '',
      eligibleDepts: 'Computer, IT, ENTC',
      minCgpa: '6.5',
      rolesOffered: '',
      packageOffered: '',
    });
    await loadData();
  };

  const handleExportCSV = () => {
    const headers = ['Company Name', 'Drive Title', 'Drive Date', 'Venue', 'Eligible Depts', 'Min CGPA', 'Roles Offered', 'Package', 'Registered Students', 'Status'];
    const rows = filteredDrives.map((d) => [
      `"${d.companyName}"`,
      `"${d.driveTitle}"`,
      `"${d.driveDate}"`,
      `"${d.venue}"`,
      `"${d.eligibleDepts}"`,
      `"${d.minCgpa}"`,
      `"${d.rolesOffered}"`,
      `"${d.packageOffered}"`,
      `"${d.registeredStudentsCount}"`,
      `"${d.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Campus_Placement_Drives_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exported placement drive schedule to CSV');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-amber-700 shrink-0" />
          <span>Campus Recruitment Oversight • Placement Drive Administration • Academic Records Read-Only</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-800 font-semibold flex-wrap">
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Academic Records Read-Only</span>
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
              Institutional Campus Recruitment Drives Schedule
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Campus Placement Drives Management
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Schedule campus recruitment drives, set stream eligibility thresholds, track student drive registrations, and manage recruitment events.
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
            variant="primary"
            onClick={() => setShowScheduleModal(true)}
            className="text-xs gap-1.5 py-2 px-4 shadow-sm bg-[#A874F7] hover:bg-[#965BEB] text-white"
          >
            <Plus size={14} />
            <span>Schedule Campus Drive</span>
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
                TOTAL CAMPUS DRIVES
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to view all drives</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedTab('Upcoming'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Upcoming' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                UPCOMING DRIVES
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.upcoming}</p>
              <span className="text-[10px] font-semibold text-purple-600">Click to view upcoming</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedTab('Ongoing'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Ongoing' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                ONGOING DRIVES
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.ongoing}</p>
              <span className="text-[10px] font-semibold text-amber-600">Click to view ongoing</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedTab('Completed'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Completed' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                COMPLETED DRIVES
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.completed}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Click to view completed</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </button>
      </div>

      {/* Main Data Grid Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">Campus Placement Drives Schedule Data Grid</h3>
              <p className="text-xs text-[#6B7280]">
                Showing {paginatedDrives.length} of {filteredDrives.length} drive(s)
              </p>
            </div>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search Company, Drive Title, Venue..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
            />
          </div>
        </div>

        {/* Drives Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                <th className="py-3 px-4">Recruiting Organization</th>
                <th className="py-3 px-4">Drive Title & Date</th>
                <th className="py-3 px-4">Venue & Location</th>
                <th className="py-3 px-4">Eligibility & Min CGPA</th>
                <th className="py-3 px-4">Roles & CTC Package</th>
                <th className="py-3 px-4">Registrations</th>
                <th className="py-3 px-4">Drive Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDFE]">
              {paginatedDrives.map((drive) => (
                <tr key={drive.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#171717]">{drive.companyName}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#A874F7]">{drive.driveTitle}</p>
                    <span className="text-[10px] text-[#6B7280]">{drive.driveDate}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#171717]">{drive.venue}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#171717]">{drive.eligibleDepts}</p>
                    <span className="text-[10px] text-purple-700 font-bold">Min: {drive.minCgpa}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#171717]">{drive.rolesOffered}</p>
                    <span className="text-[10px] text-emerald-700 font-bold">{drive.packageOffered}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-blue-700 block">{drive.registeredStudentsCount} Students</span>
                    <span className="text-[10px] text-[#6B7280]">{drive.selectedStudentsCount} Selected</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      drive.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      drive.status === 'Ongoing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {drive.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing details for ${drive.driveTitle}`)}
                      className="px-3 py-1 rounded-xl font-semibold text-xs bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer"
                    >
                      Inspect Drive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="bg-white border border-[#E9DDFE] max-w-lg w-full p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
              <h3 className="text-base font-bold text-[#171717]">Schedule Campus Recruitment Drive</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[#6B7280] hover:text-[#171717]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#171717] mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={driveForm.companyName}
                  onChange={(e) => setDriveForm({ ...driveForm, companyName: e.target.value })}
                  placeholder="e.g. Google India Pvt Ltd"
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171717] mb-1">Drive Title *</label>
                <input
                  type="text"
                  required
                  value={driveForm.driveTitle}
                  onChange={(e) => setDriveForm({ ...driveForm, driveTitle: e.target.value })}
                  placeholder="e.g. Annual Campus Recruitment 2026"
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">Drive Date *</label>
                  <input
                    type="date"
                    required
                    value={driveForm.driveDate}
                    onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                    className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">Venue / Online Link</label>
                  <input
                    type="text"
                    value={driveForm.venue}
                    onChange={(e) => setDriveForm({ ...driveForm, venue: e.target.value })}
                    placeholder="e.g. Main Auditorium"
                    className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">Roles Offered</label>
                  <input
                    type="text"
                    value={driveForm.rolesOffered}
                    onChange={(e) => setDriveForm({ ...driveForm, rolesOffered: e.target.value })}
                    placeholder="e.g. Software Trainee"
                    className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171717] mb-1">CTC Package</label>
                  <input
                    type="text"
                    value={driveForm.packageOffered}
                    onChange={(e) => setDriveForm({ ...driveForm, packageOffered: e.target.value })}
                    placeholder="e.g. ₹8.5 LPA"
                    className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDFE]">
                <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="bg-[#A874F7] hover:bg-[#965BEB] text-white">
                  Schedule Drive
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B7280] gap-2">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-[#A874F7]" />
          <span>Data Source: <strong>Supabase Single Source of Truth</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Loaded: <strong>{filteredDrives.length} Campus Drive(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
        </div>
      </div>
    </div>
  );
};
