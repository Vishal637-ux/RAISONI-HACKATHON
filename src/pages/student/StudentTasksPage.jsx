import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import { TaskSummaryCards } from '../../components/student/TaskSummaryCards';
import { TaskListCard } from '../../components/student/TaskListCard';
import { TaskSubmissionModal } from '../../components/student/TaskSubmissionModal';
import { Loader } from '../../components/common/Loader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CheckSquare, AlertTriangle, RefreshCw, CheckCircle2, ArrowRight, Clock, Lock, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentTasksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInternship, setActiveInternship] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTaskData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await taskService.fetchTaskRecords(user.id);
      setActiveInternship(data.activeInternship);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Task loading error:', err);
      setError('Unable to load tasks. Please check your connection.');
      setActiveInternship(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTaskData();
  }, [loadTaskData]);

  const handleOpenSubmitModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setSelectedTask(null);
      setIsModalOpen(false);
    }
  };

  const handleSubmitTask = async (formData) => {
    if (!user?.id || !formData.taskId) return false;
    setIsSubmitting(true);

    try {
      await taskService.submitTask({
        taskId: formData.taskId,
        studentId: user.id,
        fileUrl: formData.fileUrl,
        remarks: formData.remarks,
      });

      toast.success('Task submitted successfully!');
      await loadTaskData();
      return true;
    } catch (err) {
      console.error('Task submission error:', err);
      toast.error(err.message || 'Failed to submit task');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Tasks & Reports</h1>
          <p className="text-xs text-[#6B7280]">
            View mentor-assigned internship tasks and submit your deliverables.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 bg-white border border-[#E9DDFE] rounded-2xl p-8">
          <Loader size="lg" />
          <p className="text-xs font-medium text-[#6B7280]">Loading assigned tasks...</p>
        </div>
      </div>
    );
  }

  // 2. Error State with Retry Button
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Tasks & Reports</h1>
          <p className="text-xs text-[#6B7280]">
            View mentor-assigned internship tasks and submit your deliverables.
          </p>
        </div>

        <Card className="bg-rose-50 border border-rose-200 p-8 text-center shadow-sm rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-base font-bold text-rose-900">Failed to load tasks.</h3>
            <p className="text-xs text-rose-700 max-w-md">{error}</p>
            <Button
              onClick={loadTaskData}
              variant="danger"
              className="mt-2 gap-2 text-xs"
            >
              <RefreshCw size={14} />
              Retry Loading Tasks
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 3. No Active Internship State (Refined EmptyState View)
  if (!activeInternship) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Tasks & Reports</h1>
          <p className="text-xs text-[#6B7280]">
            View mentor-assigned internship tasks and submit your deliverables.
          </p>
        </div>

        <Card className="bg-white border border-[#E9DDFE] p-8 sm:p-10 shadow-sm rounded-2xl min-h-[340px] flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out">
          <div className="flex flex-col items-center justify-center text-center gap-4 max-w-lg mx-auto w-full">
            {/* Task Icon */}
            <div className="w-20 h-20 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center shadow-2xs shrink-0">
              <CheckSquare size={56} />
            </div>

            {/* Dual Status Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock size={13} />
                <span>Internship: <strong className="font-bold">Not Assigned</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
                <Lock size={13} />
                <span>Tasks: <strong className="font-bold">Locked</strong></span>
              </div>
            </div>

            {/* Heading & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#171717]">
                No Active Internship Found
              </h3>
              <p className="text-xs text-[#6B7280] max-w-[440px] mx-auto leading-relaxed">
                Complete your internship onboarding and wait for your internship to be approved. Once your mentor assigns tasks, they will automatically appear here.
              </p>
            </div>

            {/* Requirements Checklist Card */}
            <div className="bg-[#F3EDFF]/40 border border-[#E9DDFE] rounded-xl p-4 max-w-[400px] w-full text-left text-xs text-[#6B7280] space-y-2 my-1">
              <span className="font-semibold text-[#171717] block text-center mb-1 text-xs">
                Tasks become available after:
              </span>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Internship Assigned</span>
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Internship Status = Approved or Ongoing</span>
              </div>
              <div className="flex items-center gap-2 text-[#4B5563]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Mentor assigns your first task</span>
              </div>
            </div>

            {/* What Happens Next? Informational Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-[400px] w-full text-left text-xs text-[#6B7280] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#171717] font-semibold text-xs mb-1">
                <Info size={14} className="text-[#A874F7]" />
                <span>Once unlocked, this page will allow you to:</span>
              </div>
              <ul className="space-y-1 text-[#4B5563] pl-2">
                <li>• View mentor-assigned tasks</li>
                <li>• Track task deadlines</li>
                <li>• Submit task reports</li>
                <li>• Receive mentor feedback</li>
                <li>• Monitor task completion status</li>
              </ul>
            </div>

            {/* Call-to-Action Primary Button */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.STUDENT_INTERNSHIP)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#A874F7] hover:bg-[#965be3] rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm cursor-pointer mt-1"
            >
              <span>Go to Internship</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Active Internship but 0 Tasks Assigned State
  if (tasks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Tasks & Reports</h1>
          <p className="text-xs text-[#6B7280]">
            Track assigned tasks for{' '}
            <span className="font-semibold text-[#171717]">{activeInternship.companyName}</span>
          </p>
        </div>

        <TaskSummaryCards tasks={[]} />

        <Card className="bg-white border border-[#E9DDFE] p-8 sm:p-10 shadow-sm rounded-2xl text-center min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
              <CheckSquare size={36} />
            </div>
            <h3 className="text-lg font-semibold text-[#171717]">No Tasks Assigned Yet</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Your mentor has not assigned any internship tasks yet. Tasks will automatically appear here once they are assigned.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 5. Active Tasks View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold text-[#171717]">Tasks & Reports</h1>
          <p className="text-xs text-[#6B7280]">
            View mentor-assigned internship tasks and submit your deliverables for{' '}
            <span className="font-semibold text-[#171717]">{activeInternship.companyName}</span>
          </p>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <TaskSummaryCards tasks={tasks} />

      {/* Task List */}
      <TaskListCard tasks={tasks} onOpenSubmitModal={handleOpenSubmitModal} />

      {/* Task Submission Modal */}
      <TaskSubmissionModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmitTask={handleSubmitTask}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
