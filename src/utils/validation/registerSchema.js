import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  rollNumber: z
    .string()
    .min(1, 'Roll number is required'),
  department: z
    .string()
    .min(1, 'Please select a department'),
  year: z
    .string()
    .min(1, 'Please select academic year'),
  semester: z
    .string()
    .min(1, 'Please select current semester'),
  cgpa: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 10;
    }, { message: 'CGPA must be a valid number between 0.00 and 10.00' }),
  skills: z
    .string()
    .optional(),
  linkedinUrl: z
    .string()
    .optional(),
  githubUrl: z
    .string()
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
