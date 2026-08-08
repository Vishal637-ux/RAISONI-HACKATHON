import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9]{10}$/, 'Phone number must contain exactly 10 digits'),
  rollNumber: z
    .string()
    .min(1, 'Roll number is required'),
  department: z
    .string()
    .min(1, 'Please select or enter department'),
  year: z
    .string()
    .min(1, 'Academic year is required'),
  semester: z
    .string()
    .min(1, 'Semester is required'),
  cgpa: z
    .string()
    .min(1, 'CGPA is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 10;
    }, { message: 'CGPA must be a valid number between 0.00 and 10.00' }),
  skills: z
    .string()
    .optional()
    .nullable(),
  linkedinUrl: z
    .string()
    .optional()
    .nullable(),
  githubUrl: z
    .string()
    .optional()
    .nullable(),
});
