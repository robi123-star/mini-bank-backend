import { z } from 'zod';

export const reportValidationSchema = z.object({
  start_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: 'Invalid start date format. Use YYYY-MM-DD.' }
    ),
  end_date: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: 'Invalid end date format. Use YYYY-MM-DD.' }
    ),
});
