import { z } from 'zod';

export const createCustomerSchema = z.object({
  fullName: z.string().min(1),
  address: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD'),
  nik: z.string().min(1),
});

export const updateCustomerSchema = createCustomerSchema.partial();
