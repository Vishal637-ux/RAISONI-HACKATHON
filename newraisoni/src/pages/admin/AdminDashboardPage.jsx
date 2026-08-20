import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { authService } from '../../services/authService';
import { AnalyticsStatCard } from '../../components/shared/AnalyticsStatCard';
import { DepartmentChart } from '../../components/shared/DepartmentChart';
import { ROUTES } from '../../constants/routes';
import { 
  Shield, 
  Users, 
  Building, 
  FileText, 
  Activity, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Search, 
  UserCheck, 
  CheckCircle2, 
  PlusCircle, 
  Award, 
  UserPlus, 
  X, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  GraduationCap, 
  Briefcase,
  Layers,
  ArrowRight,
  FileCheck,
  CheckSquare,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { profile, user } = useAuth();
  
  // Tabs: 'overview' | 'users' | 'staff' | 'companies' | 'placement' | 'audit'
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering states for Users tab
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Modal states for Company Onboarding & Provisioning
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({
    company_name: '',
    industry: 'Information Technology',
    address: 'Nagpur IT Park, Maharashtra',
    website: '',
    hr_email: '',
    contact_number: '',
  });

  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionData, setProvisionData] = useState({
    createMode: false,
    userId: '',
    companyId: '',
    designation: 'Senior Technical Lead',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  // Modal states for Staff Governance
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyData, setFacultyData] = useState({
    createMode: false,
    userId: '',
    departmentId: '',
    designation: 'Assistant Professor',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const [showHodModal, setShowHodModal] = useState(false);
  const [hodData, setHodData] = useState({
    createMode: false,
    userId: '',
    departmentId: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const [showTpoModal, setShowTpoModal] = useState(false);
  const [tpoData, setTpoData] = useState({
    createMode: false,
    userId: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  // Invite Link Modal State
  const [inviteModalData, setInviteModalData] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, logsData, allUsersData, allCompaniesData, deptsData] = await Promise.all([
        adminService.getSystemAnalytics(),
        adminService.getAuditLogs(30),
        adminService.getAllUsers(),
        adminService.getAllCompanies(),
        authService.fetchDepartments(),
      ]);
      setAnalytics(statsData);
      setAuditLogs(logsData);
      setUsersList(allUsersData);
      setCompaniesList(allCompaniesData);
      setDepartmentsList(deptsData);
    } catch (err) {
      console.error('Error loading Admin governance data:', err);
      setError(err.message || 'Failed to load system governance data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      await adminService.updateUserRole(userId, newRole, user?.id);
      setSuccessMsg(`User role updated to ${newRole}.`);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusToggle = async (targetUserId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      setUpdatingUserId(targetUserId);
      setError(null);
      setSuccessMsg('');
      await adminService.updateUserStatus(targetUserId, nextStatus, user?.id);
      setSuccessMsg(`User status updated to ${nextStatus}.`);
      await fetchAdminData();
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  };



  const handleCreateCompanySubmit = async (e) => {
    e.preventDefault();
    if (!newCompanyData.company_name.trim()) {
      setError('Company Name is required.');
      return;
    }
    try {
      setSubmittingAction(true);
      setError(null);
      setSuccessMsg('');
      const created = await adminService.createCompany(newCompanyData, user?.id);
      setSuccessMsg(`Company partner "${created.company_name}" successfully registered!`);
      setShowCreateCompanyModal(false);
      setNewCompanyData({
        company_name: '',
        industry: 'Information Technology',
        address: 'Nagpur IT Park, Maharashtra',
        website: '',
        hr_email: '',
        contact_number: '',
      });
      await fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to create company partner.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleProvisionMentorSubmit = async (e) => {
    e.preventDefault();
    if (!provisionData.userId || !provisionData.companyId) {
      setError('Select both a User candidate and a Target Company for mentor provisioning.');
      return;
    }
    try {
      setSubmittingAction(true);
      setError(null);
      setSuccessMsg('');
      await adminService.provisionCompanyMentor(
        provisionData.userId,
        provisionData.companyId,
        provisionData.designation,
        user?.id
      );
      setSuccessMsg('Company Mentor account successfully provisioned and linked to company.');
      setShowProvisionModal(false);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to provision company mentor.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleProvisionFacultySubmit = async (e) => {
    e.preventDefault();
    if (!facultyData.userId || !facultyData.departmentId) {
      setError('Select both a User candidate and a Department for Faculty Mentor provisioning.');
      return;
    }
    try {
      setSubmittingAction(true);
      setError(null);
      setSuccessMsg('');
      await adminService.provisionFacultyMentor(
        facultyData.userId,
        facultyData.departmentId,
        facultyData.designation,
        user?.id
      );
      setSuccessMsg('Faculty Mentor account successfully provisioned and assigned to department.');
      setShowFacultyModal(false);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to provision faculty mentor.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleProvisionHodSubmit = async (e) => {
    e.preventDefault();
    if (!hodData.userId || !hodData.departmentId) {
      setError('Select both a User candidate and a Department for HOD provisioning.');
      return;
    }
    try {
      setSubmittingAction(true);
      setError(null);
      setSuccessMsg('');
      await adminService.provisionHOD(hodData.userId, hodData.departmentId, user?.id);
      setSuccessMsg('HOD role successfully provisioned and assigned to department leadership.');
      setShowHodModal(false);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to provision HOD.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleProvisionTpoSubmit = async (e) => {
    e.preventDefault();
    if (!tpoData.userId) {
      setError('Select a User candidate for TPO Officer provisioning.');
      return;
    }
    try {
      setSubmittingAction(true);
      setError(null);
      setSuccessMsg('');
      await adminService.provisionTPO(tpoData.userId, user?.id);
      setSuccessMsg('TPO Officer account successfully provisioned.');
      setShowTpoModal(false);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to provision TPO officer.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const [updatingCompanyId, setUpdatingCompanyId] = useState(null);

  const handleCompanyStatusToggle = async (companyId, currentStatus) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    try {
      setUpdatingCompanyId(companyId);
      await adminService.updateCompanyStatus(companyId, newStatus, user?.id);
      setSuccessMsg(`Company status updated to ${newStatus}.`);
      await fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update company status.');
    } finally {
      setUpdatingCompanyId(null);
    }
  };

  const generateCompanyInviteLink = (comp) => {
    const origin = window.location.origin;
    const inviteUrl = `${origin}/register/company-mentor?company_id=${comp.id}&company_name=${encodeURIComponent(comp.company_name)}`;
    setInviteModalData({
      companyName: comp.company_name,
      inviteUrl,
    });
  };

  const copyInviteLink = () => {
    if (inviteModalData?.inviteUrl) {
      navigator.clipboard.writeText(inviteModalData.inviteUrl);
      setSuccessMsg('Company Mentor invitation link copied to clipboard!');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const nameMatch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const userStatus = u.status || 'Active';
    const matchesStatus = statusFilter === 'ALL' || userStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const staffUsers = usersList.filter((u) =>
    ['faculty_mentor', 'hod', 'tpo', 'company_mentor'].includes(u.role)
  );

  const roleChartData = analytics?.roleCounts ? [
    { name: 'Students', count: analytics.roleCounts.student },
    { name: 'Faculty', count: analytics.roleCounts.faculty_mentor },
    { name: 'Company Mentors', count: analytics.roleCounts.company_mentor },
    { name: 'HODs', count: analytics.roleCounts.hod },
    { name: 'TPOs', count: analytics.roleCounts.tpo },
    { name: 'Admins', count: analytics.roleCounts.admin },
  ] : [];

  return (
    <PortalLayout 
      title="Admin ERP Dashboard" 
      roleLabel="College Administrator"
      adminActiveTab={activeTab}
      onAdminTabChange={setActiveTab}
    >
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#18201B]">
                Welcome, {profile?.full_name || 'System Admin'}!
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
                Institutional ERP Portal
              </span>
            </div>
            <p className="text-sm text-[#66706A] mt-1">
              Central institutional governance, staff provisioning, company partner onboarding, and system security oversight.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2.5 text-[#1F6B32] hover:bg-[#EAF4EC] rounded-xl border border-[#C5E3CC] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Refresh System Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Notifications & Banners */}
        {error && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626]" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-3 py-1 bg-white border border-[#FCA5A5] text-[#991B1B] font-bold rounded-lg hover:bg-[#FEE2E2] cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-[#EAF4EC] border border-[#C5E3CC] rounded-xl text-xs text-[#1F6B32] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2F8F46]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#E1E7E2] rounded-xl" />
            ))}
          </div>
        ) : activeTab === 'overview' ? (
          /* Overview Tab Content */
          <div className="space-y-6">
            {/* Quick Actions Bar */}
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#18201B] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#2F8F46]" />
                  <span>Quick Administrative Actions</span>
                </h3>
                <span className="text-[11px] text-[#66706A]">Institutional Action Shortcuts</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setShowCreateCompanyModal(true)}
                  className="p-3 bg-[#F8FAF9] hover:bg-[#EAF4EC] border border-[#E1E7E2] hover:border-[#C5E3CC] rounded-xl text-left transition-all group cursor-pointer"
                >
                  <Building className="w-4 h-4 text-[#2F8F46] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-bold text-[#18201B]">Register Host Company</span>
                  <span className="text-[10px] text-[#66706A]">Add industry partner</span>
                </button>

                <button
                  onClick={() => setActiveTab('companies')}
                  className="p-3 bg-[#F8FAF9] hover:bg-[#EAF4EC] border border-[#E1E7E2] hover:border-[#C5E3CC] rounded-xl text-left transition-all group cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#1F6B32] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-bold text-[#18201B]">Invite Company Mentor</span>
                  <span className="text-[10px] text-[#66706A]">Generate invite link</span>
                </button>

                <button
                  onClick={() => setShowFacultyModal(true)}
                  className="p-3 bg-[#F8FAF9] hover:bg-[#EFF6FF] border border-[#E1E7E2] hover:border-[#BFDBFE] rounded-xl text-left transition-all group cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-[#2563EB] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-bold text-[#18201B]">Add Faculty Mentor</span>
                  <span className="text-[10px] text-[#66706A]">Assign department</span>
                </button>

                <button
                  onClick={() => setShowHodModal(true)}
                  className="p-3 bg-[#F8FAF9] hover:bg-[#FDF4FF] border border-[#E1E7E2] hover:border-[#F5D0FE] rounded-xl text-left transition-all group cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#9333EA] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-bold text-[#18201B]">Assign HOD</span>
                  <span className="text-[10px] text-[#66706A]">Department leader</span>
                </button>

                <button
                  onClick={() => setShowTpoModal(true)}
                  className="p-3 bg-[#F8FAF9] hover:bg-[#FFFBEB] border border-[#E1E7E2] hover:border-[#FDE68A] rounded-xl text-left transition-all group cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#D97706] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-bold text-[#18201B]">Add TPO Officer</span>
                  <span className="text-[10px] text-[#66706A]">Placement officer</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="p-3 bg-[#F8FAF9] hover:bg-[#EAF4EC] border border-[#E1E7E2] hover:border-[#C5E3CC] rounded-xl text-left transition-all group cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#2F8F46] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-bold text-[#18201B]">Manage Users</span>
                  <span className="text-[10px] text-[#66706A]">Roles & permissions</span>
                </button>
              </div>
            </div>

            {/* Institutional Overview Metrics Cards */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <AnalyticsStatCard
                  title="Students"
                  value={analytics.roleCounts.student}
                  subtitle="Enrolled students"
                  icon={Users}
                  color="emerald"
                />
                <AnalyticsStatCard
                  title="Faculty"
                  value={analytics.roleCounts.faculty_mentor}
                  subtitle="Academic mentors"
                  icon={GraduationCap}
                  color="blue"
                />
                <AnalyticsStatCard
                  title="HODs"
                  value={analytics.roleCounts.hod}
                  subtitle="Department leaders"
                  icon={Award}
                  color="purple"
                />
                <AnalyticsStatCard
                  title="TPO Officers"
                  value={analytics.roleCounts.tpo}
                  subtitle="Placement team"
                  icon={Shield}
                  color="amber"
                />
                <AnalyticsStatCard
                  title="Industry Mentors"
                  value={analytics.roleCounts.company_mentor}
                  subtitle="Company mentors"
                  icon={UserCheck}
                  color="emerald"
                />
                <AnalyticsStatCard
                  title="Host Companies"
                  value={analytics.companyCount}
                  subtitle="Partner companies"
                  icon={Building}
                  color="blue"
                />
                <AnalyticsStatCard
                  title="Opportunities"
                  value={analytics.postingCount}
                  subtitle="Active listings"
                  icon={Briefcase}
                  color="purple"
                />
                <AnalyticsStatCard
                  title="Active Internships"
                  value={analytics.internshipCount}
                  subtitle="Live internships"
                  icon={CheckCircle2}
                  color="amber"
                />
              </div>
            )}

            {/* Action Required Command Panel */}
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  <span>Action Required — Institutional Governance Alerts</span>
                </h4>
                <span className="text-[11px] font-bold text-[#66706A]">
                  {(() => {
                    const items = [];
                    (departmentsList || []).forEach((d) => {
                      if (!d.hod_id) items.push(1);
                      const fCount = usersList.filter((u) => u.role === 'faculty_mentor' && (u.faculty_mentors?.department === (d.name || d.department_name) || u.faculty_mentors?.department_id === d.id)).length;
                      if (fCount === 0) items.push(1);
                    });
                    (companiesList || []).forEach((c) => {
                      if (!c.company_mentors || c.company_mentors.length === 0) items.push(1);
                      if (c.status === 'SUSPENDED') items.push(1);
                    });
                    return items.length > 0 ? `${items.length} Pending Action(s)` : 'All Configured';
                  })()}
                </span>
              </div>

              {(() => {
                const actionItems = [];
                (departmentsList || []).forEach((dept) => {
                  if (!dept.hod_id) {
                    actionItems.push({
                      id: `hod_${dept.id}`,
                      title: `Department '${dept.name || dept.department_name}' has no HOD assigned`,
                      desc: 'Assign department leadership for academic governance.',
                      btnText: 'Assign HOD',
                      handler: () => {
                        setHodData({ userId: '', departmentId: dept.id });
                        setShowHodModal(true);
                      },
                    });
                  }
                  const fCount = usersList.filter((u) => u.role === 'faculty_mentor' && (u.faculty_mentors?.department === (dept.name || dept.department_name) || u.faculty_mentors?.department_id === dept.id)).length;
                  if (fCount === 0) {
                    actionItems.push({
                      id: `fac_${dept.id}`,
                      title: `Department '${dept.name || dept.department_name}' has 0 Faculty Mentors`,
                      desc: 'Provision faculty mentors for mentee supervision.',
                      btnText: 'Add Faculty Mentor',
                      handler: () => {
                        setFacultyData({ userId: '', departmentId: dept.id, designation: 'Assistant Professor' });
                        setShowFacultyModal(true);
                      },
                    });
                  }
                });

                (companiesList || []).forEach((comp) => {
                  const mentors = Array.isArray(comp.company_mentors) ? comp.company_mentors : [];
                  if (mentors.length === 0) {
                    actionItems.push({
                      id: `comp_m_${comp.id}`,
                      title: `Company '${comp.company_name}' has no provisioned Company Mentor`,
                      desc: 'Generate invitation link to register industry mentor.',
                      btnText: 'Invite Mentor',
                      handler: () => generateCompanyInviteLink(comp),
                    });
                  }
                  if (comp.status === 'SUSPENDED') {
                    actionItems.push({
                      id: `comp_s_${comp.id}`,
                      title: `Company '${comp.company_name}' is currently SUSPENDED`,
                      desc: 'Review partner status and posting restrictions.',
                      btnText: 'View Company',
                      handler: () => setActiveTab('companies'),
                    });
                  }
                });

                if (actionItems.length === 0) {
                  return (
                    <div className="p-4 bg-[#EAF4EC] border border-[#C5E3CC] rounded-xl text-xs text-[#1F6B32] font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2F8F46]" />
                      <span>All institutional assignments and partner configurations are currently up to date.</span>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {actionItems.map((item) => (
                      <div key={item.id} className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-[#18201B] block">{item.title}</span>
                          <span className="text-[11px] text-[#66706A]">{item.desc}</span>
                        </div>
                        <button
                          onClick={item.handler}
                          className="px-3 py-1 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-bold text-[11px] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {item.btnText}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Academic Structure Section */}
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#1F6B32]" />
                  <span>Academic Departments Structure</span>
                </h4>
                <button
                  onClick={() => setActiveTab('staff')}
                  className="text-[11px] font-bold text-[#1F6B32] hover:underline"
                >
                  Manage Academic Leadership →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {departmentsList.map((dept) => {
                  const hodUser = usersList.find((u) => u.id === dept.hod_id);
                  const facultyCount = usersList.filter(
                    (u) => u.role === 'faculty_mentor' && (u.faculty_mentors?.department === (dept.name || dept.department_name) || u.faculty_mentors?.department_id === dept.id)
                  ).length;

                  const isConfigured = hodUser && facultyCount > 0;

                  return (
                    <div key={dept.id} className="p-3.5 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#18201B]">{dept.name || dept.department_name}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          isConfigured
                            ? 'bg-[#EAF4EC] text-[#1F6B32] border-[#C5E3CC]'
                            : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                        }`}>
                          {isConfigured ? 'Configured' : 'Action Required'}
                        </span>
                      </div>

                      <div className="text-[11px] space-y-1 text-[#66706A]">
                        <div>
                          <strong className="text-[#18201B]">HOD:</strong> {hodUser?.full_name || 'Not Assigned'}
                        </div>
                        <div>
                          <strong className="text-[#18201B]">Faculty Mentors:</strong> {facultyCount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Distribution Chart & Recent Administrative Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentChart
                title="Institutional User Distribution by Role"
                data={roleChartData}
                dataKey="count"
                nameKey="name"
              />

              {/* Recent Administrative Activity Stream */}
              <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#1F6B32]" />
                    <span>Recent Administrative Activity</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-[11px] font-bold text-[#1F6B32] hover:underline"
                  >
                    View All Stream →
                  </button>
                </div>

                {auditLogs.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {auditLogs.slice(0, 8).map((log) => (
                      <div key={log.id} className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E1E7E2] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#18201B]">{log.action}</span>
                          <span className="text-[10px] text-[#66706A]">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#66706A]">
                          <span>User: {log.users?.full_name || 'System'}</span>
                          <span className="font-semibold text-[#1F6B32]">{log.module || 'GOVERNANCE'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[#66706A] bg-[#F8FAF9] rounded-xl border border-[#E1E7E2]">
                    No administrative activity recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          /* People & Access Tab Content */
          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#18201B]">People & Access</h3>
                <p className="text-xs text-[#66706A] mt-0.5">
                  Manage institutional user accounts, role assignments, and active account access.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#66706A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search user by name or email..."
                    className="w-full pl-9 pr-3.5 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl text-xs text-[#18201B] outline-none focus:ring-2 focus:ring-[#2F8F46]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl text-xs font-semibold text-[#18201B] outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles ({usersList.length})</option>
                  <option value="student">Students</option>
                  <option value="faculty_mentor">Faculty Mentors</option>
                  <option value="company_mentor">Company Mentors</option>
                  <option value="tpo">TPOs</option>
                  <option value="hod">HODs</option>
                  <option value="admin">Administrators</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl text-xs font-semibold text-[#18201B] outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E1E7E2] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
                    <th className="py-3 px-4">Institutional User</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Institutional Scope</th>
                    <th className="py-3 px-4 text-right">Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === user?.id;
                    const isUpdatingThis = updatingUserId === u.id;

                    let scopeLabel = 'Institutional Scope';
                    if (u.role === 'student') {
                      scopeLabel = u.student_profiles?.department ? `Dept: ${u.student_profiles.department}` : `Roll: ${u.student_profiles?.roll_number || 'Student'}`;
                    } else if (u.role === 'faculty_mentor') {
                      scopeLabel = u.faculty_mentors?.department ? `Dept: ${u.faculty_mentors.department}` : (u.faculty_mentors?.designation || 'Academic Faculty');
                    } else if (u.role === 'company_mentor') {
                      const compList = Array.isArray(u.company_mentors) ? u.company_mentors : (u.company_mentors ? [u.company_mentors] : []);
                      scopeLabel = compList[0]?.companies?.company_name ? `Company: ${compList[0].companies.company_name}` : 'Host Organization';
                    } else if (u.role === 'hod') {
                      scopeLabel = 'Department Head (HOD)';
                    } else if (u.role === 'tpo') {
                      scopeLabel = 'Placement Office (TPO)';
                    } else if (u.role === 'admin') {
                      scopeLabel = 'Central Administrator';
                    }

                    return (
                      <tr key={u.id} className="hover:bg-[#F8FAF9] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm text-[#18201B]">{u.full_name || 'User Account'}</div>
                          <div className="text-[11px] text-[#66706A] mt-0.5">{u.email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={isSelf || isUpdatingThis}
                            className="px-2.5 py-1 bg-white border border-[#E1E7E2] rounded-lg text-xs font-semibold text-[#18201B] focus:ring-2 focus:ring-[#2F8F46] outline-none disabled:opacity-50 cursor-pointer"
                          >
                            <option value="student">Student</option>
                            <option value="faculty_mentor">Faculty Mentor</option>
                            <option value="company_mentor">Company Mentor</option>
                            <option value="tpo">TPO Officer</option>
                            <option value="hod">HOD</option>
                            <option value="admin">System Admin</option>
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            (u.status || 'Active') === 'Active'
                              ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]'
                              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                          }`}>
                            {(u.status || 'Active') === 'Active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#66706A] font-medium">
                          {scopeLabel}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isSelf ? (
                            <span className="text-[11px] font-bold text-[#2F8F46] bg-[#EAF4EC] px-2.5 py-1 rounded-lg border border-[#C5E3CC]">
                              Current Admin (Active Session)
                            </span>
                          ) : (
                            <button
                              onClick={() => handleStatusToggle(u.id, u.status || 'Active')}
                              disabled={isUpdatingThis}
                              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                                (u.status || 'Active') === 'Active'
                                  ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FEE2E2]'
                                  : 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC] hover:bg-[#D5EAD8]'
                              }`}
                            >
                              {isUpdatingThis ? 'Saving...' : ((u.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'staff' ? (
          /* Academic & Staff Leadership Tab Content */
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#18201B]">Academic & Staff Leadership</h3>
                  <p className="text-xs text-[#66706A] mt-0.5">
                    Provision Faculty Mentors, assign department leadership (HODs), and authorize TPO Officers.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowFacultyModal(true)}
                    className="px-3.5 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Provision Faculty Mentor</span>
                  </button>

                  <button
                    onClick={() => setShowHodModal(true)}
                    className="px-3.5 py-2 bg-[#1F6B32] hover:bg-[#18201B] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Assign HOD Leadership</span>
                  </button>

                  <button
                    onClick={() => setShowTpoModal(true)}
                    className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Provision TPO Officer</span>
                  </button>
                </div>
              </div>

              {/* Department Leadership Grid */}
              <div className="pt-2 border-t border-[#F0F4F1]">
                <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider mb-3">Academic Department Leadership</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {departmentsList.map((dept) => {
                    const hodUser = usersList.find((u) => u.id === dept.hod_id);
                    return (
                      <div key={dept.id} className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] space-y-1">
                        <span className="text-[11px] font-bold text-[#66706A] block">{dept.name || dept.department_name}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#18201B]">
                            {hodUser?.full_name || 'No HOD Assigned'}
                          </span>
                          <button
                            onClick={() => {
                              setHodData({ userId: '', departmentId: dept.id });
                              setShowHodModal(true);
                            }}
                            className="text-[10px] font-bold text-[#1F6B32] hover:underline"
                          >
                            {hodUser ? 'Reassign' : 'Assign'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Staff Table */}
              <div className="overflow-x-auto border border-[#E1E7E2] rounded-xl pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Institutional Role</th>
                      <th className="py-3 px-4">Department / Scope</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Governance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
                    {staffUsers.map((su) => {
                      let roleBadgeClass = 'bg-gray-100 text-gray-800';
                      let roleLabel = su.role;

                      if (su.role === 'faculty_mentor') {
                        roleBadgeClass = 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]';
                        roleLabel = 'Faculty Mentor';
                      } else if (su.role === 'hod') {
                        roleBadgeClass = 'bg-[#FDF4FF] text-[#9333EA] border border-[#F5D0FE]';
                        roleLabel = 'Head of Department (HOD)';
                      } else if (su.role === 'tpo') {
                        roleBadgeClass = 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]';
                        roleLabel = 'Training & Placement Officer';
                      } else if (su.role === 'company_mentor') {
                        roleBadgeClass = 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
                        roleLabel = 'Company Mentor';
                      }

                      let scope = 'Institutional Scope';
                      if (su.role === 'faculty_mentor') {
                        scope = su.faculty_mentors?.department || 'Academic Department';
                      } else if (su.role === 'company_mentor') {
                        const compList = Array.isArray(su.company_mentors) ? su.company_mentors : (su.company_mentors ? [su.company_mentors] : []);
                        scope = compList[0]?.companies?.company_name || 'Host Organization';
                      }

                      return (
                        <tr key={su.id} className="hover:bg-[#F8FAF9] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-sm text-[#18201B]">{su.full_name}</div>
                            <div className="text-[11px] text-[#66706A]">{su.email}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${roleBadgeClass}`}>
                              {roleLabel}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[#66706A] font-medium">
                            {scope}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              (su.status || 'Active') === 'Active'
                                ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]'
                                : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                            }`}>
                              {(su.status || 'Active') === 'Active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleStatusToggle(su.id, su.status || 'Active')}
                              disabled={updatingUserId === su.id}
                              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                                (su.status || 'Active') === 'Active'
                                  ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FEE2E2]'
                                  : 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC] hover:bg-[#D5EAD8]'
                              }`}
                            >
                              {updatingUserId === su.id ? 'Saving...' : ((su.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'companies' ? (
          /* Companies & Industry Partners Tab Content */
          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#18201B]">Companies & Industry Partners</h3>
                <p className="text-xs text-[#66706A] mt-0.5">
                  Register host organization partners, generate mentor registration invitation flows, and manage company status.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateCompanyModal(true)}
                  className="px-3.5 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Host Partner</span>
                </button>

                <button
                  onClick={() => setShowProvisionModal(true)}
                  className="px-3.5 py-2 bg-[#1F6B32] hover:bg-[#18201B] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision Company Mentor</span>
                </button>
              </div>
            </div>

            {/* Companies Table */}
            <div className="overflow-x-auto border border-[#E1E7E2] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
                    <th className="py-3 px-4">Company Partner</th>
                    <th className="py-3 px-4">HR & Address</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4">Provisioned Mentors</th>
                    <th className="py-3 px-4">Opportunity Postings</th>
                    <th className="py-3 px-4 text-right">Registration Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
                  {companiesList.map((c) => {
                    const mentors = Array.isArray(c.company_mentors) ? c.company_mentors : [];
                    const postings = Array.isArray(c.internship_postings) ? c.internship_postings : [];

                    return (
                      <tr key={c.id} className="hover:bg-[#F8FAF9] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm text-[#18201B]">{c.company_name}</div>
                          <div className="text-[11px] text-[#66706A] mt-0.5">{c.industry || 'Technology Partner'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-[#18201B]">{c.hr_email || c.contact_number || 'N/A'}</div>
                          <div className="text-[11px] text-[#66706A]">{c.address || 'Location Verified'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              (c.status || 'APPROVED') === 'APPROVED'
                                ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]'
                                : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                            }`}>
                              <CheckCircle2 className="w-3 h-3 text-[#2F8F46]" />
                              {c.status || 'APPROVED'}
                            </span>
                            <button
                              onClick={() => handleCompanyStatusToggle(c.id, c.status || 'APPROVED')}
                              disabled={updatingCompanyId === c.id}
                              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                                (c.status || 'APPROVED') === 'APPROVED'
                                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEE2E2]'
                                  : 'bg-[#EAF4EC] text-[#1F6B32] border-[#C5E3CC] hover:bg-[#D5EAD8]'
                              }`}
                            >
                              {updatingCompanyId === c.id ? 'Saving...' : ((c.status || 'APPROVED') === 'APPROVED' ? 'Suspend' : 'Approve')}
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium">
                          {mentors.length > 0 ? (
                            <div className="space-y-1">
                              {mentors.map((m) => (
                                <div key={m.id} className="text-xs">
                                  <strong className="text-[#18201B]">{m.users?.full_name || 'Mentor'}</strong>
                                  <span className="text-[11px] text-[#66706A]"> ({m.designation || 'Mentor'})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#9CA3AF] italic">No Mentors Provisioned</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-[#18201B]">{postings.length}</span> Postings
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => generateCompanyInviteLink(c)}
                            className="px-3 py-1.5 bg-[#EAF4EC] hover:bg-[#D5EAD8] text-[#1F6B32] border border-[#C5E3CC] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Generate Mentor Link</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'placement' ? (
          /* Internship & Placement Operations Tab Content */
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#18201B]">Internship & Placement Operations</h3>
                <p className="text-xs text-[#66706A] mt-0.5">
                  Institutional oversight of placement activities, TPO verification workflows, and faculty mentorship assignments.
                </p>
              </div>

              {/* TPO Workflow Navigation Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to={ROUTES.TPO_OFFER_VERIFICATION}
                  className="p-4 bg-[#F8FAF9] hover:bg-[#EAF4EC] border border-[#E1E7E2] hover:border-[#C5E3CC] rounded-xl transition-all group"
                >
                  <FileCheck className="w-5 h-5 text-[#2F8F46] mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-[#18201B] group-hover:text-[#1F6B32]">TPO Offer Verification</h4>
                  <p className="text-xs text-[#66706A] mt-1">Verify company offer letters before faculty assignment.</p>
                </Link>

                <Link
                  to={ROUTES.TPO_FACULTY_ASSIGNMENT}
                  className="p-4 bg-[#F8FAF9] hover:bg-[#EFF6FF] border border-[#E1E7E2] hover:border-[#BFDBFE] rounded-xl transition-all group"
                >
                  <GraduationCap className="w-5 h-5 text-[#2563EB] mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-[#18201B] group-hover:text-[#2563EB]">Faculty Mentor Assignment</h4>
                  <p className="text-xs text-[#66706A] mt-1">Assign academic faculty mentors to verified interns.</p>
                </Link>

                <Link
                  to={ROUTES.TPO_PPO_RECORDS}
                  className="p-4 bg-[#F8FAF9] hover:bg-[#FDF4FF] border border-[#E1E7E2] hover:border-[#F5D0FE] rounded-xl transition-all group"
                >
                  <Award className="w-5 h-5 text-[#9333EA] mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-[#18201B] group-hover:text-[#9333EA]">PPO & Pre-Placement Records</h4>
                  <p className="text-xs text-[#66706A] mt-1">Track pre-placement offers & conversion rates.</p>
                </Link>

                <Link
                  to={ROUTES.TPO_CERTIFICATE_VERIFICATION}
                  className="p-4 bg-[#F8FAF9] hover:bg-[#FFFBEB] border border-[#E1E7E2] hover:border-[#FDE68A] rounded-xl transition-all group"
                >
                  <CheckSquare className="w-5 h-5 text-[#D97706] mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-[#18201B] group-hover:text-[#D97706]">QR Certificate Verification</h4>
                  <p className="text-xs text-[#66706A] mt-1">Verify institutional QR-signed completion certificates.</p>
                </Link>
              </div>

              {/* Opportunity Postings Table Summary */}
              <div className="pt-4 border-t border-[#F0F4F1]">
                <h4 className="text-xs font-bold text-[#18201B] uppercase tracking-wider mb-3">Active Institutional Opportunity Postings</h4>
                {analytics?.postingCount > 0 ? (
                  <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#18201B]">{analytics.postingCount} Active Opportunity Listings</span>
                      <p className="text-[#66706A] mt-0.5">Published across verified host partner companies.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('companies')}
                      className="px-3.5 py-1.5 bg-[#2F8F46] text-white font-bold rounded-lg hover:bg-[#1F6B32]"
                    >
                      Manage Companies →
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#66706A] bg-[#F8FAF9] rounded-xl border border-[#E1E7E2]">
                    No opportunity postings recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Recent Administrative Activity Stream Tab Content */
          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#18201B]">Recent Administrative Activity</h3>
                <p className="text-xs text-[#66706A] mt-0.5">
                  Institutional audit trail of administrative role changes, company registrations, and access governance.
                </p>
              </div>
              <span className="text-xs font-mono text-[#66706A] bg-[#F8FAF9] px-2.5 py-1 rounded-lg border border-[#E1E7E2]">
                {auditLogs.length} Recorded Log Entries
              </span>
            </div>

            <div className="overflow-x-auto border border-[#E1E7E2] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#E1E7E2] text-[#66706A] font-semibold">
                    <th className="py-3 px-4">Event Action</th>
                    <th className="py-3 px-4">Actor User</th>
                    <th className="py-3 px-4">Governance Scope</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1] text-[#18201B]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#18201B]">{log.action}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#18201B]">{log.users?.full_name || 'System Administrator'}</div>
                        <div className="text-[11px] text-[#66706A]">{log.users?.email || 'system'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]">
                          {log.module || 'GOVERNANCE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#66706A] font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[#66706A] font-mono text-[10px] truncate max-w-xs">
                        {log.details ? JSON.stringify(log.details) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Invite Link Popup */}
        {inviteModalData && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
                <h3 className="text-base font-bold text-[#18201B]">Company Mentor Registration Link</h3>
                <button
                  onClick={() => setInviteModalData(null)}
                  className="text-[#66706A] hover:text-[#18201B] p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-[#66706A]">
                  Admin-controlled registration link generated for <strong className="text-[#18201B]">{inviteModalData.companyName}</strong>. Send this link to the authorized Company Mentor to complete their profile registration.
                </p>

                <div className="p-3 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl font-mono text-[11px] text-[#18201B] break-all">
                  {inviteModalData.inviteUrl}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F4F1]">
                  <button
                    onClick={copyInviteLink}
                    className="px-4 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Invitation Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Register New Company Partner */}
        {showCreateCompanyModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
                <h3 className="text-base font-bold text-[#18201B]">Register New Company Partner</h3>
                <button
                  onClick={() => setShowCreateCompanyModal(false)}
                  className="text-[#66706A] hover:text-[#18201B] p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCompanySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#18201B] mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={newCompanyData.company_name}
                    onChange={(e) => setNewCompanyData((prev) => ({ ...prev, company_name: e.target.value }))}
                    placeholder="e.g. Infosys Technologies Ltd"
                    required
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#18201B] mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={newCompanyData.industry}
                    onChange={(e) => setNewCompanyData((prev) => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g. Software & IT Services"
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#18201B] mb-1">Office Address</label>
                  <input
                    type="text"
                    value={newCompanyData.address}
                    onChange={(e) => setNewCompanyData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. Nagpur IT Park, Maharashtra"
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#18201B] mb-1">HR Contact Email</label>
                    <input
                      type="email"
                      value={newCompanyData.hr_email}
                      onChange={(e) => setNewCompanyData((prev) => ({ ...prev, hr_email: e.target.value }))}
                      placeholder="hr@company.com"
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#18201B] mb-1">Company Website</label>
                    <input
                      type="url"
                      value={newCompanyData.website}
                      onChange={(e) => setNewCompanyData((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://company.com"
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F4F1]">
                  <button
                    type="button"
                    onClick={() => setShowCreateCompanyModal(false)}
                    className="px-3.5 py-2 border border-[#E1E7E2] rounded-xl font-bold text-[#66706A] hover:bg-[#F8FAF9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-4 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-bold rounded-xl"
                  >
                    {submittingAction ? 'Registering...' : 'Register Company'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Provision Company Mentor */}
        {showProvisionModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
                <h3 className="text-base font-bold text-[#18201B]">Provision Company Mentor</h3>
                <button
                  onClick={() => setShowProvisionModal(false)}
                  className="text-[#66706A] hover:text-[#18201B] p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setProvisionData((prev) => ({ ...prev, createMode: false }))}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    !provisionData.createMode ? 'bg-white text-[#18201B] shadow-xs border border-[#E1E7E2]' : 'text-[#66706A]'
                  }`}
                >
                  Select Existing Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setProvisionData((prev) => ({ ...prev, createMode: true }))}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    provisionData.createMode ? 'bg-white text-[#1F6B32] shadow-xs border border-[#C5E3CC]' : 'text-[#66706A]'
                  }`}
                >
                  ➕ Create New Staff Account
                </button>
              </div>

              <form onSubmit={handleProvisionMentorSubmit} className="space-y-3 text-xs">
                {provisionData.createMode ? (
                  <>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={provisionData.fullName}
                        onChange={(e) => setProvisionData((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="e.g. Vikram Mehta"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Official Mentor Email *</label>
                      <input
                        type="email"
                        required
                        value={provisionData.email}
                        onChange={(e) => setProvisionData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. vikram.mehta@apex.ai"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Temporary Password *</label>
                      <input
                        type="password"
                        required
                        value={provisionData.password}
                        onChange={(e) => setProvisionData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block font-bold text-[#18201B] mb-1">Select User Candidate *</label>
                    <select
                      value={provisionData.userId}
                      onChange={(e) => setProvisionData((prev) => ({ ...prev, userId: e.target.value }))}
                      required={!provisionData.createMode}
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B] cursor-pointer"
                    >
                      <option value="">Select User Candidate</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || u.email} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#18201B] mb-1">Select Target Approved Company *</label>
                  <select
                    value={provisionData.companyId}
                    onChange={(e) => setProvisionData((prev) => ({ ...prev, companyId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B] cursor-pointer"
                  >
                    <option value="">Select Company Partner</option>
                    {companiesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name} ({c.industry || 'IT'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#18201B] mb-1">Mentor Designation / Role Title</label>
                  <input
                    type="text"
                    value={provisionData.designation}
                    onChange={(e) => setProvisionData((prev) => ({ ...prev, designation: e.target.value }))}
                    placeholder="e.g. Senior Technical Lead"
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F4F1]">
                  <button
                    type="button"
                    onClick={() => setShowProvisionModal(false)}
                    className="px-3.5 py-2 border border-[#E1E7E2] rounded-xl font-bold text-[#66706A] hover:bg-[#F8FAF9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-4 py-2 bg-[#1F6B32] hover:bg-[#18201B] text-white font-bold rounded-xl"
                  >
                    {submittingAction ? 'Provisioning...' : 'Provision Mentor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Provision Faculty Mentor */}
        {showFacultyModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
                <h3 className="text-base font-bold text-[#18201B]">Provision Faculty Mentor</h3>
                <button
                  onClick={() => setShowFacultyModal(false)}
                  className="text-[#66706A] hover:text-[#18201B] p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setFacultyData((prev) => ({ ...prev, createMode: false }))}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    !facultyData.createMode ? 'bg-white text-[#18201B] shadow-xs border border-[#E1E7E2]' : 'text-[#66706A]'
                  }`}
                >
                  Select Existing Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setFacultyData((prev) => ({ ...prev, createMode: true }))}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    facultyData.createMode ? 'bg-white text-[#1F6B32] shadow-xs border border-[#C5E3CC]' : 'text-[#66706A]'
                  }`}
                >
                  ➕ Create New Staff Account
                </button>
              </div>

              <form onSubmit={handleProvisionFacultySubmit} className="space-y-3 text-xs">
                {facultyData.createMode ? (
                  <>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={facultyData.fullName}
                        onChange={(e) => setFacultyData((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="e.g. Dr. Ramesh Kumar"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Official Faculty Email *</label>
                      <input
                        type="email"
                        required
                        value={facultyData.email}
                        onChange={(e) => setFacultyData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. ramesh.kumar@raisoni.edu"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Temporary Password *</label>
                      <input
                        type="password"
                        required
                        value={facultyData.password}
                        onChange={(e) => setFacultyData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block font-bold text-[#18201B] mb-1">Select User Candidate *</label>
                    <select
                      value={facultyData.userId}
                      onChange={(e) => setFacultyData((prev) => ({ ...prev, userId: e.target.value }))}
                      required={!facultyData.createMode}
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B] cursor-pointer"
                    >
                      <option value="">Select User Candidate</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || u.email} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#18201B] mb-1">Select Academic Department *</label>
                  <select
                    value={facultyData.departmentId}
                    onChange={(e) => setFacultyData((prev) => ({ ...prev, departmentId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B] cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#18201B] mb-1">Academic Designation</label>
                  <input
                    type="text"
                    value={facultyData.designation}
                    onChange={(e) => setFacultyData((prev) => ({ ...prev, designation: e.target.value }))}
                    placeholder="e.g. Assistant Professor"
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F4F1]">
                  <button
                    type="button"
                    onClick={() => setShowFacultyModal(false)}
                    className="px-3.5 py-2 border border-[#E1E7E2] rounded-xl font-bold text-[#66706A] hover:bg-[#F8FAF9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-4 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-bold rounded-xl"
                  >
                    {submittingAction ? 'Provisioning...' : 'Provision Faculty Mentor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Provision HOD */}
        {showHodModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
                <h3 className="text-base font-bold text-[#18201B]">Assign Head of Department (HOD) Leadership</h3>
                <button
                  onClick={() => setShowHodModal(false)}
                  className="text-[#66706A] hover:text-[#18201B] p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setHodData((prev) => ({ ...prev, createMode: false }))}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    !hodData.createMode ? 'bg-white text-[#18201B] shadow-xs border border-[#E1E7E2]' : 'text-[#66706A]'
                  }`}
                >
                  Select Existing Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setHodData((prev) => ({ ...prev, createMode: true }))}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    hodData.createMode ? 'bg-white text-[#1F6B32] shadow-xs border border-[#C5E3CC]' : 'text-[#66706A]'
                  }`}
                >
                  ➕ Create New Staff Account
                </button>
              </div>

              <form onSubmit={handleProvisionHodSubmit} className="space-y-3 text-xs">
                {hodData.createMode ? (
                  <>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={hodData.fullName}
                        onChange={(e) => setHodData((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="e.g. Dr. Sunita Patil"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Official HOD Email *</label>
                      <input
                        type="email"
                        required
                        value={hodData.email}
                        onChange={(e) => setHodData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. hod.civil@raisoni.edu"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Temporary Password *</label>
                      <input
                        type="password"
                        required
                        value={hodData.password}
                        onChange={(e) => setHodData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block font-bold text-[#18201B] mb-1">Select User Candidate *</label>
                    <select
                      value={hodData.userId}
                      onChange={(e) => setHodData((prev) => ({ ...prev, userId: e.target.value }))}
                      required={!hodData.createMode}
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B] cursor-pointer"
                    >
                      <option value="">Select User Candidate</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || u.email} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#18201B] mb-1">Select Academic Department Leadership *</label>
                  <select
                    value={hodData.departmentId}
                    onChange={(e) => setHodData((prev) => ({ ...prev, departmentId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B] cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.department_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F4F1]">
                  <button
                    type="button"
                    onClick={() => setShowHodModal(false)}
                    className="px-3.5 py-2 border border-[#E1E7E2] rounded-xl font-bold text-[#66706A] hover:bg-[#F8FAF9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-4 py-2 bg-[#1F6B32] hover:bg-[#18201B] text-white font-bold rounded-xl"
                  >
                    {submittingAction ? 'Provisioning...' : 'Assign HOD Leadership'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Provision TPO */}
        {showTpoModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
                <h3 className="text-base font-bold text-[#18201B]">Provision Training & Placement Officer (TPO)</h3>
                <button
                  onClick={() => setShowTpoModal(false)}
                  className="text-[#66706A] hover:text-[#18201B] p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTpoData((prev) => ({ ...prev, createMode: false }))}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    !tpoData.createMode ? 'bg-white text-[#18201B] shadow-xs border border-[#E1E7E2]' : 'text-[#66706A]'
                  }`}
                >
                  Select Existing Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setTpoData((prev) => ({ ...prev, createMode: true }))}
                  className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    tpoData.createMode ? 'bg-white text-[#1F6B32] shadow-xs border border-[#C5E3CC]' : 'text-[#66706A]'
                  }`}
                >
                  ➕ Create New Staff Account
                </button>
              </div>

              <form onSubmit={handleProvisionTpoSubmit} className="space-y-3 text-xs">
                {tpoData.createMode ? (
                  <>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={tpoData.fullName}
                        onChange={(e) => setTpoData((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="e.g. Prof. TPO Officer"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Official TPO Email *</label>
                      <input
                        type="email"
                        required
                        value={tpoData.email}
                        onChange={(e) => setTpoData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. tpo@raisoni.edu"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#18201B] mb-1">Temporary Password *</label>
                      <input
                        type="password"
                        required
                        value={tpoData.password}
                        onChange={(e) => setTpoData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B]"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block font-bold text-[#18201B] mb-1">Select User Candidate *</label>
                    <select
                      value={tpoData.userId}
                      onChange={(e) => setTpoData((prev) => ({ ...prev, userId: e.target.value }))}
                      required={!tpoData.createMode}
                      className="w-full px-3 py-2 bg-[#F8FAF9] border border-[#E1E7E2] rounded-xl outline-none text-[#18201B] cursor-pointer"
                    >
                      <option value="">Select User Candidate</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name || u.email} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0F4F1]">
                  <button
                    type="button"
                    onClick={() => setShowTpoModal(false)}
                    className="px-3.5 py-2 border border-[#E1E7E2] rounded-xl font-bold text-[#66706A] hover:bg-[#F8FAF9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl"
                  >
                    {submittingAction ? 'Provisioning...' : 'Provision TPO Officer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
