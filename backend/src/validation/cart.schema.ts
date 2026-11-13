import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive().max(99).optional().default(1),
});

export const updateQtySchema = z.object({
  quantity: z.number().int().positive().max(99),
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateQtyInput = z.infer<typeof updateQtySchema>;