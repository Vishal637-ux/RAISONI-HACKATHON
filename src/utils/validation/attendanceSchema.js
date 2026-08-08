import { z } from 'zod';

export const attendanceSchema = z.object({
  attendance_date: z
    .string()
    .min(1, 'Please select an attendance date')
    .refine((dateStr) => {
      if (!dateStr) return false;
      const selected = new Date(dateStr);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return selected <= today;
    }, 'Attendance date cannot be in the future'),
  status: z.enum(['Present', 'Absent', 'Leave'], {
    required_error: 'Please select an attendance status',
    invalid_type_error: 'Please select a valid status (Present, Absent, or Leave)',
  }),
});
