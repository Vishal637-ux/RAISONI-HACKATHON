import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';

export const TaskAssignmentModal = ({ isOpen, onClose, internships = [], onAssignTask }) => {
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetInternshipId = selectedInternshipId || internships[0]?.id;
    if (!targetInternshipId) {
      setErrorMsg('Please select an active internship to assign this task.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Task title is required.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Task description is required.');
      return;
    }

    if (!dueDate) {
      setErrorMsg('Task due date is required.');
      return;
    }

    if (dueDate <= todayStr) {
      setErrorMsg('Task due date must be a future date.');
      return;
    }

    try {
      setLoading(true);
      await onAssignTask(targetInternshipId, {
        title: title.trim(),
        description: description.trim(),
        dueDate,
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to assign task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E1E7E2] max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#E1E7E2] pb-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#2F8F46]" />
            <h3 className="text-lg font-bold text-[#18201B]">Assign New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706A] hover:bg-[#F8FAF9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Internship Selector */}
          {internships.length > 1 && (
            <div>
              <label className="block font-bold text-[#18201B] mb-1.5">Select Intern / Internship *</label>
              <select
                value={selectedInternshipId}
                onChange={(e) => setSelectedInternshipId(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#E1E7E2] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] text-[#18201B]"
              >
                {internships.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.users?.full_name || 'Intern'} — {i.internship_title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block font-bold text-[#18201B] mb-1.5">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement User Authentication REST Endpoints"
              className="w-full p-3 rounded-lg border border-[#E1E7E2] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] text-[#18201B]"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block font-bold text-[#18201B] mb-1.5">Task Description & Deliverable Instructions *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe requirements, acceptance criteria, and expected deliverables..."
              className="w-full p-3 rounded-lg border border-[#E1E7E2] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] text-[#18201B] resize-none"
            />
          </div>

          {/* Task Due Date */}
          <div>
            <label className="block font-bold text-[#18201B] mb-1.5">Future Due Date *</label>
            <div className="relative">
              <input
                type="date"
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 rounded-lg border border-[#E1E7E2] focus:outline-none focus:ring-2 focus:ring-[#2F8F46] text-[#18201B]"
              />
            </div>
            <p className="text-[11px] text-[#66706A] mt-1">Must be set to a future calendar date.</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E1E7E2] text-[#66706A] hover:bg-[#F8FAF9] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#2F8F46] hover:bg-[#1F6B32] text-white font-bold transition-all shadow-xs"
            >
              {loading ? 'Assigning Task...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
