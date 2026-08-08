import { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CheckSquare, Clock, CheckCircle2, Calendar, User, ExternalLink, Send } from 'lucide-react';

export const TaskListCard = ({ tasks = [], onOpenSubmitModal }) => {
  const [filter, setFilter] = useState('All');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Pending') return task.status === 'Assigned' || task.status === 'In Progress';
    if (filter === 'Submitted') return task.status === 'Submitted';
    if (filter === 'Completed') return task.status === 'Completed';
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="bg-white border border-[#E9DDFE] p-5 shadow-sm rounded-2xl">
      {/* Header Bar with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E9DDFE] pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
            <CheckSquare size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#171717]">Assigned Internship Tasks</h3>
            <p className="text-xs text-[#6B7280]">
              Showing {filteredTasks.length} task(s)
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F3EDFF]/50 p-1 rounded-xl border border-[#E9DDFE] self-start sm:self-auto">
          {['All', 'Pending', 'Submitted', 'Completed'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-white text-[#A874F7] shadow-2xs border border-[#E9DDFE]'
                  : 'text-[#6B7280] hover:text-[#171717]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 px-4 bg-[#F3EDFF]/20 rounded-xl border border-[#E9DDFE]">
          <p className="text-xs text-[#6B7280]">No tasks match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isSubmitted = task.status === 'Submitted';

            return (
              <div
                key={task.id}
                className="p-4 sm:p-5 rounded-2xl border border-[#E9DDFE] bg-white hover:border-[#A874F7]/40 hover:shadow-xs transition-all duration-200"
              >
                {/* Title & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-[#171717]">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isSubmitted
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={12} />
                          Completed & Verified
                        </>
                      ) : isSubmitted ? (
                        <>
                          <Send size={12} />
                          Submitted (Pending Mentor Review)
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          Pending Submission
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-xs text-[#4B5563] mb-3 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Meta info bar */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6B7280] border-t border-[#E9DDFE] pt-3 mt-3">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-[#A874F7]" />
                    <span>Assigned by: <strong className="font-semibold text-[#171717]">{task.assignedBy || 'Vikram Mehta (Company Mentor)'}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#A874F7]" />
                    <span>Due Date: <strong className="font-semibold text-[#171717]">{formatDate(task.dueDate)}</strong></span>
                  </div>
                </div>

                {/* Submitted Details */}
                {(isSubmitted || isCompleted) && (
                  <div className="mt-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs space-y-1">
                    {task.submittedFileUrl && (
                      <div className="flex items-center gap-1.5 font-medium text-purple-800">
                        <ExternalLink size={13} />
                        <span>Submitted Link:</span>
                        <a
                          href={task.submittedFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#A874F7] font-semibold hover:text-[#5B21B6] truncate max-w-xs"
                        >
                          {task.submittedFileUrl}
                        </a>
                      </div>
                    )}
                    {task.submittedAt && (
                      <p className="text-[11px] text-[#6B7280]">Submitted on: {formatDateTime(task.submittedAt)}</p>
                    )}
                  </div>
                )}

                {/* Action Footer */}
                <div className="mt-4 flex justify-end">
                  {isCompleted ? (
                    <Button variant="outline" disabled className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50 font-bold">
                      <CheckCircle2 size={14} className="mr-1.5" />
                      Task Completed & Verified
                    </Button>
                  ) : isSubmitted ? (
                    <Button variant="outline" disabled className="text-xs border-blue-200 text-blue-700 bg-blue-50 font-bold">
                      <Send size={14} className="mr-1.5" />
                      Deliverable Submitted
                    </Button>
                  ) : (
                    <Button onClick={() => onOpenSubmitModal(task)} className="text-xs font-bold py-2 px-4">
                      Submit Deliverable
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
