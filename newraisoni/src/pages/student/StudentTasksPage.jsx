import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../layouts/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { TaskSubmissionModal } from '../../components/student/TaskSubmissionModal';
import { CheckSquare, Clock, Calendar, Star, UploadCloud, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';

export const StudentTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const studentTasks = await taskService.getStudentTasks(user.id);
      setTasks(studentTasks);
    } catch (err) {
      console.error('Error loading student tasks:', err);
      setErrorMsg(err.message || 'Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenSubmitModal = (task) => {
    setSelectedTask(task);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitDeliverable = async (taskId, submissionData) => {
    await taskService.submitTaskDeliverable(user.id, taskId, submissionData);
    await loadData();
  };

  return (
    <PortalLayout title="Assigned Tasks & Deliverables" roleLabel="Student Candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F6B32] mb-1">
              <CheckSquare className="w-4 h-4" />
              <span>Assigned Internship Tasks</span>
            </div>
            <h2 className="text-xl font-bold text-[#18201B]">Tasks & Project Deliverables</h2>
            <p className="text-xs text-[#66706A] mt-1">
              Review tasks assigned by your mentor, upload deliverables, and view grading feedback.
            </p>
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
            Loading assigned tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E1E7E2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F8F46] flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#18201B]">No Tasks Assigned Yet</h3>
            <p className="text-xs text-[#66706A]">
              Your mentor has not assigned any project tasks to your active internship yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const submission = task.submission;
              const isSubmitted = Boolean(submission);
              const isGraded = submission && submission.grade_rating !== null && submission.grade_rating !== undefined;
              const todayStr = new Date().toISOString().split('T')[0];
              const isOverdue = !isSubmitted && task.due_date < todayStr;

              return (
                <div
                  key={task.id}
                  className={`bg-white p-5 rounded-xl border transition-all space-y-4 ${
                    isGraded
                      ? 'border-[#C5E3CC] bg-[#F8FAF9]'
                      : isSubmitted
                      ? 'border-[#E1E7E2]'
                      : isOverdue
                      ? 'border-[#FCA5A5] bg-[#FEF2F2]/30'
                      : 'border-[#E1E7E2] hover:border-[#2F8F46]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E7E2] pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#1F6B32] uppercase tracking-wider">
                        {task.internship?.companies?.company_name || 'Assigned Task'}
                      </span>
                      <h3 className="text-base font-bold text-[#18201B] mt-0.5">{task.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-[#66706A] bg-[#F8FAF9] px-2.5 py-1 rounded-full border border-[#E1E7E2]">
                        <Calendar className="w-3.5 h-3.5 text-[#2F8F46]" />
                        Due: {task.due_date}
                      </span>

                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#EAF4EC] text-[#1F6B32] px-3 py-1 rounded-full border border-[#C5E3CC]">
                          <Star className="w-3.5 h-3.5 fill-[#2F8F46] text-[#2F8F46]" />
                          Graded: {submission.grade_rating} / 5.00
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#FEF3C7] text-[#D97706] px-3 py-1 rounded-full border border-[#FDE68A]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Submitted (Pending Grade)
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#FEF2F2] text-[#991B1B] px-3 py-1 rounded-full border border-[#FCA5A5]">
                          <Clock className="w-3.5 h-3.5" />
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#F8FAF9] text-[#66706A] px-3 py-1 rounded-full border border-[#E1E7E2]">
                          Pending Submission
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#18201B] whitespace-pre-line leading-relaxed">
                    {task.description}
                  </p>

                  {/* Submission Details if Present */}
                  {isSubmitted && (
                    <div className="p-3.5 bg-white rounded-lg border border-[#E1E7E2] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#18201B]">Your Submission:</span>
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#2F8F46] font-bold hover:underline text-xs"
                        >
                          <span>View Deliverable Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {submission.remarks && (
                        <div className="text-[11px] text-[#66706A] italic border-t border-[#E1E7E2] pt-1">
                          Mentor Feedback: "{submission.remarks}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleOpenSubmitModal(task)}
                      className="px-4 py-2 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{isSubmitted ? 'Resubmit Deliverable' : 'Submit Task Deliverable'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Task Submission Modal */}
        <TaskSubmissionModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          task={selectedTask}
          onSubmitDeliverable={handleSubmitDeliverable}
        />
      </div>
    </PortalLayout>
  );
};
