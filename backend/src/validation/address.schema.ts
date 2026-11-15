import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().trim().min(1).max(50).optional().default("Home"),
  recipientName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(20),
  line1: z.string().trim().min(1).max(255),
  line2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(1).max(100),
  districtId: z.string().uuid("Invalid district ID"),
  isDefault: z.boolean().optional().default(false),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
