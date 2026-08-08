import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Database,
  Activity,
  List,
  GitCommit,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLogsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleString('en-GB'));

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const records = await adminService.fetchSystemAuditLogs();
      setLogs(records || []);
      setLastSyncedTime(new Date().toLocaleString('en-GB'));

      await adminService.logAdminAuditAction({
        userId: user?.id,
        action: 'Viewed System Audit Logs Stream',
      });
    } catch (err) {
      console.error('Error loading system audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Pipeline
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const action = l.action || '';
      const moduleName = l.module || '';
      const userId = l.userId || '';

      const matchesSearch =
        !q ||
        action.toLowerCase().includes(q) ||
        moduleName.toLowerCase().includes(q) ||
        userId.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (selectedModule !== 'All' && l.module !== selectedModule) return false;
      if (selectedSeverity !== 'All' && l.severity !== selectedSeverity) return false;
      return true;
    });
  }, [logs, searchQuery, selectedModule, selectedSeverity]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredLogs, currentPage, rowsPerPage]);

  const handleExportCSV = async () => {
    if (!filteredLogs.length) {
      toast.error('No audit log records available to export');
      return;
    }

    const headers = ['Timestamp', 'User ID', 'Role', 'Module', 'Action', 'IP Address', 'Device', 'Status'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userId}"`,
      `"${l.role}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${l.ipAddress}"`,
      `"${l.device}"`,
      `"${l.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `System_Audit_Logs_Stream_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await adminService.logAdminAuditAction({
      userId: user?.id,
      action: 'Exported Filtered System Audit Logs CSV',
    });

    toast.success('Exported Filtered System Audit Logs Stream to CSV');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-[#A874F7] shrink-0" />
          <span>System Audit Monitoring • Security Event Stream • Global Activity Audit Logging</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300 font-semibold flex-wrap">
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Supabase Audit Logs Table</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              System Administrator Master Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase tracking-wider">
              Audit Logs & Security Stream Viewer
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            System Audit Logs & Security Events
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Audit system actions, user role modifications, offer verifications, and security events logged across Student, Faculty, Company, TPO, and HOD portals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="bg-[#F3EDFF]/60 p-1 rounded-xl border border-[#E9DDFE] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-white text-[#A874F7] shadow-xs' : 'text-[#6B7280]'
              }`}
            >
              <List size={13} />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'timeline' ? 'bg-white text-[#A874F7] shadow-xs' : 'text-[#6B7280]'
              }`}
            >
              <GitCommit size={13} />
              <span>Timeline</span>
            </button>
          </div>

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
            <span>Export Filtered CSV</span>
          </Button>
        </div>
      </div>

      {/* Dynamic Audit KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E9DDFE] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              TOTAL AUDIT LOGS
            </span>
            <p className="text-2xl font-bold text-[#171717] mt-1">{logs.length}</p>
            <span className="text-[10px] font-semibold text-emerald-600">Active System Stream</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9DDFE] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              SECURITY EVENTS
            </span>
            <p className="text-2xl font-bold text-[#171717] mt-1">
              {logs.filter(l => (l.action || '').toLowerCase().includes('role') || (l.action || '').toLowerCase().includes('security') || (l.module || '').toLowerCase().includes('governance')).length}
            </p>
            <span className="text-[10px] font-semibold text-purple-600">Role & Access Changes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9DDFE] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              FAILED LOGINS
            </span>
            <p className="text-2xl font-bold text-[#171717] mt-1">
              {logs.filter(l => (l.action || '').toLowerCase().includes('failed')).length}
            </p>
            <span className="text-[10px] font-semibold text-emerald-600">Recorded Auth Failures</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9DDFE] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              CRITICAL EVENTS
            </span>
            <p className="text-2xl font-bold text-[#171717] mt-1">
              {logs.filter(l => l.severity === 'Warning' || l.status === 'Warning').length}
            </p>
            <span className="text-[10px] font-semibold text-amber-600">Discrepancy Flags</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Main Audit Logs Display (Table or Timeline) */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">Global System Audit Activity Stream</h3>
              <p className="text-xs text-[#6B7280]">
                Showing {paginatedLogs.length} of {filteredLogs.length} audit log record(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search Action, Module, User ID..."
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>

            <select
              value={selectedModule}
              onChange={(e) => { setSelectedModule(e.target.value); setCurrentPage(1); }}
              className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="All">All Modules</option>
              <option value="System Governance">System Governance</option>
              <option value="TPO Placement Portal">TPO Placement Portal</option>
              <option value="HOD Department Portal">HOD Department Portal</option>
              <option value="Faculty Portal">Faculty Portal</option>
              <option value="Company Mentor Portal">Company Mentor Portal</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => { setSelectedSeverity(e.target.value); setCurrentPage(1); }}
              className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Normal">Normal Events</option>
              <option value="Warning">Warning Events</option>
            </select>
          </div>
        </div>

        {viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User ID / Role</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Action Performed</th>
                  <th className="py-3 px-4">IP & Device</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDFE]">
                {paginatedLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#6B7280] text-[11px]">{l.timestamp}</td>
                    <td className="py-3.5 px-4 font-bold text-[#171717]">
                      <p>{l.userId}</p>
                      <span className="text-[10px] text-[#A874F7] uppercase">{l.role}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#171717]">{l.module}</td>
                    <td className="py-3.5 px-4 text-[#171717] font-medium">{l.action}</td>
                    <td className="py-3.5 px-4 text-[#6B7280] text-[10px]">
                      <p>{l.ipAddress}</p>
                      <span>{l.device}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        l.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Timeline View (Requirement #13) */
          <div className="p-4 space-y-4 text-xs">
            {paginatedLogs.map((l) => (
              <div key={l.id} className="flex gap-3 items-start border-l-2 border-[#A874F7] pl-4 py-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A874F7] mt-1 shrink-0 -ml-[21px] ring-4 ring-white" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171717]">{l.action}</span>
                    <span className="text-[10px] text-[#6B7280]">{l.timestamp}</span>
                  </div>
                  <p className="text-[#6B7280] text-[11px]">
                    User <strong>{l.userId}</strong> ({l.role.toUpperCase()}) in <strong>{l.module}</strong> via {l.ipAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B7280] gap-2">
        <div className="flex items-center gap-2">
          <Database size={13} className="text-[#A874F7]" />
          <span>Data Source: <strong>Supabase Single Source of Truth</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Loaded: <strong>{filteredLogs.length} Audit Record(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
          <span>Version: <strong>Not Configured</strong></span>
        </div>
      </div>
    </div>
  );
};
