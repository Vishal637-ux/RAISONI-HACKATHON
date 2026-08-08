import { z } from 'zod';

export const workLogSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required.')
    .refine((val) => val.trim().length > 0, 'Description is required.'),
});
