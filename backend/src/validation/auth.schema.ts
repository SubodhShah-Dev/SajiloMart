import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(255);

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z][a-z0-9_]{2,29}$/, "Username must start with a letter and contain only lowercase letters, numbers, and underscores (3-30 characters)");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: z.string().min(8).max(72),
  username: usernameSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z
      .string()
      .trim()
      .max(20)
      .regex(/^[+\d\s()-]*$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    username: usernameSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.phone !== undefined || data.username !== undefined, {
    message: "Provide at least one field to update",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
