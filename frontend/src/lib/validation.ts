import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address, please check and try again." }),
  username: z.string().min(1, { message: "Username is required." }),
});

export const verifySchema = z.object({
  code: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits"),
});

export const signInSchema = z.object({
  identifier: z.string().min(3, { message: "Email or username is required." }),
});
