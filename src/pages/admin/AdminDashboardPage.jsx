import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AdminUserModal } from '../../components/admin/AdminUserModal';
import {
  ShieldCheck,
  Users,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Database,
  Lock,
  UserCheck,
  UserX,
  FileText,
  AlertTriangle,
  Layers,
  Key,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleString('en-GB'));

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal State
  const [activeUser, setActiveUser] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchAdminOverview();
      setOverviewData(data);
      setLastSyncedTime(new Date().toLocaleString('en-GB'));

      await adminService.logAdminAuditAction({
        userId: user?.id,
        action: 'Viewed Master User Governance Dashboard',
      });
    } catch (err) {
      console.error('Error loading admin overview:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Pipeline
  const filteredUsers = useMemo(() => {
    if (!overviewData?.users) return [];
    return overviewData.users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const name = u.fullName || '';
      const email = u.email || '';
      const dept = u.department || '';
      const org = u.organization || '';

      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q) ||
        org.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (selectedRole !== 'All' && u.role !== selectedRole) return false;
      if (selectedStatus !== 'All' && u.status !== selectedStatus) return false;
      return true;
    });
  }, [overviewData, searchQuery, selectedRole, selectedStatus]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const handleUpdateUser = async (userId, data) => {
    await adminService.updateUserRoleAndStatus(user?.id, userId, data);
    await loadData();
  };

  const handleExportCSV = async () => {
    if (!filteredUsers.length) {
      toast.error('No user records available to export');
      return;
    }

    const headers = ['Full Name', 'Email', 'Assigned Role', 'Department', 'Organization', 'Account Status', 'Last Login', 'MFA Status', 'Created Date'];
    const rows = filteredUsers.map((u) => [
      `"${u.fullName}"`,
      `"${u.email}"`,
      `"${u.role.toUpperCase()}"`,
      `"${u.department}"`,
      `"${u.organization}"`,
      `"${u.status}"`,
      `"${u.lastLogin}"`,
      `"${u.mfaStatus}"`,
      `"${u.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `System_User_Governance_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await adminService.logAdminAuditAction({
      userId: user?.id,
      action: 'Exported Filtered User Governance Directory CSV',
    });

    toast.success('Exported Filtered System User Directory to CSV');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-[#A874F7] shrink-0" />
          <span>System Administration • User Governance • Platform Security • Global Access Control • Audit Monitoring • Full Authority</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300 font-semibold flex-wrap">
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Root System Governance</span>
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
              System Directory & Access Control Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            System Administrator User Governance
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Chief System Administrator • G. H. Raisoni College of Engineering • Academic Session 2025-2026
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
            <span>Export Filtered CSV</span>
          </Button>
        </div>
      </div>

      {/* Requirement #3: Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => { setSelectedRole('All'); setSelectedStatus('All'); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedRole === 'All' && selectedStatus === 'All' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            TOTAL USERS
          </span>
          <p className="text-xl font-black text-[#171717] mt-1">{overviewData?.summary?.totalUsers ?? 0}</p>
          <span className="text-[9px] font-semibold text-[#A874F7] block mt-0.5">Provisioned</span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatus('Active'); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedStatus === 'Active' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            ACTIVE USERS
          </span>
          <p className="text-xl font-black text-emerald-700 mt-1">{overviewData?.summary?.activeAccounts ?? 0}</p>
          <span className="text-[9px] font-semibold text-emerald-600 block mt-0.5">Access Granted</span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatus('Suspended'); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedStatus === 'Suspended' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            SUSPENDED USERS
          </span>
          <p className="text-xl font-black text-rose-700 mt-1">{overviewData?.summary?.suspendedUsers ?? 0}</p>
          <span className="text-[9px] font-semibold text-rose-600 block mt-0.5">Access Revoked</span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedRole('All'); setCurrentPage(1); }}
          className="p-3.5 rounded-2xl bg-white border border-[#E9DDFE] text-left"
        >
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            PENDING REQUESTS
          </span>
          <p className="text-xl font-black text-amber-700 mt-1">{overviewData?.summary?.pendingRoleRequests ?? 0}</p>
          <span className="text-[9px] font-semibold text-amber-600 block mt-0.5">Pending Queue</span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedRole('All'); setCurrentPage(1); }}
          className="p-3.5 rounded-2xl bg-white border border-[#E9DDFE] text-left"
        >
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            ACTIVE SESSIONS
          </span>
          <p className="text-xl font-black text-blue-700 mt-1">{overviewData?.summary?.activeSessions ?? 'N/A'}</p>
          <span className="text-[9px] font-semibold text-blue-600 block mt-0.5">Live Connections</span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedRole('All'); setCurrentPage(1); }}
          className="p-3.5 rounded-2xl bg-white border border-[#E9DDFE] text-left"
        >
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block">
            TOTAL ROLES
          </span>
          <p className="text-xl font-black text-purple-700 mt-1">{overviewData?.summary?.totalRoles ?? 0}</p>
          <span className="text-[9px] font-semibold text-purple-600 block mt-0.5">Role Matrix</span>
        </button>
      </div>

      {/* Requirement #4: Expanded User Management Data Grid */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">System User Governance Master Directory</h3>
              <p className="text-xs text-[#6B7280]">
                Showing {paginatedUsers.length} of {filteredUsers.length} user record(s)
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
                placeholder="Search Name, Email, Dept, Org..."
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
              className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="company">Company</option>
              <option value="tpo">TPO</option>
              <option value="hod">HOD</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                <th className="py-3 px-4">User Avatar & Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department & Organization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">MFA Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDFE]">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F3EDFF]/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#171717]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {u.initials}
                      </div>
                      <span>{u.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#6B7280]">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      u.role === 'admin' ? 'bg-slate-900 text-white border-slate-800' :
                      u.role === 'tpo' ? 'bg-purple-50 text-[#A874F7] border-purple-200' :
                      u.role === 'hod' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      u.role === 'faculty' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      u.role === 'company' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#171717]">
                    <p className="font-semibold">{u.department}</p>
                    <span className="text-[10px] text-[#6B7280]">{u.organization}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">✓ {u.mfaStatus}</td>
                  <td className="py-3.5 px-4 text-[#6B7280] text-[11px]">{u.lastLogin}</td>
                  <td className="py-3.5 px-4 text-[#6B7280] text-[11px]">{u.createdAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveUser(u)}
                      className="px-3 py-1 rounded-xl font-semibold text-xs bg-[#A874F7] text-white hover:bg-[#965BEB] transition-all cursor-pointer shadow-2xs"
                    >
                      Inspect Profile
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
          <span>Loaded: <strong>{filteredUsers.length} User Record(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
          <span>Version: <strong>Not Configured</strong></span>
        </div>
      </div>

      {/* User Governance Modal */}
      <AdminUserModal
        isOpen={!!activeUser}
        onClose={() => setActiveUser(null)}
        userItem={activeUser}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};
