import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z.string().min(3).max(30),
});

export const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
  otp: z.string().length(6),
});

export const signInSchema = z.object({
  identifier: z.string().min(3).max(50),
});
