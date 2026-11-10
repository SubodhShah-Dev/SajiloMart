import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().trim().min(3).max(150),
  description: z.string().trim().min(20).max(2000),
  category: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).regex(/^[+\d\s()-]*$/, "Please enter a valid phone number").optional().or(z.literal("")),
  returnPolicy: z.string().trim().max(2000).optional().or(z.literal("")),
  shippingPolicy: z.string().trim().max(2000).optional().or(z.literal("")),
  logoUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export const updateStoreSchema = z
  .object({
    name: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(20).max(2000).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    phone: z.string().trim().max(20).regex(/^[+\d\s()-]*$/, "Please enter a valid phone number").optional().or(z.literal("")),
    returnPolicy: z.string().trim().max(2000).optional().or(z.literal("")),
    shippingPolicy: z.string().trim().max(2000).optional().or(z.literal("")),
    logoUrl: z.string().url().max(500).optional().or(z.literal("")),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const adminVerifyStoreSchema = z.object({
  listingLimit: z.coerce.number().int().positive().nullable().optional(),
});

export const adminRejectStoreSchema = z.object({
  reason: z.string().trim().min(10).max(500),
});

export const adminSuspendStoreSchema = z.object({
  reason: z.string().trim().min(10).max(500),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type AdminVerifyStoreInput = z.infer<typeof adminVerifyStoreSchema>;
export type AdminRejectStoreInput = z.infer<typeof adminRejectStoreSchema>;
export type AdminSuspendStoreInput = z.infer<typeof adminSuspendStoreSchema>;