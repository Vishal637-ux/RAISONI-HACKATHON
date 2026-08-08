import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { X, Briefcase, Plus, Trash2, Calendar, Clock, Tag, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const AssignTaskModal = ({ isOpen, onClose, onSave, interns = [] }) => {
  const [selectedInternIds, setSelectedInternIds] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('High');
  const [estimatedHours, setEstimatedHours] = useState('20');
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState(['React', 'TypeScript']);
  const [documentUrl, setDocumentUrl] = useState('');
  const [mentorNotes, setMentorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddTechTag = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!techStack.includes(techInput.trim())) {
        setTechStack([...techStack, techInput.trim()]);
      }
      setTechInput('');
    }
  };

  const handleRemoveTechTag = (tech) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }
    if (selectedInternIds.length === 0 && interns.length > 0) {
      toast.error('Please select at least one assigned intern');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        selectedInternIds,
        title,
        description,
        dueDate,
        priority,
        estimatedHours,
        techStack,
        documentUrl,
        mentorNotes,
      });

      toast.success(`Task "${title}" assigned successfully to ${selectedInternIds.length || 1} intern(s)`);
      onClose();
    } catch {
      toast.error('Failed to assign task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-task-modal-title"
    >
      <Card className="bg-white border border-[#E9DDFE] max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] flex items-center justify-center font-bold">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 id="assign-task-modal-title" className="text-base font-bold text-[#171717]">
                Assign Technical Task & Deliverables
              </h3>
              <p className="text-xs text-[#6B7280]">
                Assign technical project deliverables to student engineers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg border border-[#E9DDFE] text-[#6B7280] hover:text-[#171717] hover:bg-[#F3EDFF]/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Select Intern(s) */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">
              Assigned Intern(s) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 rounded-xl border border-[#E9DDFE] bg-[#F3EDFF]/20">
              {interns.length === 0 ? (
                <div className="text-xs text-[#6B7280] p-2">Rahul Sharma, Priya Verma, Sneha Kulkarni</div>
              ) : (
                interns.map((i) => {
                  const isChecked = selectedInternIds.includes(i.id);
                  return (
                    <label
                      key={i.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked ? 'bg-white border-[#A874F7] text-[#A874F7] font-bold shadow-2xs' : 'bg-white/60 border-[#E9DDFE] text-[#171717]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInternIds([...selectedInternIds, i.id]);
                          } else {
                            setSelectedInternIds(selectedInternIds.filter((id) => id !== i.id));
                          }
                        }}
                        className="rounded border-[#E9DDFE] text-[#A874F7] focus:ring-[#A874F7]"
                      />
                      <span>{i.studentName} ({i.rollNumber})</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Task Title */}
          <Input
            label="Task Title"
            placeholder="e.g. Build JWT Authentication Flow & REST Endpoints"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Task Description */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">Detailed Task Requirements & Deliverables</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline task objectives, expected deliverables, acceptance criteria, and repository links..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#A874F7] transition-all placeholder:text-[#6B7280]"
            />
          </div>

          {/* Due Date & Priority & Estimated Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#171717]">Target Due Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#171717]">Task Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#171717]">Estimated Hours</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="20"
                className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>
          </div>

          {/* Tech Stack Tags */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">Technology Stack Tags (Press Enter to add)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTechTag}
                placeholder="e.g. React, TypeScript, Docker"
                className="flex-1 bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3EDFF] text-[#A874F7] border border-[#E9DDFE] font-bold text-[11px]"
                >
                  {tech}
                  <button type="button" onClick={() => handleRemoveTechTag(tech)} className="hover:text-rose-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Supporting Document & Internal Notes */}
          <Input
            label="Supporting Specification Link (Optional)"
            placeholder="https://drive.google.com/spec-doc or Figma URL"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block font-semibold text-[#171717]">Internal Mentor Notes (Private to Organization)</label>
            <input
              type="text"
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              placeholder="e.g. Technical evaluation criteria or internal notes..."
              className="w-full bg-[#F3EDFF]/30 border border-[#E9DDFE] text-[#171717] text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#A874F7]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9DDFE]">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs px-4">
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="text-xs px-5">
              Assign Task Deliverables
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
