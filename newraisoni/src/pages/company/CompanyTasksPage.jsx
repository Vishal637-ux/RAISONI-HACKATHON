import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { companyService } from '../../services/companyService';
import { workLogService } from '../../services/workLogService';
import { TaskAssignmentModal } from '../../components/company/TaskAssignmentModal';
import { TaskGradingModal } from '../../components/shared/TaskGradingModal';
import { WorkLogTimeline } from '../../components/student/WorkLogTimeline';
import { Plus, CheckSquare, Star, ExternalLink, RefreshCw, AlertCircle, Filter, Calendar } from 'lucide-react';

export const CompanyTasksPage = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('ALL');
  const [activeTab, setActiveTab] = useState('TASKS');
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');

      const [compInternships, compTasks, compLogs] = await Promise.all([
        companyService.getCompanyActiveInternships(user.id),
        taskService.getCompanyTasks(user.id),
        workLogService.getCompanyWorkLogs(user.id),
      ]);

      setInternships(compInternships || []);
      setTasks(compTasks || []);
      setLogs(compLogs || []);
    } catch (err) {
      console.error('Error loading company tasks & logs:', err);
      setErrorMsg(err.message || 'Failed to load company tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAssignTask = async (internshipId, taskData) => {
    await taskService.createTask(user.id, internshipId, taskData);
    await loadData();
  };

  const handleOpenGradingModal = (task, submission) => {
    setSelectedTask(task);
    setSelectedSubmission(submission);
    setIsGradingModalOpen(true);
  };

  const handleGradeSubmission = async (submissionId, gradeData) => {
    await taskService.gradeTaskSubmission(user.id, submissionId, gradeData);
    await loadData();
  };

  // Build list of unique company interns
  const internMap = new Map();
  (internships || []).forEach((i) => {
    if (i.student_id && !internMap.has(i.student_id)) {
      const sUser = i.users || {};
      internMap.set(i.student_id, {
        id: i.student_id,
        name: sUser.full_name || sUser.email || 'Company Intern',
        title: i.internship_title || '',
      });
    }
  });

  const internList = Array.from(internMap.values());

  const filteredTasks = selectedStudentId === 'ALL'
    ? tasks
    : tasks.filter((t) => t.internship?.student_id === selectedStudentId);

  const filteredLogs = selectedStudentId === 'ALL'
    ? logs
    : logs.filter((l) => l.internships?.student_id === selectedStudentId);

  return (
    <PortalLayout title="Company Task & Work Oversight" roleLabel="Company Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <CheckSquare className="w-4 h-4" />
              <span>Intern Supervision & Work Oversight</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Company Intern Tasks & Work Logs</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Assign project tasks, review deliverables, evaluate performance, and monitor daily intern work logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
              title="Refresh tasks & logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Sub-Navigation Tabs */}
        <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Sub-navigation Tabs */}
          <div className="flex items-center gap-2 bg-[#F8FAF9] p-1 rounded-xl border border-[#E1E7E2] w-full md:w-auto">
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
          </div>

          {/* Intern Selector Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#18201B]">
              <Filter className="w-4 h-4 text-[#2F8F46]" />
              <span className="hidden sm:inline">Filter by Intern:</span>
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs bg-white border border-[#E1E7E2] rounded-lg font-semibold text-[#18201B] focus:outline-none focus:border-[#2F8F46]"
            >
              <option value="ALL">All Active Company Interns</option>
              {internList.map((i) => (
                <option key={i.id} value={i.id}>
                  👤 {i.name} {i.title ? `(${i.title})` : ''}
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

        {/* Tab 1: Assigned Tasks & Deliverables View */}
        {activeTab === 'TASKS' && (
          <>
            {loading ? (
              <div className="p-12 bg-white rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
                Loading company tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 bg-white rounded-xl border border-[#E1E7E2] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#18201B]">No Company Tasks Found</h3>
                <p className="text-xs text-[#66706A]">
                  Click "Assign New Task" above to assign project tasks to your company interns.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((t) => {
                  const studentName = t.internship?.users?.full_name || t.internship?.users?.email || 'Student Candidate';
                  const sub = t.submission;

                  return (
                    <div key={t.id} className="p-5 bg-white rounded-xl border border-[#E1E7E2] shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F4F1] pb-3">
                        <div>
                          <span className="text-xs font-semibold text-[#2F8F46]">
                            Intern: <strong className="text-[#18201B]">{studentName}</strong> ({t.internship?.internship_title || 'Company Intern'})
                          </span>
                          <h3 className="text-base font-bold text-[#18201B] mt-0.5">{t.title}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#66706A] bg-[#F8FAF9] px-2.5 py-1 rounded-md border border-[#E1E7E2]">
                            Due: {t.due_date}
                          </span>
                          {sub?.grade_rating && (
                            <span className="px-2.5 py-1 rounded-md bg-[#EAF4EC] text-[#1F6B32] border border-[#C5E3CC] text-xs font-bold flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              Grade: {Number(sub.grade_rating).toFixed(2)} / 5.00
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#66706A] leading-relaxed whitespace-pre-line">{t.description}</p>

                      {sub ? (
                        <div className="bg-[#F8FAF9] p-4 rounded-xl border border-[#C5E3CC] space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#18201B]">Student Deliverable Link:</span>
                            <span className="text-[#66706A]">Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
                          </div>

                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-[#2F8F46] hover:underline flex items-center gap-1 text-sm truncate"
                          >
                            <span>{sub.file_url}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>

                          {sub.remarks && (
                            <p className="text-[#66706A] italic">Remarks: "{sub.remarks}"</p>
                          )}

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleOpenGradingModal(t, sub)}
                              className="px-4 py-2 bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              {sub.grade_rating ? 'Update Grade & Feedback' : 'Grade Submission'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] rounded-xl text-xs font-semibold flex items-center justify-between">
                          <span>⏳ Awaiting student deliverable submission...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Tab 2: Daily Work Logs View */}
        {activeTab === 'LOGS' && (
          <WorkLogTimeline logs={filteredLogs} loading={loading} showStudentInfo={true} />
        )}

        {/* Task Assignment Modal */}
        <TaskAssignmentModal
          internships={internships}
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onAssignTask={handleAssignTask}
        />

        {/* Task Grading Modal */}
        <TaskGradingModal
          task={selectedTask}
          submission={selectedSubmission}
          isOpen={isGradingModalOpen}
          onClose={() => setIsGradingModalOpen(false)}
          onGradeSubmission={handleGradeSubmission}
        />
      </div>
    </PortalLayout>
  );
};
