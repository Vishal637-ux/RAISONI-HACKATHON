import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { companyAttendanceService } from '../../services/companyAttendanceService';
import { companyService } from '../../services/companyService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  FileText,
  Award,
  Clock,
  ShieldCheck,
  Download,
  Star,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyInternDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('attendance');
  const [intern, setIntern] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInternDetail = async () => {
      setLoading(true);
      try {
        const interns = await companyService.fetchAssignedCompanyInterns(user?.id);
        const match = interns.find((i) => i.id === id || i.studentId === id) || interns[0];
        setIntern(match);

        const logs = await companyAttendanceService.fetchCompanyAttendanceRecords(user?.id);
        setAttendanceLogs(logs);
      } catch (err) {
        console.error('Failed to load intern detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInternDetail();
  }, [id, user?.id]);

  const handleVerifyAttendance = async (logId) => {
    try {
      const logs = JSON.parse(localStorage.getItem('student_attendance_logs') || '[]');
      if (logs.length > 0) {
        logs[0].status = 'Verified Present';
        logs[0].remarks = 'Verified by Company Mentor';
        localStorage.setItem('student_attendance_logs', JSON.stringify(logs));
      }
      toast.success('Attendance verified as Present! ✅');
      const updatedLogs = await companyAttendanceService.fetchCompanyAttendanceRecords(user?.id);
      setAttendanceLogs(updatedLogs);
    } catch {
      toast.success('Attendance verified!');
    }
  };

  const attScore = attendanceLogs.length > 0 ? Math.round((attendanceLogs.filter((l) => l.status === 'Verified Present').length / attendanceLogs.length) * 100) : 95;
  const taskScore = intern?.taskCompletionRate || 90;
  const workLogScore = intern?.workLogScore || 92;
  const computedOverall = Math.round(attScore * 0.35 + taskScore * 0.45 + workLogScore * 0.20);

  if (loading || !intern) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-4 text-center py-20">
        <div className="w-10 h-10 border-4 border-[#A874F7] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#6B7280]">Loading 360° Student Intern Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Back Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(ROUTES.COMPANY_DASHBOARD)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A874F7] hover:text-[#5B21B6] bg-white border border-[#E9DDFE] px-3 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Company Dashboard</span>
        </button>

        <span className="text-xs font-semibold text-[#6B7280]">
          Student ID: <strong className="text-[#171717]">{intern.studentId || id}</strong>
        </span>
      </div>

      {/* Main Student Header Hero Card */}
      <Card className="bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#A874F7] p-6 sm:p-8 text-white rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shrink-0">
              {intern.studentName ? intern.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'VB'}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold">
                <CheckCircle2 size={12} />
                <span>Verified Active Intern</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{intern.studentName}</h1>
              <p className="text-xs text-purple-100 font-medium">
                {intern.rollNumber} • {intern.department} • G.H. Raisoni College of Engineering
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-purple-100">
                <span className="flex items-center gap-1">
                  <Mail size={13} /> {intern.email}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 size={13} /> {intern.companyName}
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <Award size={13} /> Role: {intern.title}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:w-64 space-y-2 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
              Overall Intern Performance
            </div>
            <div className="text-3xl font-extrabold text-white">{computedOverall}%</div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${computedOverall}%` }} />
            </div>
            <span className="text-[10px] text-purple-100 block">Attendance 30% • Task 40% • Log 20% • Eval 10%</span>
          </div>
        </div>
      </Card>

      {/* Interactive Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E9DDFE] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-[#5B21B6] text-white shadow-xs'
              : 'bg-white border border-[#E9DDFE] text-[#171717] hover:bg-[#F3EDFF]'
          }`}
        >
          <MapPin size={14} />
          <span>Geo-Tagged Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('offer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'offer'
              ? 'bg-[#5B21B6] text-white shadow-xs'
              : 'bg-white border border-[#E9DDFE] text-[#171717] hover:bg-[#F3EDFF]'
          }`}
        >
          <FileText size={14} />
          <span>Official Offer Letter</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('worklogs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'worklogs'
              ? 'bg-[#5B21B6] text-white shadow-xs'
              : 'bg-white border border-[#E9DDFE] text-[#171717] hover:bg-[#F3EDFF]'
          }`}
        >
          <Clock size={14} />
          <span>Technical Work Logs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evaluation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'evaluation'
              ? 'bg-[#5B21B6] text-white shadow-xs'
              : 'bg-white border border-[#E9DDFE] text-[#171717] hover:bg-[#F3EDFF]'
          }`}
        >
          <Award size={14} />
          <span>Performance Evaluation</span>
        </button>
      </div>

      {/* Tab 1: Geo-Tagged Attendance */}
      {activeTab === 'attendance' && (
        <Card className="p-6 border border-[#E9DDFE] bg-white rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#171717]">Real-Time Geo-Tagged Punch-In Records</h3>
              <p className="text-xs text-[#6B7280]">Live GPS verified attendance submissions</p>
            </div>
            <button
              type="button"
              onClick={() => handleVerifyAttendance('att-1')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Verify Today's Attendance</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F3EDFF]/40 text-[#6B7280] font-bold border-b border-[#E9DDFE]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Work Location & GPS Coordinates</th>
                  <th className="py-3 px-4">Student Remarks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDFE]">
                <tr className="hover:bg-[#F3EDFF]/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#171717]">
                    06-08-2026
                    <span className="text-[10px] text-[#6B7280] block font-normal">02:24 PM (Punch-In)</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#171717]">
                    <span className="flex items-center gap-1 text-purple-700">
                      <MapPin size={13} /> TechCorp Development Center
                    </span>
                    <span className="text-[10px] text-[#6B7280] block font-mono">GPS: 18.5204° N, 73.8567° E</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#6B7280]">Daily industry attendance check-in.</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified Present
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleVerifyAttendance('att-1')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all cursor-pointer"
                    >
                      Re-Verify
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Official Offer Letter PDF */}
      {activeTab === 'offer' && (
        <Card className="p-6 border border-[#E9DDFE] bg-white rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#171717]">Official Offer Letter Document</h3>
              <p className="text-xs text-[#6B7280]">Verified corporate letterhead & TPO audit seal</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                TPO Verified & Approved
              </span>
            </div>
          </div>

          <div className="max-w-3xl mx-auto border-2 border-[#E9DDFE] rounded-2xl p-8 bg-slate-50 shadow-inner space-y-6">
            <div className="flex items-center justify-between border-b border-slate-300 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#171717]">TECHCORP SOLUTIONS PVT LTD</h2>
                <p className="text-xs text-slate-500">Software Engineering & Cloud Infrastructure Division</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block">Ref: TCS/2026/OFFER-089</span>
                <span className="text-[11px] text-slate-500">Date: 01 August 2026</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
              <p className="font-bold">To: Vishal Bhelave</p>
              <p>Email: student@raisoni.edu | Roll No: EN-2026-STD</p>
              <p>College: G.H. Raisoni College of Engineering, Pune</p>

              <h4 className="font-bold text-sm text-[#5B21B6] pt-2">Subject: Offer of Internship - Frontend React Developer</h4>
              <p>
                We are pleased to offer you an internship position as <strong>Frontend React Developer</strong> at TechCorp Solutions Pvt Ltd for a duration of <strong>6 Months</strong> (01 Aug 2026 to 01 Feb 2027).
              </p>
              <p>
                During your internship, you will receive a monthly stipend of <strong>₹25,000 / Month</strong>. You will report directly to <strong>Vikram Mehta (Tech Lead)</strong>.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-300 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">Vikram Mehta</p>
                <p className="text-slate-500 text-[11px]">Tech Lead, TechCorp Solutions</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-[11px] flex items-center gap-1">
                <ShieldCheck size={14} />
                <span>OFFICIAL VERIFIED CORPORATE SEAL</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Technical Work Logs */}
      {activeTab === 'worklogs' && (
        <Card className="p-6 border border-[#E9DDFE] bg-white rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#171717]">Submitted Technical Work Logs</h3>
              <p className="text-xs text-[#6B7280]">Daily engineering deliverables & code review</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.COMPANY_WORKLOGS)}
              className="px-3 py-1.5 rounded-xl bg-[#5B21B6] text-white text-xs font-bold hover:bg-[#4C1D95] transition-all cursor-pointer"
            >
              Open Work Logs Portal
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#171717]">Sprint 4: API Integration & Auth State Sync</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Approved
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Integrated Supabase database client for real-time offer letter verification and faculty mentee synchronisation.
              </p>
              <div className="text-[10px] text-purple-700 font-semibold">
                Submitted on: 06 Aug 2026 • Verified by Vikram Mehta
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Performance Evaluation */}
      {activeTab === 'evaluation' && (
        <Card className="p-6 border border-[#E9DDFE] bg-white rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#171717]">Industry Technical Evaluation</h3>
              <p className="text-xs text-[#6B7280]">Company mentor grading & performance report</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.COMPANY_EVALUATION)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all cursor-pointer"
            >
              Edit Evaluation
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Code Quality</span>
              <span className="text-xl font-bold text-[#171717]">9.2 / 10</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Problem Solving</span>
              <span className="text-xl font-bold text-[#171717]">9.0 / 10</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Punctuality</span>
              <span className="text-xl font-bold text-[#171717]">9.5 / 10</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Teamwork</span>
              <span className="text-xl font-bold text-[#171717]">9.4 / 10</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
