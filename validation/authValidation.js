import { z } from "zod";

const SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9\s]/;

export const credentialsSchema = z.object({
  email: z
    .email("Enter a valid email address")
    .trim()
    .toLowerCase()
    .max(254, "Enter a valid email address"),
  password: z
    .string({ message: "Password must be at least 12 characters" })
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase character")
    .regex(
      SPECIAL_CHARACTER_PATTERN,
      "Password must contain at least one special character",
    )
    .refine(
      (password) => Buffer.byteLength(password, "utf8") <= 72,
      "Password must be at most 72 bytes",
    ),
});

export const getValidationMessage = (error) =>
  error.issues[0]?.message ?? "Invalid credentials";
