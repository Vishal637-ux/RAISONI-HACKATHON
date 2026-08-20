import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { companyService } from '../../services/companyService';
import { TaskAssignmentModal } from '../../components/company/TaskAssignmentModal';
import { TaskGradingModal } from '../../components/shared/TaskGradingModal';
import { Plus, CheckSquare, Star, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export const CompanyTasksPage = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [tasks, setTasks] = useState([]);
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

      // Fetch company active internships
      const compInternships = await companyService.getCompanyActiveInternships(user.id);
      setInternships(compInternships || []);

      // Fetch company tasks
      const compTasks = await taskService.getCompanyTasks(user.id);
      setTasks(compTasks || []);
    } catch (err) {
      console.error('Error loading company tasks:', err);
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

  return (
    <PortalLayout title="Company Task Management" roleLabel="Company Mentor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <CheckSquare className="w-4 h-4" />
              <span>Intern Task Supervision</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Company Intern Tasks & Deliverables</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Assign project tasks to your active company interns, review deliverables, and evaluate performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
              title="Refresh tasks"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center text-xs text-[#66706A]">
            Loading intern tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">No Tasks Created Yet</h3>
            <p className="text-xs text-[#66706A]">
              Click "Assign New Task" to create a task for your active company interns.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const submission = task.submission;
              const isSubmitted = Boolean(submission);
              const isGraded = submission && submission.grade_rating !== null && submission.grade_rating !== undefined;
              const studentName = task.internship?.users?.full_name || 'Intern Candidate';

              return (
                <div key={task.id} className="bg-white p-5 rounded-xl border border-[#E1E7E2] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E2] pb-3">
                    <div>
                      <div className="text-xs font-bold text-[#1F6B32]">
                        Intern: {studentName} ({task.internship?.internship_title})
                      </div>
                      <h3 className="text-base font-bold text-[#18201B] mt-0.5">{task.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#66706A] bg-[#F8FAF9] px-2.5 py-1 rounded-full border border-[#E1E7E2]">
                        Due: {task.due_date}
                      </span>

                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] px-3 py-1 rounded-full border border-[#C5E3CC]">
                          <Star className="w-3.5 h-3.5 fill-[#2F8F46] text-[#2F8F46]" />
                          Grade: {submission.grade_rating} / 5.00
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#FEF3C7] text-[#D97706] px-3 py-1 rounded-full border border-[#FDE68A]">
                          Deliverable Ready for Review
                        </span>
                      ) : (
                        <span className="text-xs text-[#66706A] bg-[#F8FAF9] px-2.5 py-1 rounded-full border border-[#E1E7E2]">
                          Awaiting Student Deliverable
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#18201B] whitespace-pre-line">{task.description}</p>

                  {/* Submission Details */}
                  {isSubmitted && (
                    <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#E1E7E2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-bold text-[#18201B] mb-1">Student Deliverable Link:</div>
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[#2F8F46] hover:underline text-xs"
                        >
                          <span>{submission.file_url}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {submission.remarks && (
                          <div className="text-[11px] text-[#66706A] italic mt-1">
                            Remarks: "{submission.remarks}"
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenGradingModal(task, submission)}
                        className="px-4 py-2 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold shrink-0 transition-all shadow-xs"
                      >
                        {isGraded ? 'Update Grade & Feedback' : 'Grade Submission (1-5)'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Task Assignment Modal */}
        <TaskAssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          internships={internships}
          onAssignTask={handleAssignTask}
        />

        {/* Task Grading Modal */}
        <TaskGradingModal
          isOpen={isGradingModalOpen}
          onClose={() => setIsGradingModalOpen(false)}
          task={selectedTask}
          submission={selectedSubmission}
          onGradeSubmission={handleGradeSubmission}
        />
      </div>
    </PortalLayout>
  );
};
