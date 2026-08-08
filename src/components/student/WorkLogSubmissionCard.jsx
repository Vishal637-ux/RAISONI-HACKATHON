import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workLogSchema } from '../../utils/validation/workLogSchema';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { FileText, Send } from 'lucide-react';

export const WorkLogSubmissionCard = ({ onSubmitWorkLog, isSubmitting = false, activeInternship }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workLogSchema),
    defaultValues: {
      description: '',
    },
  });

  const handleFormSubmit = async (data) => {
    const success = await onSubmitWorkLog(data);
    if (success) {
      reset({ description: '' });
    }
  };

  return (
    <Card className="bg-white border border-[#E9DDFE] p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#171717]">Submit Daily / Weekly Work Log</h3>
            <p className="text-xs text-[#6B7280]">
              Log completed work, progress, and daily activities for {activeInternship?.companyName || 'your internship'}.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#171717]">
            Work Log Description <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Describe your work activities, progress, completed tasks, or weekly accomplishments..."
            className={`w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all duration-200 placeholder:text-[#6B7280] ${
              errors.description ? 'border-[#EF4444] focus:ring-[#EF4444]' : ''
            }`}
          />
          {errors.description && (
            <p className="text-xs text-[#EF4444] font-medium mt-0.5">{errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="gap-2 px-6"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            <Send size={16} />
            Submit Work Log
          </Button>
        </div>
      </form>
    </Card>
  );
};
