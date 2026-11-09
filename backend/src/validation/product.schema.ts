import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const productQuerySchema = z
  .object({
    category: z.string().trim().min(1).optional(),
    search: z.string().trim().min(1).optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(1).max(5).optional(),
    inStockOnly: booleanString.optional(),
    sort: z
      .enum(["price_asc", "price_desc", "rating", "newest", "bestselling"])
      .default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    (value) =>
      value.priceMin === undefined ||
      value.priceMax === undefined ||
      value.priceMin <= value.priceMax,
    {
      message: "priceMin must be less than or equal to priceMax",
      path: ["priceMin"],
    },
  );

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
