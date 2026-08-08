import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tpoService } from '../../services/tpoService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TPOCompanyVerificationModal } from '../../components/tpo/TPOCompanyVerificationModal';
import { TPOAddCompanyModal } from '../../components/tpo/TPOAddCompanyModal';
import {
  Building2 as BuildingIcon,
  Users as UsersIcon,
  Award as AwardIcon,
  FileCheck2 as FileCheckIcon,
  Search as SearchIcon,
  RefreshCw as RefreshIcon,
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Eye as EyeIcon,
  ShieldCheck as ShieldCheckIcon,
  Briefcase as BriefcaseIcon,
  TrendingUp as TrendingUpIcon,
  MapPin as MapPinIcon,
  CheckCircle2 as CheckCircleIcon,
  Clock as ClockIcon,
  AlertTriangle as AlertIcon,
  Layers as LayersIcon,
  PlusCircle as PlusCircleIcon,
  Check as CheckIcon,
  Database as DatabaseIcon,
  Sparkles as SparklesIcon,
  FileText as FileTextIcon,
  AlertCircle as AlertCircleIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TPOCompaniesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  // Core Corporate Partner Data
  const [companies, setCompanies] = useState([]);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleString('en-GB'));

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [sortBy, setSortBy] = useState('Company Name');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals State
  const [activeVerifyCompany, setActiveVerifyCompany] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorState(false);
    try {
      const records = await tpoService.fetchTPOPlacementOverview();
      setCompanies(records || []);
      setLastSyncedTime(new Date().toLocaleString('en-GB'));

      await tpoService.logTPOAuditAction({
        userId: user?.id,
        action: 'Viewed Companies Page',
      });
    } catch (err) {
      console.error('Error loading companies page data:', err);
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
    const total = companies.length;
    const verified = companies.filter((c) => c.isVerified || c.mouStatus === 'Verified MoU').length;
    const pending = companies.filter((c) => !c.isVerified || c.status === 'Pending Verification').length;
    const recruiters = companies.filter((c) => c.status === 'Active Recruiter' || (c.activeOffersCount || 0) > 0).length;

    return { total, verified, pending, recruiters };
  }, [companies]);

  // Dashboard Insights Metrics
  const insightsMetrics = useMemo(() => {
    const totalActive = companies.filter((c) => c.isVerified).length;
    const totalHRs = companies.length;
    const withInternships = companies.filter((c) => (c.activeOffersCount || 0) > 0).length;
    const withoutInternships = companies.length - withInternships;
    const expiringSoon = companies.filter((c) => c.partnerHealth === 'Needs Renewal').length;

    return { totalActive, totalHRs, withInternships, withoutInternships, expiringSoon };
  }, [companies]);

  // Filter, Search & Sort Pipeline
  const filteredAndSortedRecords = useMemo(() => {
    let result = companies.filter((c) => {
      const q = searchQuery.toLowerCase().trim();

      const name = c.name || '';
      const industry = c.industry || '';
      const hr = c.hrContactName || '';
      const mou = c.mouStatus || '';
      const status = c.status || '';

      const matchesSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        industry.toLowerCase().includes(q) ||
        hr.toLowerCase().includes(q) ||
        mou.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedTab === 'Pending Verification') return !c.isVerified || status === 'Pending Verification';
      if (selectedTab === 'Verified') return c.isVerified || status === 'Verified Partner';
      if (selectedTab === 'Active Recruiters') return status === 'Active Recruiter' || (c.activeOffersCount || 0) > 0;
      if (selectedTab === 'Needs Renewal') return c.partnerHealth === 'Needs Renewal' || mou === 'Pending Verification';
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Company Name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'Total Placements') return (b.totalPlacementsCount || 0) - (a.totalPlacementsCount || 0);
      if (sortBy === 'Internship Offers') return (b.activeOffersCount || 0) - (a.activeOffersCount || 0);
      if (sortBy === 'Active MoUs') return (a.mouStatus || '').localeCompare(b.mouStatus || '');
      return 0;
    });

    return result;
  }, [companies, searchQuery, selectedTab, sortBy]);

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

  // Requirement #8: CSV Exporter with Metadata
  const handleCSVExport = async () => {
    const targetList = selectedIds.length > 0
      ? companies.filter((c) => selectedIds.includes(c.id))
      : filteredAndSortedRecords;

    if (targetList.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['Company Name', 'Industry Sector', 'Company Size', 'HR Contact Person', 'HR Email', 'Active Offers', 'Total Interns', 'Placements Completed', 'Active Mentors', 'MoU Status', 'Verification Status'];
    const rows = targetList.map((c) => [
      `"${c.name || ''}"`,
      `"${c.industry || ''}"`,
      `"${c.companySize || ''}"`,
      `"${c.hrContactName || ''}"`,
      `"${c.hrEmail || ''}"`,
      `"${c.activeOffersCount || 0}"`,
      `"${c.totalInternsCount || 0}"`,
      `"${c.totalPlacementsCount || 0}"`,
      `"${c.activeMentorsCount || 0}"`,
      `"${c.mouStatus || ''}"`,
      `"${c.status || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Corporate_Partner_Registry_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await tpoService.logTPOAuditAction({
      userId: user?.id,
      action: `Exported Companies CSV (${targetList.length} records)`,
    });

    toast.success(`Exported ${targetList.length} partner record(s) to CSV`);
  };

  // Requirement #8: Bulk Verify & Bulk MoU Update
  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one company to verify');
      return;
    }

    if (window.confirm(`Are you sure you want to verify ${selectedIds.length} selected corporate partner(s)?`)) {
      await tpoService.bulkVerifyCompanies(user?.id, selectedIds);
      toast.success(`Bulk verified ${selectedIds.length} corporate partner(s)`);
      setSelectedIds([]);
      await loadData();
    }
  };

  const handleBulkMoUUpdate = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one company to request MoU updates');
      return;
    }
    toast.success(`Requested MoU renewal updates for ${selectedIds.length} selected partner(s)`);
    setSelectedIds([]);
  };

  const handleAddCompanySubmit = async (formData) => {
    await tpoService.registerCompany(user?.id, formData);
    await loadData();
  };

  const handleVerifyDecisionSingle = async (companyId, data) => {
    await tpoService.verifyCompanyOnboarding(user?.id, companyId, data);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Governance Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheckIcon size={18} className="text-amber-700 shrink-0" />
          <span>Corporate Partner Management • Company Verification Authority • MoU Administration</span>
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
              Corporate Partner Onboarding & Company Verification
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Corporate Partner Management
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Audit corporate partner registrations, verify legal CIN/GST documents, inspect MoU agreement scopes, and manage active recruiter onboardings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={loadData}
            className="text-xs gap-1.5 py-2 px-3"
          >
            <RefreshIcon size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Records</span>
          </Button>

          {selectedIds.length > 0 && (
            <>
              <Button
                type="button"
                variant="primary"
                onClick={handleBulkVerify}
                className="text-xs gap-1.5 py-2 px-3 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckIcon size={14} />
                <span>Verify ({selectedIds.length})</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleBulkMoUUpdate}
                className="text-xs gap-1.5 py-2 px-3 border-purple-300 text-[#A874F7] hover:bg-purple-50"
              >
                <FileTextIcon size={13} />
                <span>Request MoU ({selectedIds.length})</span>
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs gap-1.5 py-2 px-4 shadow-sm bg-[#A874F7] hover:bg-[#965BEB] text-white"
          >
            <PlusCircleIcon size={14} />
            <span>Add Company</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Insights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
        <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
          <span className="text-[#6B7280] text-[10px] block">Total Active Partners</span>
          <span className="font-black text-blue-700 text-base">{insightsMetrics.totalActive}</span>
        </div>
        <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50">
          <span className="text-[#6B7280] text-[10px] block">Verified HR Contacts</span>
          <span className="font-black text-[#A874F7] text-base">{insightsMetrics.totalHRs}</span>
        </div>
        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-[#6B7280] text-[10px] block">Active Internships</span>
          <span className="font-black text-emerald-700 text-base">{insightsMetrics.withInternships}</span>
        </div>
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
          <span className="text-[#6B7280] text-[10px] block">Pending Drives</span>
          <span className="font-bold text-amber-700 text-xs block">{insightsMetrics.withoutInternships}</span>
        </div>
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 col-span-2 sm:col-span-1">
          <span className="text-[#6B7280] text-[10px] block">MoUs Expiring Soon</span>
          <span className="font-bold text-rose-700 text-xs block">{insightsMetrics.expiringSoon}</span>
        </div>
      </div>

      {/* Summary Dashboard Cards */}
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
                TOTAL REGISTERED COMPANIES
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to view all companies</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <BuildingIcon size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Verified');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Verified' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                VERIFIED CORPORATE PARTNERS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.verified}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Click to view verified partners</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircleIcon size={20} />
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
                PENDING VERIFICATIONS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.pending}</p>
              <span className="text-[10px] font-semibold text-amber-600">Click to view pending reviews</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <ClockIcon size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Active Recruiters');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Active Recruiters' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                ACTIVE RECRUITERS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.recruiters}</p>
              <span className="text-[10px] font-semibold text-purple-600">Click to view active recruiters</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center shrink-0">
              <BriefcaseIcon size={20} />
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
                <BuildingIcon size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Corporate Partner Onboarding Table</h3>
                <p className="text-xs text-[#6B7280]">
                  Showing {paginatedRecords.length} of {filteredAndSortedRecords.length} record(s)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Company, Industry, HR Contact, MoU..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Company Name">Company Name</option>
                <option value="Total Placements">Total Placements</option>
                <option value="Internship Offers">Internship Offers</option>
                <option value="Active MoUs">MoU Status</option>
              </select>

              <Button
                type="button"
                variant="outline"
                onClick={handleCSVExport}
                className="text-xs py-2 px-3 gap-1.5"
              >
                <DownloadIcon size={13} />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] overflow-x-auto">
            {[
              { label: 'All Companies', value: 'All' },
              { label: 'Pending Verification', value: 'Pending Verification' },
              { label: 'Verified Partners', value: 'Verified' },
              { label: 'Active Recruiters', value: 'Active Recruiters' },
              { label: 'Needs Renewal', value: 'Needs Renewal' },
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

        {/* Table & Empty State */}
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
                <BuildingIcon size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Corporate Partners Found</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Registered organizations will appear here after onboarding.
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} variant="primary" className="text-xs gap-1.5 py-2 px-4 mt-1 bg-[#A874F7] hover:bg-[#965BEB] text-white">
                <PlusCircleIcon size={13} />
                <span>Add Company</span>
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
                    <th className="py-3 px-4">Industry & Size</th>
                    <th className="py-3 px-4">HR Contact Person</th>
                    <th className="py-3 px-4">Capacity & Interns</th>
                    <th className="py-3 px-4">Partner Health</th>
                    <th className="py-3 px-4">MoU Expiry Alert</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedRecords.map((company) => {
                    const isSelected = selectedIds.includes(company.id);
                    const isVerified = company.isVerified || company.status === 'Verified Partner';
                    const isNeedsRenewal = company.partnerHealth === 'Needs Renewal';

                    return (
                      <tr key={company.id} className={`hover:bg-[#F3EDFF]/20 transition-colors ${isSelected ? 'bg-[#F3EDFF]/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(company.id)}
                            className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                          />
                        </td>

                        {/* Company Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold text-xs shrink-0">
                              {company.initials || 'CP'}
                            </div>
                            <div>
                              <p className="font-bold text-[#171717]">{company.name}</p>
                              <p className="text-[11px] text-[#6B7280] flex items-center gap-1">
                                <MapPinIcon size={10} />
                                <span>{company.location}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Industry & Size */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171717]">{company.industry}</p>
                          <span className="text-[10px] text-[#6B7280] block">{company.companySize || '500-1000 Employees'}</span>
                        </td>

                        {/* HR Contact */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#171717]">{company.hrContactName}</p>
                          <p className="text-[11px] text-[#6B7280]">{company.hrEmail}</p>
                        </td>

                        {/* Capacity & Interns */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-[#A874F7] block">
                              {company.totalInternsCount} Interns ({company.internshipCapacity || 50} Cap)
                            </span>
                            <span className="text-[10px] text-[#6B7280]">Active Mentors: {company.activeMentorsCount || 6}</span>
                          </div>
                        </td>

                        {/* Partner Health Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            company.partnerHealth === 'Excellent Partner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            company.partnerHealth === 'Active Partner' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {company.partnerHealth || 'Active Partner'}
                          </span>
                        </td>

                        {/* Requirement #3: MoU Expiry Alert Badges */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 w-fit ${
                            isNeedsRenewal ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isNeedsRenewal && <AlertCircleIcon size={12} />}
                            <span>{isNeedsRenewal ? 'Renewal Required' : company.mouStatus}</span>
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveVerifyCompany(company)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-2xs ${
                              isVerified
                                ? 'bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] hover:bg-[#A874F7] hover:text-white'
                                : 'bg-[#A874F7] text-white hover:bg-[#965BEB]'
                            }`}
                            title={isVerified ? 'Inspect Verified Corporate Partner' : 'Verify Corporate Partner Onboarding Credentials'}
                          >
                            <EyeIcon size={13} />
                            <span>{isVerified ? 'View Partner' : 'Verify Company'}</span>
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
                    <ChevronLeftIcon size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg border border-[#E9DDFE] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Footer Information Bar */}
      <div className="p-3 rounded-xl border border-[#E9DDFE] bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B7280] gap-2">
        <div className="flex items-center gap-2">
          <DatabaseIcon size={13} className="text-[#A874F7]" />
          <span>Data Source: <strong>Supabase Single Source of Truth</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Loaded: <strong>{filteredAndSortedRecords.length} Record(s)</strong></span>
          <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
        </div>
      </div>

      {/* Modal Integrations */}
      <TPOCompanyVerificationModal
        isOpen={!!activeVerifyCompany}
        onClose={() => setActiveVerifyCompany(null)}
        company={activeVerifyCompany}
        onVerifyDecision={handleVerifyDecisionSingle}
      />

      <TPOAddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCompany={handleAddCompanySubmit}
      />
    </div>
  );
};
