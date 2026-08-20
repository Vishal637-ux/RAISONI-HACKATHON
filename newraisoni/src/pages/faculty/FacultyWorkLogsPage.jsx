import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { workLogService } from '../../services/workLogService';
import { taskService } from '../../services/taskService';
import { WorkLogTimeline } from '../../components/student/WorkLogTimeline';
import { BookOpen, RefreshCw, AlertCircle, Filter, CheckSquare, Calendar, ExternalLink, Star } from 'lucide-react';

export const FacultyWorkLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('ALL');
  const [activeTab, setActiveTab] = useState('LOGS');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const [menteeLogs, menteeTasks] = await Promise.all([
        workLogService.getFacultyWorkLogs(user.id),
        taskService.getFacultyTasks(user.id),
      ]);
      setLogs(menteeLogs || []);
      setTasks(menteeTasks || []);
    } catch (err) {
      console.error('Error loading faculty mentee work logs & tasks:', err);
      setErrorMsg(err.message || 'Failed to load mentee work logs & tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Extract list of unique assigned mentees from loaded logs & tasks
  const menteeMap = new Map();
  (logs || []).forEach((log) => {
    const sId = log.internships?.student_id;
    if (sId && !menteeMap.has(sId)) {
      const sUser = log.internships?.users || {};
      const sProf = log.internships?.student_profile || {};
      const name = sUser.full_name || sUser.email || 'Student Candidate';
      const dept = sProf.departments?.department_name || '';
      menteeMap.set(sId, { id: sId, name, dept });
    }
  });

  (tasks || []).forEach((t) => {
    const sId = t.internship?.student_id;
    if (sId && !menteeMap.has(sId)) {
      const sUser = t.internship?.users || {};
      const name = sUser.full_name || sUser.email || 'Student Candidate';
      menteeMap.set(sId, { id: sId, name, dept: '' });
    }
  });

  const menteeList = Array.from(menteeMap.values());

  const filteredLogs = selectedStudentId === 'ALL'
    ? logs
    : logs.filter((log) => log.internships?.student_id === selectedStudentId);

  const filteredTasks = selectedStudentId === 'ALL'
    ? tasks
    : tasks.filter((t) => t.internship?.student_id === selectedStudentId);

  return (
    <PortalLayout title="Mentee Daily Work Logs & Tasks" roleLabel="Faculty Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Academic Mentorship Oversight</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Assigned Mentee Daily Work Logs & Tasks</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Review daily work logs, assigned project tasks, and submitted student deliverables for your mentees.
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

        {/* Filter Bar & Tabs Toggle */}
        <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Sub-navigation Tabs */}
          <div className="flex items-center gap-2 bg-[#F8FAF9] p-1 rounded-xl border border-[#E1E7E2] w-full md:w-auto">
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'LOGS'
                  ? 'bg-white text-[#1F6B32] shadow-xs border border-[#C5E3CC]'
                  : 'text-[#66706A] hover:text-[#18201B]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Work Logs ({filteredLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('TASKS')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'TASKS'
                  ? 'bg-white text-[#1F6B32] shadow-xs border border-[#C5E3CC]'
                  : 'text-[#66706A] hover:text-[#18201B]'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Assigned Tasks & Deliverables ({filteredTasks.length})</span>
            </button>
          </div>

          {/* Mentee Selector Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#18201B]">
              <Filter className="w-4 h-4 text-[#2F8F46]" />
              <span className="hidden sm:inline">Select Mentee:</span>
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs bg-white border border-[#E1E7E2] rounded-lg font-semibold text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
            >
              <option value="ALL">All Assigned Mentees</option>
              {menteeList.map((m) => (
                <option key={m.id} value={m.id}>
                  👤 {m.name} {m.dept ? `(${m.dept})` : ''}
                </option>
              ))}
            </select>

            {selectedStudentId !== 'ALL' && (
              <button
                onClick={() => setSelectedStudentId('ALL')}
                className="text-xs font-bold text-[#2F8F46] hover:underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Daily Work Logs View */}
        {activeTab === 'LOGS' && (
          <WorkLogTimeline logs={filteredLogs} loading={loading} showStudentInfo={true} />
        )}

        {/* Tab 2: Assigned Tasks & Deliverables View */}
        {activeTab === 'TASKS' && (
          <div className="bg-white rounded-xl border border-[#E1E7E2] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#2F8F46]" />
                <h3 className="text-base font-bold text-[#18201B]">Assigned Mentee Tasks & Deliverables ({filteredTasks.length})</h3>
              </div>
              <span className="text-xs font-semibold text-[#1F6B32] bg-[#EAF4EC] px-2.5 py-1 rounded-full">
                Task Audit History
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-[#66706A]">Loading mentee tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#66706A]">No assigned tasks or deliverables found for this view.</div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((t) => {
                  const studentName = t.internship?.users?.full_name || t.internship?.users?.email || 'Student Candidate';
                  const sub = t.submission;

                  return (
                    <div key={t.id} className="p-4 rounded-xl border border-[#E1E7E2] bg-[#F8FAF9] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E7E2] pb-2 text-xs">
                        <div className="font-bold text-[#18201B]">
                          <span>👤 {studentName}</span>
                          <span className="text-[#66706A] font-normal ml-2">({t.internship?.internship_title || 'Internship Task'})</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#66706A]">
                          <span>Due: {t.due_date}</span>
                          {sub?.grade_rating && (
                            <span className="px-2 py-0.5 rounded bg-[#EAF4EC] text-[#1F6B32] font-bold text-[11px] flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Grade: {Number(sub.grade_rating).toFixed(2)} / 5.00
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#18201B]">{t.title}</h4>
                        <p className="text-xs text-[#66706A] mt-1 whitespace-pre-line">{t.description}</p>
                      </div>

                      {sub ? (
                        <div className="bg-white p-3 rounded-lg border border-[#C5E3CC] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1F6B32]">Student Deliverable Submission:</span>
                            <span className="text-[11px] text-[#66706A]">
                              Submitted: {new Date(sub.submitted_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-[#2F8F46] hover:underline flex items-center gap-1 truncate"
                            >
                              <span>{sub.file_url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                          {sub.remarks && (
                            <p className="text-[#66706A] italic">Remarks: "{sub.remarks}"</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-[#D97706] bg-[#FEF3C7] px-3 py-1.5 rounded-lg border border-[#FDE68A] font-medium">
                          ⏳ Deliverable submission pending from student.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
