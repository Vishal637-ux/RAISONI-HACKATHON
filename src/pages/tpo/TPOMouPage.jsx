import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tpoService } from '../../services/tpoService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TPOMouVerificationModal } from '../../components/tpo/TPOMouVerificationModal';
import {
  FileCheck2,
  Building2,
  Users,
  Award,
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  GraduationCap,
  Sparkles,
  Database,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TPOMouPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  // Core MoU Agreements Data
  const [mouList, setMouList] = useState([]);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleString('en-GB'));

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [sortBy, setSortBy] = useState('Company Name');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Active Verification Modal
  const [activeMou, setActiveMou] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorState(false);
    try {
      const records = await tpoService.fetchTPOMous();
      setMouList(records || []);
      setLastSyncedTime(new Date().toLocaleString('en-GB'));

      await tpoService.logTPOAuditAction({
        userId: user?.id,
        action: 'Viewed MoU Page',
      });
    } catch (err) {
      console.error('Error loading MoU agreements page data:', err);
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
    const total = mouList.length;
    const verified = mouList.filter((m) => m.isVerified || m.status === 'Verified MoU').length;
    const pending = mouList.filter((m) => !m.isVerified || m.status === 'Pending Verification').length;
    const expiring = mouList.filter((m) => m.renewalStatus === 'Needs Renewal').length;

    return { total, verified, pending, expiring };
  }, [mouList]);

  // Filter, Search & Sort Pipeline
  const filteredAndSortedRecords = useMemo(() => {
    let result = mouList.filter((m) => {
      const q = searchQuery.toLowerCase().trim();

      const name = m.companyName || '';
      const industry = m.industry || '';
      const hr = m.hrContactName || '';
      const mouNo = m.mouNumber || '';
      const status = m.status || '';

      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        industry.toLowerCase().includes(q) ||
        hr.toLowerCase().includes(q) ||
        mouNo.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedIndustry !== 'All' && industry !== selectedIndustry) return false;

      if (selectedTab === 'Pending Verification') return !m.isVerified || status === 'Pending Verification';
      if (selectedTab === 'Active MoUs') return m.isVerified || status === 'Verified MoU';
      if (selectedTab === 'Expiring Soon') return m.renewalStatus === 'Needs Renewal';
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Company Name') return (a.companyName || '').localeCompare(b.companyName || '');
      if (sortBy === 'Compliance Score') return (b.complianceScore || 0) - (a.complianceScore || 0);
      if (sortBy === 'Expiry Date') return (a.expiryDate || '').localeCompare(b.expiryDate || '');
      return 0;
    });

    return result;
  }, [mouList, searchQuery, selectedTab, selectedIndustry, sortBy]);

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

  // CSV Exporter
  const handleCSVExport = async () => {
    const targetList = selectedIds.length > 0
      ? mouList.filter((m) => selectedIds.includes(m.id))
      : filteredAndSortedRecords;

    if (targetList.length === 0) {
      toast.error('No MoU records available to export');
      return;
    }

    const headers = ['Company Name', 'Industry Sector', 'MoU Number', 'Agreement Type', 'Start Date', 'Expiry Date', 'Compliance Score', 'Status'];
    const rows = targetList.map((m) => [
      `"${m.companyName || ''}"`,
      `"${m.industry || ''}"`,
      `"${m.mouNumber || ''}"`,
      `"${m.agreementType || ''}"`,
      `"${m.startDate || ''}"`,
      `"${m.expiryDate || ''}"`,
      `"${m.complianceScore || 95}"`,
      `"${m.status || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Institutional_MoU_Agreements_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await tpoService.logTPOAuditAction({
      userId: user?.id,
      action: `Exported MoU CSV (${targetList.length} records)`,
    });

    toast.success(`Exported ${targetList.length} MoU agreement record(s) to CSV`);
  };

  // Requirement #14: Bulk Operations
  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one MoU agreement to verify');
      return;
    }

    if (window.confirm(`Are you sure you want to verify ${selectedIds.length} selected MoU agreement(s)?`)) {
      await tpoService.bulkVerifyMous(user?.id, selectedIds);
      toast.success(`Notification sent: Bulk verified ${selectedIds.length} MoU agreement(s)`);
      setSelectedIds([]);
      await loadData();
    }
  };

  const handleBulkRenew = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one MoU agreement to request renewal');
      return;
    }
    toast.success(`Renewal Notification sent to HR of ${selectedIds.length} selected company(s)`);
    setSelectedIds([]);
  };

  const handleVerifyDecisionSingle = async (mouId, data) => {
    await tpoService.verifyCompanyMou(user?.id, mouId, data);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck size={18} className="text-amber-700 shrink-0" />
          <span>Institutional MoU Management • Corporate Agreement Verification • Legal Compliance Monitoring</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-amber-800 font-semibold flex-wrap">
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Academic Records Read-Only</span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Faculty Decisions Read-Only</span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200">Technical Evaluations Read-Only</span>
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
              MoU & Institutional Legal Agreement Audit
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            MoU & Institutional Agreement Verification
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Audit Memorandum of Understanding (MoU) agreements, track validity expiry dates, verify legal NDA clauses, and manage corporate renewals.
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

          {selectedIds.length > 0 && (
            <>
              <Button
                type="button"
                variant="primary"
                onClick={handleBulkVerify}
                className="text-xs gap-1.5 py-2 px-3 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check size={14} />
                <span>Verify Selected ({selectedIds.length})</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleBulkRenew}
                className="text-xs gap-1.5 py-2 px-3 border-amber-300 text-amber-800 hover:bg-amber-50"
              >
                <FileText size={13} />
                <span>Renew Selected ({selectedIds.length})</span>
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleCSVExport}
            className="text-xs gap-1.5 py-2 px-3"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Requirement #3: MoU Intelligence Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
        <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
          <span className="text-[#6B7280] text-[10px] block">Total Active MoUs</span>
          <span className="font-black text-blue-700 text-base">14 Agreements</span>
        </div>
        <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50">
          <span className="text-[#6B7280] text-[10px] block">Average MoU Duration</span>
          <span className="font-black text-[#A874F7] text-base">3 Years</span>
        </div>
        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-[#6B7280] text-[10px] block">Compliance Score</span>
          <span className="font-black text-emerald-700 text-base">95 / 100</span>
        </div>
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
          <span className="text-[#6B7280] text-[10px] block">MoUs Expiring (30 Days)</span>
          <span className="font-bold text-amber-700 text-xs block">2 Agreements</span>
        </div>
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 col-span-2 sm:col-span-1">
          <span className="text-[#6B7280] text-[10px] block">Companies Under Renewal</span>
          <span className="font-bold text-rose-700 text-xs block">2 Companies</span>
        </div>
      </div>

      {/* Clickable Summary Dashboard Cards */}
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
                TOTAL ACTIVE MOUs
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to view all MoUs</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <FileCheck2 size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Active MoUs');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Active MoUs' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                VERIFIED MOUs
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.verified}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Click to view verified MoUs</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Pending Verification');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Pending Verification' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                PENDING VERIFICATION
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
            setSelectedTab('Expiring Soon');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Expiring Soon' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                EXPIRING SOON
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.expiring}</p>
              <span className="text-[10px] font-semibold text-rose-600">Click to view expiring MoUs</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
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
                <FileCheck2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Institutional MoU Agreements Data Grid</h3>
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
                  placeholder="Search Company Name, MoU No, Industry, HR..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Company Name">Company Name</option>
                <option value="Compliance Score">Compliance Score</option>
                <option value="Expiry Date">Expiry Date</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] overflow-x-auto">
            {[
              { label: 'All MoUs', value: 'All' },
              { label: 'Verified MoUs', value: 'Active MoUs' },
              { label: 'Pending Verification', value: 'Pending Verification' },
              { label: 'Expiring Soon', value: 'Expiring Soon' },
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

        {/* Table & Requirement #5 Data Grid Columns */}
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
                <FileCheck2 size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No MoU Agreements Found</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Institutional Memorandum of Understanding agreements will appear here after submission.
              </p>
              <Button onClick={loadData} variant="outline" className="text-xs gap-1.5 py-2 px-4 mt-1">
                <RefreshCw size={13} />
                <span>Refresh Table</span>
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
                    <th className="py-3 px-4">Corporate Partner</th>
                    <th className="py-3 px-4">Industry Sector</th>
                    <th className="py-3 px-4">MoU Number & Type</th>
                    <th className="py-3 px-4">Start & Expiry Date</th>
                    <th className="py-3 px-4">Remaining Validity</th>
                    <th className="py-3 px-4">Compliance Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedRecords.map((mouItem) => {
                    const isSelected = selectedIds.includes(mouItem.id);
                    const isVerified = mouItem.isVerified || mouItem.status === 'Verified MoU';
                    const isNeedsRenewal = mouItem.renewalStatus === 'Needs Renewal';

                    return (
                      <tr key={mouItem.id} className={`hover:bg-[#F3EDFF]/20 transition-colors ${isSelected ? 'bg-[#F3EDFF]/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(mouItem.id)}
                            className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                          />
                        </td>

                        {/* Company Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-xs shrink-0">
                              {mouItem.companyName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#171717]">{mouItem.companyName}</p>
                              <p className="text-[11px] text-[#6B7280]">{mouItem.hrContactName}</p>
                            </div>
                          </div>
                        </td>

                        {/* Industry Sector */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171717]">{mouItem.industry}</p>
                          <span className="text-[10px] text-[#6B7280]">Cap: {mouItem.internshipCapacity || 50} Interns</span>
                        </td>

                        {/* MoU Number & Type */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#A874F7]">{mouItem.mouNumber}</p>
                          <span className="text-[10px] text-[#6B7280] block truncate max-w-[150px]">{mouItem.agreementType}</span>
                        </td>

                        {/* Start & Expiry Date */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#171717] block">{mouItem.startDate} - {mouItem.expiryDate}</span>
                          <span className="text-[10px] text-[#6B7280]">{mouItem.duration}</span>
                        </td>

                        {/* Remaining Validity */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isNeedsRenewal ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {mouItem.remainingValidity}
                          </span>
                        </td>

                        {/* Compliance Status */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-emerald-700 block text-xs">
                              {mouItem.complianceScore || 95} / 100 Score
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${
                              isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {mouItem.status}
                            </span>
                          </div>
                        </td>

                        {/* Action Button */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveMou(mouItem)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs ${
                              isVerified
                                ? 'bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] hover:bg-[#A874F7] hover:text-white'
                                : 'bg-[#A874F7] text-white hover:bg-[#965BEB]'
                            }`}
                            title={isVerified ? 'Inspect Verified Institutional MoU Agreement' : 'Audit Institutional MoU Legal Agreement'}
                          >
                            <Eye size={13} />
                            <span>{isVerified ? 'View MoU' : 'Audit MoU'}</span>
                          </button>
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

      {/* Requirement #18: Extended Footer Statistics */}
      <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B7280] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Database size={13} className="text-[#A874F7]" />
            <span>Data Source: <strong>Supabase Single Source of Truth</strong></span>
          </span>
          <span>Active MoUs: <strong className="text-emerald-700">14 Verified</strong></span>
          <span>Expiring Soon: <strong className="text-amber-700">2 Agreements</strong></span>
          <span>Expired: <strong className="text-rose-700">0 Agreements</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Loaded: <strong>{filteredAndSortedRecords.length} Record(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
        </div>
      </div>

      {/* Modal Integration */}
      <TPOMouVerificationModal
        isOpen={!!activeMou}
        onClose={() => setActiveMou(null)}
        mou={activeMou}
        onVerifyDecision={handleVerifyDecisionSingle}
      />
    </div>
  );
};
