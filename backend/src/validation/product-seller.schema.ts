import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(5000).optional(),
  price: z.coerce.number().min(0.01).max(999999.99),
  category: z.string().trim().min(1).max(100),
  imageUrl: z.string().url().max(500).optional().or(z.literal("")),
  thumbnailUrl: z.string().url().max(500).optional().or(z.literal("")),
  totalStock: z.coerce.number().int().min(0).max(999999).default(0),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(5000).optional(),
    price: z.coerce.number().min(0.01).max(999999.99).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    imageUrl: z.string().url().max(500).optional().or(z.literal("")),
    thumbnailUrl: z.string().url().max(500).optional().or(z.literal("")),
    totalStock: z.coerce.number().int().min(0).max(999999).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const sellerProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["active", "draft", "removed", "all"]).default("all"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type SellerProductQueryInput = z.infer<typeof sellerProductQuerySchema>;