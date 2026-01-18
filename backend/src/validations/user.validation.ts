import { z } from "zod";
import { Types } from "mongoose";

const objectIdString = z
  .string()
  .min(1)
  .refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
  });

export const createContactSchema = z.object({
  username: z.string().min(1).trim(),
});

export const createMessageSchema = z.object({
  receiver: objectIdString,
  text: z.string().trim().optional(),
});

export const messageReadSchema = z.object({
  messages: z
    .array(
      z.object({
        _id: objectIdString,
      }),
    )
    .nonempty(),
});

export const reactionSchema = z.object({
  messageId: objectIdString,
  reaction: z.string().min(1),
});

export const sendOtpEmailSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const updateProfileSchema = z
  .object({
    username: z.string().min(3).max(30).optional(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
  })
  .strict();

export const updateMessageSchema = z.object({
  text: z.string().min(1),
});

export const updateEmailSchema = z.object({
  email: z.string().email().toLowerCase(),
  otp: z.string().length(6),
});

export const deleteContactParamsSchema = z.object({
  contactId: objectIdString,
});

export const messageIdParamsSchema = z.object({
  messageId: objectIdString,
});
