import React from 'react';


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../common/Button';
import { X, Link2, FileText, Send, Loader2 } from 'lucide-react';

const submissionSchema = z
  .object({
    file_url: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine(
    (data) => {
      const url = (data.file_url || '').trim();
      const notes = (data.remarks || '').trim();
      if (!url && !notes) return false;
      if (url && !/^https?:\/\/.+/i.test(url)) return false;
      return true;
    },
    {
      message: 'Please enter a valid deliverable URL (starting with http:// or https://) or add submission notes.',
      path: ['file_url'],
    }
  );

export const TaskSubmissionModal = ({
  task,
  isOpen,
  onClose,
  onSubmitTask,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      file_url: '',
      remarks: '',
    },
  });

  if (!isOpen || !task) return null;

  const handleFormSubmit = async (data) => {
    const success = await onSubmitTask({
      taskId: task.id,
      fileUrl: data.file_url ? data.file_url.trim() : null,
      remarks: data.remarks ? data.remarks.trim() : null,
    });
    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E9DDFE] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#171717] p-1 rounded-lg hover:bg-[#F3EDFF] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#E9DDFE] pb-3">
          <div className="p-2.5 rounded-xl bg-[#F3EDFF] text-[#A874F7]">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#171717]">Submit Task Deliverable</h3>
            <p className="text-xs text-[#6B7280] truncate max-w-[320px]">
              Task: <span className="font-semibold text-[#171717]">{task.title}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* File URL Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
              <Link2 size={14} className="text-[#A874F7]" />
              <span>Deliverable / Report Link (URL)</span>
            </label>
            <input
              type="url"
              {...register('file_url')}
              placeholder="https://drive.google.com/file/d/..."
              className={`w-full bg-white border border-[#E9DDFE] text-[#171717] text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all placeholder:text-[#6B7280] ${
                errors.file_url ? 'border-[#EF4444] focus:ring-[#EF4444]' : ''
              }`}
            />
            {errors.file_url && (
              <p className="text-xs text-[#EF4444] font-medium mt-0.5">{errors.file_url.message}</p>
            )}
          </div>

          {/* Remarks Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#171717]">Submission Remarks / Notes</label>
            <textarea
              {...register('remarks')}
              rows={3}
              placeholder="Add optional notes or comments for your mentor..."
              className="w-full bg-white border border-[#E9DDFE] text-[#171717] text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all placeholder:text-[#6B7280]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9DDFE]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs py-2 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="text-xs py-2 px-5 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit Task</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
