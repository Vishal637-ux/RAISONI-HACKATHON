import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { attendanceSchema } from '../../utils/validation/attendanceSchema';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Calendar, Send, CheckCircle2 } from 'lucide-react';

export const AttendanceSubmissionCard = ({ onSubmitAttendance, isSubmitting = false, activeInternship }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      attendance_date: todayStr,
      status: 'Present',
    },
  });

  const handleFormSubmit = async (data) => {
    const success = await onSubmitAttendance(data);
    if (success) {
      reset({
        attendance_date: todayStr,
        status: 'Present',
      });
    }
  };

  const validMinDate = (activeInternship?.startDate && activeInternship.startDate <= todayStr) ? activeInternship.startDate : undefined;

  return (
    <Card className="bg-white border border-[#E9DDFE] p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E9DDFE] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#F3EDFF] text-[#A874F7]">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#171717]">Submit Daily Attendance</h3>
            <p className="text-xs text-[#6B7280]">
              Log your daily attendance for {activeInternship?.companyName || 'your active internship'}.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        {/* Attendance Date */}
        <div>
          <Input
            label="Attendance Date"
            type="date"
            required
            max={todayStr}
            min={validMinDate}
            error={errors.attendance_date?.message}
            {...register('attendance_date')}
          />
        </div>

        {/* Attendance Status Selection */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#171717]">
            Attendance Status <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#6B7280] pointer-events-none">
              <CheckCircle2 size={18} />
            </div>
            <select
              {...register('status')}
              className={`w-full bg-white border border-[#E9DDFE] text-[#171717] text-sm rounded-xl py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 focus:ring-[#A874F7] focus:border-transparent transition-all duration-200 ${
                errors.status ? 'border-[#EF4444] focus:ring-[#EF4444]' : ''
              }`}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
          {errors.status && (
            <p className="text-xs text-[#EF4444] font-medium mt-0.5">{errors.status.message}</p>
          )}
        </div>

        {/* Submit Button (Disabled while submitting to prevent double-clicks) */}
        <div>
          <Button
            type="submit"
            variant="primary"
            className="w-full gap-2"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            <Send size={16} />
            Submit Attendance
          </Button>
        </div>
      </form>
    </Card>
  );
};
