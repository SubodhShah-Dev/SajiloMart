import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().uuid("Invalid address ID"),
  paymentMethod: z.enum(["COD", "STRIPE"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
