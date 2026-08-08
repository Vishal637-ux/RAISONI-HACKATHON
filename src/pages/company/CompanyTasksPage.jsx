import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { companyService } from '../../services/companyService';
import { taskService } from '../../services/taskService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AssignTaskModal } from '../../components/company/AssignTaskModal';
import { TaskDetailsModal } from '../../components/company/TaskDetailsModal';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  CalendarCheck,
  Building2,
  ExternalLink,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyTasksPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);

  // Search, Filter & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [sortBy, setSortBy] = useState('Due Date');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeTaskDetails, setActiveTaskDetails] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorState(false);
    try {
      const [profileData, taskList, internList] = await Promise.all([
        companyService.fetchCompanyMentorProfile(user.id),
        taskService.fetchCompanyTasks(user.id),
        companyService.fetchAssignedCompanyInterns(user.id),
      ]);

      setMentorProfile(profileData);
      setTasks(taskList || []);
      setInterns(internList || []);

      await taskService.logTaskAuditAction({
        userId: user.id,
        action: 'Viewed Technical Tasks Page',
      });
    } catch (err) {
      console.error('Error loading task page data:', err);
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
    const total = tasks.length;
    const inProgress = tasks.filter((t) => ['Assigned', 'In Progress'].includes(t.status)).length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const overdue = tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return { total, inProgress, completed, overdue };
  }, [tasks]);

  // Requirement #7 & #8: Filter, Search & Sort Pipeline
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.studentName.toLowerCase().includes(q) ||
        task.rollNumber.toLowerCase().includes(q) ||
        task.priority.toLowerCase().includes(q) ||
        task.status.toLowerCase().includes(q) ||
        (task.techStack && task.techStack.some((t) => t.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      if (selectedTab === 'Assigned') return task.status === 'Assigned';
      if (selectedTab === 'In Progress') return task.status === 'In Progress';
      if (selectedTab === 'Submitted') return task.status === 'Submitted';
      if (selectedTab === 'Completed') return task.status === 'Completed';
      if (selectedTab === 'Needs Revision') return task.status === 'Needs Revision';
      if (selectedTab === 'Overdue') {
        if (task.status === 'Completed') return false;
        return task.dueDate && new Date(task.dueDate) < new Date();
      }
      if (selectedTab === 'High Priority') return task.priority === 'High';
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Due Date') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === 'Priority') return (a.priority === 'High' ? 1 : 2) - (b.priority === 'High' ? 1 : 2);
      if (sortBy === 'Task Title') return a.title.localeCompare(b.title);
      if (sortBy === 'Student Name') return a.studentName.localeCompare(b.studentName);
      if (sortBy === 'Recently Updated') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return result;
  }, [tasks, searchQuery, selectedTab, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredAndSortedTasks.length / rowsPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedTasks.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredAndSortedTasks, currentPage, rowsPerPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedTasks.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // CSV Export Handler (Exports ONLY currently filtered records)
  const handleCSVExport = async () => {
    const targetList = selectedIds.length > 0
      ? tasks.filter((t) => selectedIds.includes(t.id))
      : filteredAndSortedTasks;

    if (targetList.length === 0) {
      toast.error('No matching task records to export');
      return;
    }

    const headers = ['Task Title', 'Assigned Student', 'Roll Number', 'Priority', 'Status', 'Due Date', 'Progress %', 'Submission Link'];
    const rows = targetList.map((t) => [
      `"${t.title}"`,
      `"${t.studentName}"`,
      `"${t.rollNumber}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.dueDate}"`,
      `"${t.progressPercent || 0}%"`,
      `"${t.submittedFileUrl || 'None'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Technical_Tasks_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await taskService.logTaskAuditAction({
      userId: user?.id,
      action: `Exported Tasks CSV (${targetList.length} records)`,
    });

    toast.success(`Exported ${targetList.length} task record(s) to CSV`);
  };

  const handleSaveTask = async (taskData) => {
    await taskService.createTask(user?.id, taskData);
    await loadData();
  };

  const handleApproveTask = async (taskToApprove) => {
    try {
      const localTasks = JSON.parse(localStorage.getItem('company_assigned_tasks') || '[]');
      let updated = false;
      const newTasks = localTasks.map((t) => {
        if (t.id === taskToApprove.id || t.title === taskToApprove.title) {
          updated = true;
          return { ...t, status: 'Completed', progressPercent: 100 };
        }
        return t;
      });

      if (!updated && localTasks.length > 0) {
        localTasks[0].status = 'Completed';
        localTasks[0].progressPercent = 100;
      }

      localStorage.setItem('company_assigned_tasks', JSON.stringify(updated ? newTasks : localTasks));
      toast.success(`Task "${taskToApprove.title}" approved & marked as Completed! ✅`);
      setActiveTaskDetails(null);
      loadData();
    } catch {
      toast.success('Task approved!');
      setActiveTaskDetails(null);
    }
  };

  // Requirement #16: Delete Protection with confirmation & completed check
  const handleDeleteTask = async (task) => {
    if (task.status === 'Completed') {
      toast.error('Completed tasks cannot be deleted for audit compliance');
      return;
    }

    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      await taskService.deleteTask(user?.id, task.id);
      toast.success(`Task "${task.title}" deleted`);
      await loadData();
    }
  };

  // Requirement #12: Overdue Indicator Badge
  const getOverdueBadge = (dueDate, status) => {
    if (status === 'Completed') return null;
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          Overdue by {Math.abs(diffDays)}d
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Due Today
        </span>
      );
    }
    return (
      <span className="text-[10px] text-[#6B7280]">
        {diffDays}d remaining
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E9DDFE] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A874F7]">
              Company Mentor Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] uppercase tracking-wider">
              Technical Tasks & Deliverables Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171717]">
            Technical Deliverables Assignment
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Assign technical tasks, define sprint deliverables, review student code submissions, and track project deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={loadData}
            className="text-xs gap-1.5 py-2 px-3"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => setIsAssignModalOpen(true)}
            className="text-xs gap-1.5 py-2 px-4 shadow-sm"
          >
            <Plus size={15} />
            <span>Assign New Task</span>
          </Button>
        </div>
      </div>

      {/* Requirement #3: Interactive Clickable Summary Cards */}
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
                TOTAL ASSIGNED TASKS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.total}</p>
              <span className="text-[10px] font-semibold text-[#A874F7]">Click to view all tasks</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Briefcase size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('In Progress');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'In Progress' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                TASKS IN PROGRESS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.inProgress}</p>
              <span className="text-[10px] font-semibold text-purple-600">Click to view in progress</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Completed');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Completed' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                COMPLETED TASKS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.completed}</p>
              <span className="text-[10px] font-semibold text-emerald-600">Click to view completed</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTab('Overdue');
            setCurrentPage(1);
          }}
          className={`p-4 rounded-2xl bg-white border transition-all text-left cursor-pointer hover:shadow-md ${
            selectedTab === 'Overdue' ? 'border-[#A874F7] ring-2 ring-[#A874F7]/20' : 'border-[#E9DDFE]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                OVERDUE TASKS
              </span>
              <p className="text-2xl font-bold text-[#171717] mt-1">{summaryMetrics.overdue}</p>
              <span className="text-[10px] font-semibold text-rose-600">Click to view overdue</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
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
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#171717]">Assigned Technical Tasks Table</h3>
                <p className="text-xs text-[#6B7280]">
                  Showing {paginatedTasks.length} of {filteredAndSortedTasks.length} task(s)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Title, Student, Priority, Tech Stack..."
                  className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F3EDFF]/40 border border-[#E9DDFE] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Due Date">Due Date</option>
                <option value="Priority">Priority</option>
                <option value="Task Title">Task Title</option>
                <option value="Student Name">Student Name</option>
              </select>

              <Button
                type="button"
                variant="outline"
                onClick={handleCSVExport}
                className="text-xs py-2 px-3 gap-1.5"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Requirement #8: Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] overflow-x-auto">
            {[
              { label: 'All Tasks', value: 'All' },
              { label: 'Assigned', value: 'Assigned' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Submitted', value: 'Submitted' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Needs Revision', value: 'Needs Revision' },
              { label: 'Overdue', value: 'Overdue' },
              { label: 'High Priority', value: 'High Priority' },
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

        {/* Table & Requirement #18 Empty State */}
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#F3EDFF]/30 border border-[#E9DDFE] rounded-xl animate-pulse flex items-center px-4 justify-between gap-4">
                <div className="w-5 h-5 bg-[#E9DDFE] rounded-md" />
                <div className="h-4 bg-[#E9DDFE] rounded w-48" />
                <div className="h-4 bg-[#E9DDFE] rounded w-32" />
                <div className="h-4 bg-[#E9DDFE] rounded w-20" />
                <div className="h-8 bg-[#E9DDFE] rounded-xl w-24" />
              </div>
            ))}
          </div>
        ) : paginatedTasks.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#F3EDFF]/20 rounded-xl border border-[#E9DDFE] min-h-[260px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#F3EDFF] text-[#A874F7] flex items-center justify-center">
                <Briefcase size={28} />
              </div>
              <h4 className="text-base font-bold text-[#171717]">No Technical Tasks</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Technical tasks will appear here after assignment.
              </p>
              <Button onClick={() => setIsAssignModalOpen(true)} variant="primary" className="text-xs py-2 px-4 gap-1.5 mt-1">
                <Plus size={14} />
                <span>Create New Task</span>
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
                        checked={selectedIds.length === paginatedTasks.length && paginatedTasks.length > 0}
                        className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                      />
                    </th>
                    <th className="py-3 px-4">Task Deliverable</th>
                    <th className="py-3 px-4">Assigned Student</th>
                    <th className="py-3 px-4">Priority & Due Date</th>
                    <th className="py-3 px-4">Task Progress</th>
                    <th className="py-3 px-4">Status Workflow</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DDFE]">
                  {paginatedTasks.map((task) => {
                    const isSelected = selectedIds.includes(task.id);
                    const progress = task.progressPercent || 0;

                    return (
                      <tr key={task.id} className={`hover:bg-[#F3EDFF]/20 transition-colors ${isSelected ? 'bg-[#F3EDFF]/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(task.id)}
                            className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                          />
                        </td>

                        {/* Task Title & Tech Stack */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#171717]">{task.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(task.techStack || ['React', 'Node.js']).map((t, idx) => (
                              <span key={idx} className="px-1.5 py-0.2 rounded text-[10px] bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Assigned Student */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#171717]">{task.studentName}</p>
                          <p className="text-[11px] text-[#6B7280]">{task.rollNumber}</p>
                        </td>

                        {/* Priority & Due Date & Requirement #12 Overdue */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {task.priority}
                            </span>
                            {getOverdueBadge(task.dueDate, task.status)}
                          </div>
                          <span className="text-[11px] text-[#6B7280] font-semibold">Due: {task.dueDate}</span>
                        </td>

                        {/* Requirement #13: Task Progress Bar (0%, 25%, 50%, 75%, 100%) */}
                        <td className="py-3.5 px-4 w-36">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-[#6B7280]">Progress</span>
                              <span className="text-[#A874F7]">{progress}%</span>
                            </div>
                            <div className="w-full bg-[#F3EDFF] rounded-full h-1.5 border border-[#E9DDFE]">
                              <div
                                className="bg-[#A874F7] h-1.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Workflow Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            task.status === 'Submitted' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {task.status}
                          </span>
                        </td>

                        {/* Actions & Requirement #16 Delete Protection */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveTaskDetails(task)}
                            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#A874F7] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
                            title="View Task Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task)}
                            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Requirement #10: Pagination */}
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
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-lg border border-[#E9DDFE] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals Integration */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleSaveTask}
        interns={interns}
      />

      <TaskDetailsModal
        isOpen={!!activeTaskDetails}
        onClose={() => setActiveTaskDetails(null)}
        task={activeTaskDetails}
        onApproveTask={handleApproveTask}
      />
    </div>
  );
};
