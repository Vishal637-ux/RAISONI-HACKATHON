import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Card } from '../common/Card';
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Search,
  Filter,
  Download,
  Bell,
  RefreshCw,
  Mail,
  Phone,
  FileText,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MenteeListCard = ({ mentees = [], onRefresh, onExportCSV }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedOfferModal, setSelectedOfferModal] = useState(null);

  // Multi-dimensional Filter & Search Logic
  const filteredMentees = useMemo(() => {
    return mentees.filter((mentee) => {
      // 1. Text Search (Student Name, Roll No, Company, Dept)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        mentee.studentName.toLowerCase().includes(q) ||
        mentee.rollNumber.toLowerCase().includes(q) ||
        mentee.companyName.toLowerCase().includes(q) ||
        mentee.department.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Tab Filter
      if (selectedTab === 'Needs Attention') {
        const needsAttn =
          ['Applied', 'Under Review'].includes(mentee.status) ||
          mentee.attendanceScore < 80 ||
          mentee.hasPendingRevision;
        if (!needsAttn) return false;
      } else if (selectedTab === 'Active') {
        if (!['Approved', 'Ongoing'].includes(mentee.status)) return false;
      } else if (selectedTab === 'Under Review') {
        if (mentee.status !== 'Under Review') return false;
      } else if (selectedTab === 'Applied') {
        if (mentee.status !== 'Applied') return false;
      } else if (selectedTab === 'Completed') {
        if (mentee.status !== 'Completed') return false;
      }

      // 3. Department Filter
      if (selectedDept !== 'All' && !mentee.department.includes(selectedDept)) return false;

      // 4. Status Filter
      if (selectedStatus !== 'All' && mentee.status !== selectedStatus) return false;

      // 5. Duration Filter
      if (selectedDuration !== 'All' && mentee.duration !== selectedDuration) return false;

      return true;
    });
  }, [mentees, searchQuery, selectedTab, selectedDept, selectedStatus, selectedDuration]);

  // Normalized Progress Score Calculator
  const computeProgressScore = (mentee) => {
    let statusScore = 20;
    if (mentee.status === 'Completed') statusScore = 100;
    else if (['Approved', 'Ongoing'].includes(mentee.status)) statusScore = 60;
    else if (mentee.status === 'Under Review') statusScore = 40;

    const attendanceScore = mentee.attendanceScore || 85;
    const workLogScore = mentee.workLogScore || 80;

    // Task score (if available)
    const taskScore = mentee.taskScore !== undefined ? mentee.taskScore : null;

    if (taskScore !== null) {
      // Full weighted calculation (100%)
      return Math.round(
        statusScore * 0.2 + attendanceScore * 0.3 + workLogScore * 0.3 + taskScore * 0.2
      );
    } else {
      // Normalized calculation excluding task score (100%)
      return Math.round(statusScore * 0.25 + attendanceScore * 0.375 + workLogScore * 0.375);
    }
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
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <UserCheck size={12} />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurable Quick Actions Panel */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
              <Users size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#171717]">Quick Faculty Actions</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-lg border border-[#E9DDFE] hover:bg-[#F3EDFF]/50 text-[#6B7280] hover:text-[#171717] transition-colors cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] text-xs font-semibold hover:bg-[#A874F7] hover:text-white transition-all cursor-pointer"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.FACULTY_INTERNSHIPS)}
            className="flex items-center justify-between p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] hover:bg-[#F3EDFF] hover:border-[#A874F7]/40 transition-all text-xs font-semibold text-[#171717] group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Briefcase size={15} className="text-[#A874F7]" />
              <span>Approve Internships</span>
            </div>
            <ArrowRight size={14} className="text-[#A874F7] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE_LOGS)}
            className="flex items-center justify-between p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] hover:bg-[#F3EDFF] hover:border-[#A874F7]/40 transition-all text-xs font-semibold text-[#171717] group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[#A874F7]" />
              <span>Review Attendance</span>
            </div>
            <ArrowRight size={14} className="text-[#A874F7] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE_LOGS)}
            className="flex items-center justify-between p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] hover:bg-[#F3EDFF] hover:border-[#A874F7]/40 transition-all text-xs font-semibold text-[#171717] group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-[#A874F7]" />
              <span>Review Work Logs</span>
            </div>
            <ArrowRight size={14} className="text-[#A874F7] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.FACULTY_PROGRESS)}
            className="flex items-center justify-between p-3 rounded-xl bg-[#F3EDFF]/40 border border-[#E9DDFE] hover:bg-[#F3EDFF] hover:border-[#A874F7]/40 transition-all text-xs font-semibold text-[#171717] group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-[#A874F7]" />
              <span>Student Progress</span>
            </div>
            <ArrowRight size={14} className="text-[#A874F7] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </Card>

      {/* Main Assigned Mentees Table Card */}
      <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl">
        {/* Header Bar with Search & Filter Tabs */}
        <div className="flex flex-col gap-4 border-b border-[#E9DDFE] pb-4 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Assigned Student Mentees</h3>
                <p className="text-xs text-[#6B7280]">
                  Showing {filteredMentees.length} of {mentees.length} mentee(s)
                </p>
              </div>
            </div>

            {/* Real-time Search Input */}
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, roll no, company... (Ctrl+K)"
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all placeholder:text-[#6B7280]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] overflow-x-auto">
            {[
              { label: 'All Mentees', value: 'All' },
              { label: 'Needs Attention ⚠️', value: 'Needs Attention' },
              { label: 'Approved / Ongoing', value: 'Active' },
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Pending Approval', value: 'Applied' },
              { label: 'Completed', value: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedTab(tab.value)}
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

        {/* Mentees Table Content */}
        {filteredMentees.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[#F3EDFF]/20 rounded-xl border border-[#E9DDFE]">
            <p className="text-xs text-[#6B7280]">No student mentees match the selected filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E9DDFE] text-[#6B7280] uppercase tracking-wider font-semibold bg-[#F3EDFF]/30">
                  <th className="py-3 px-4 rounded-l-xl">Student Mentee</th>
                  <th className="py-3 px-4 hidden md:table-cell">Contact Metadata</th>
                  <th className="py-3 px-4">Academic Details</th>
                  <th className="py-3 px-4">Host Company & Title</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Duration</th>
                  <th className="py-3 px-4">Overall Progress %</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Grouped Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDFE]">
                {filteredMentees.map((mentee) => {
                  const progressScore = computeProgressScore(mentee);

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

                      {/* Contact Details */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-[11px] text-[#6B7280]">
                        <div className="flex items-center gap-1.5 text-[#4B5563]">
                          <Mail size={12} className="text-[#A874F7]" />
                          <span className="truncate max-w-[140px]">{mentee.email}</span>
                        </div>
                      </td>

                      {/* Academic Info */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#171717]">{mentee.department}</p>
                        <p className="text-[11px] text-[#6B7280]">{mentee.year}</p>
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

                      {/* Overall Progress Score */}
                      <td className="py-3.5 px-4">
                        <div className="w-28">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#171717] mb-1">
                            <span>Progress</span>
                            <span>{progressScore}%</span>
                          </div>
                          <div className="w-full bg-[#F3EDFF] rounded-full h-1.5 border border-[#E9DDFE]">
                            <div
                              className="bg-[#A874F7] h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${progressScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">{getStatusBadge(mentee.status)}</td>

                      {/* Grouped Row Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {mentee.hasOffer ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOfferModal(mentee)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
                          >
                            <FileText size={12} />
                            <span>View Offer</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#9CA3AF] font-medium px-2 py-0.5 bg-gray-50 rounded border border-gray-200">
                            No Offer
                          </span>
                        )}
                        <span className="text-[#E9DDFE]">|</span>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE_LOGS)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A874F7] hover:underline cursor-pointer"
                        >
                          <span>Logs</span>
                        </button>
                        <span className="text-[#E9DDFE]">|</span>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.FACULTY_PROGRESS)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A874F7] hover:underline cursor-pointer"
                        >
                          <span>Progress</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Offer Letter Document Preview Modal */}
      {selectedOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-[#E9DDFE] shadow-2xl relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="text-[#A874F7]" size={20} />
                <div>
                  <h3 className="font-bold text-[#171717] text-base">Verified Student Offer Letter</h3>
                  <p className="text-xs text-[#6B7280]">
                    Student: <strong>{selectedOfferModal.studentName}</strong> • {selectedOfferModal.companyName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOfferModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Styled Offer Letter Document */}
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 max-h-[420px] overflow-y-auto">
              <div className="bg-white text-slate-800 p-6 rounded-lg shadow-md border border-slate-300 space-y-4 text-xs font-sans">
                <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase">
                      {selectedOfferModal.companyName}
                    </h2>
                    <p className="text-[10px] text-slate-500">Corporate HQ, Software Technology Park, Pune</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-600 font-mono">
                    <p className="font-bold text-emerald-700">VERIFIED & APPROVED</p>
                    <p>Date: {selectedOfferModal.startDate}</p>
                  </div>
                </div>

                <div className="text-center font-bold text-xs uppercase bg-slate-50 py-1 rounded border border-slate-200 text-slate-900">
                  OFFER OF INTERNSHIP ENGAGEMENT
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <p>Dear <strong>{selectedOfferModal.studentName}</strong>,</p>
                  <p>
                    We are pleased to confirm your appointment for the role of{' '}
                    <strong className="text-purple-700">{selectedOfferModal.title}</strong> at{' '}
                    <strong>{selectedOfferModal.companyName}</strong>.
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-purple-50 p-2.5 rounded border border-purple-200 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Stipend Package:</span>
                      <strong className="text-emerald-700 text-xs">₹25,000/mo</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Duration:</span>
                      <strong className="text-slate-800">6 Months</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px]">
                  <div>
                    <p className="font-bold text-slate-800">HR Director</p>
                    <p className="text-slate-500">{selectedOfferModal.companyName}</p>
                  </div>
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-600 bg-emerald-50 flex items-center justify-center font-bold text-emerald-800 text-[8px]">
                    APPROVED
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOfferModal(null)}
                className="px-4 py-2 rounded-xl bg-[#F3EDFF] text-[#A874F7] font-semibold text-xs hover:bg-[#E9DDFE] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
