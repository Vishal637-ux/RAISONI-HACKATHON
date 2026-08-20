import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/companyService';
import { attendanceService } from '../../services/attendanceService';
import { WorkLocationSetupModal } from '../../components/company/WorkLocationSetupModal';
import { AttendanceHistoryTable } from '../../components/shared/AttendanceHistoryTable';
import { MapPin, RefreshCw, AlertCircle, PlayCircle, Settings, CheckCircle2, Clock } from 'lucide-react';

export const CompanyAttendancePage = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');

      // Fetch company profile
      const companyMentor = await companyService.getCompanyMentorProfile(user.id);
      if (companyMentor?.company_id) {
        const applicants = await companyService.getCompanyApplicants(companyMentor.company_id);
        
        // Fetch internships for company directly
        const { data: intList } = await supabase
          .from('internships')
          .select('*, users:student_id(full_name, email), faculty_mentors(id, designation, users(full_name))')
          .eq('company_id', companyMentor.company_id);

        setInternships(intList || []);

        const attLogs = await attendanceService.getCompanyAttendance(user.id);
        setLogs(attLogs);
      }
    } catch (err) {
      console.error('Error loading company attendance data:', err);
      setErrorMsg(err.message || 'Failed to load company attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <PortalLayout title="Company Attendance & Geofence Setup" roleLabel="Company Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1F6B32] mb-1">
              <MapPin className="w-4 h-4" />
              <span>Phase 6 — Company Supervision & Location Setup</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Work Location Geofence & Attendance Oversight</h2>
            <p className="text-sm text-[#66706A] mt-1">
              Configure physical internship work location coordinates, activate internships, and monitor intern attendance logs.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
            title="Refresh records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Internships Management List */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F4F1] pb-3">
            <h3 className="text-sm font-bold text-[#18201B]">Active & Verified Internships ({internships.length})</h3>
            <span className="text-xs text-[#66706A]">Geofence Configuration Panel</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#66706A]">Loading company internships...</div>
          ) : internships.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#66706A]">No company internships registered.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {internships.map((intRow) => {
                const studentUser = intRow.users || {};
                const hasCoords = intRow.latitude !== null && intRow.longitude !== null;
                const isActive = intRow.status === 'ACTIVE';

                return (
                  <div key={intRow.id} className="p-4 rounded-xl border border-[#E1E7E2] bg-[#F8FAF9] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-[#18201B]">{studentUser.full_name || 'Student Candidate'}</div>
                        <div className="text-xs text-[#66706A]">{intRow.internship_title}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC]' : 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                      }`}>
                        {intRow.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#66706A] space-y-1">
                      <div>
                        Work Location: <strong className="text-[#18201B]">{intRow.work_location || 'Not Configured'}</strong>
                      </div>
                      <div>
                        GPS Coords:{' '}
                        <span className="font-mono text-[#18201B]">
                          {hasCoords ? `${intRow.latitude}, ${intRow.longitude} (${(intRow.allowed_radius_km || 0.5) * 1000}m radius)` : 'Unconfigured'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E1E7E2]">
                      <button
                        onClick={() => setSelectedInternship(intRow)}
                        className="px-3 py-1.5 rounded-lg border border-[#E1E7E2] hover:bg-white text-xs font-bold text-[#18201B] flex items-center gap-1.5 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#2F8F46]" />
                        <span>{hasCoords ? 'Edit Location Geofence' : 'Setup Work Location'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shared Attendance Logs Table */}
        <AttendanceHistoryTable logs={logs} role="company" loading={loading} />

        {/* Work Location Setup Modal */}
        <WorkLocationSetupModal
          internship={selectedInternship}
          companyUserId={user?.id}
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          onSetupComplete={() => loadData()}
        />
      </div>
    </PortalLayout>
  );
};
