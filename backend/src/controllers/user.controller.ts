import type { Request, Response } from "express";
import { Types } from "mongoose";
import logger from "#config/logger.js";
import type { IUser } from "#types/user.js";
import {
  createContactForUser,
  deleteContactForUser,
  getContactsWithMeta,
  sendOtpForNewEmail,
  updateUserEmail,
  updateUserProfile,
  deleteUserAccount,
} from "#services/user.service.js";
import {
  addReactionToMessage,
  createMessageForUser,
  deleteMessageForUser,
  getMessagesForContact,
  markMessagesRead,
  updateMessageText,
} from "#services/message.service.js";
import {
  createContactSchema,
  createMessageSchema,
  deleteContactParamsSchema,
  messageIdParamsSchema,
  messageReadSchema,
  reactionSchema,
  sendOtpEmailSchema,
  updateEmailSchema,
  updateMessageSchema,
  updateProfileSchema,
} from "#validations/user.validation.js";

// GET /api/user/contacts
export const getContacts = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUser | undefined)?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const contactsWithLastMessage = await getContactsWithMeta(userId);

    if (!contactsWithLastMessage) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Contacts retrieved successfully",
      contacts: contactsWithLastMessage,
    });
  } catch (error) {
    logger.error("Get contacts error", { error });
    return res.status(500).json({ message: "Failed to retrieve contacts" });
  }
};

// GET /api/user/messages/:contactId
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUser | undefined)?._id;
    const { contactId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    const messages = await getMessagesForContact(userId, contactId);

    return res.status(200).json({
      message: "Messages retrieved successfully",
      messages,
    });
  } catch (error) {
    logger.error("Get messages error", { error });
    return res.status(500).json({ message: "Failed to retrieve messages" });
  }
};

// POST /api/user/message
export const createMessage = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Support both 'receiver' and 'contactId' from body
    // Multer might have populated req.body with strings if it was FormData
    const receiver = req.body.receiver || req.body.contactId;
    const text = req.body.text;

    if (!receiver) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    if (!text && !req.file) {
      return res.status(400).json({
        message: "Message must contain either text or an image",
      });
    }

    // Validate receiver is a valid ObjectId
    if (!Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({ message: "Invalid Receiver ID" });
    }

    const created = await createMessageForUser({
      senderId: user._id,
      receiverId: receiver,
      text,
      imageBuffer: req.file?.buffer,
    });

    if (!created) {
      return res.status(500).json({ message: "Failed to create message" });
    }

    return res.status(201).json({
      message: "Message created successfully",
      newMessage: created,
    });
  } catch (error) {
    logger.error("Create message error", { error });
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/user/message-read
export const messageRead = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const parsed = messageReadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid message read payload" });
    }

    const updated = await markMessagesRead(user._id, parsed.data.messages);

    return res.status(200).json({
      message: "Message read successfully",
      messages: updated,
    });
  } catch (error) {
    logger.error("Message read error", { error });
    return res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

// POST /api/user/contact
export const createContact = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid contact payload" });
    }

    const result = await createContactForUser(user._id, parsed.data.username);

    if (result.code === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    if (result.code === "CONTACT_NOT_FOUND") {
      return res.status(404).json({
        message: "User with this username does not exist.",
      });
    }
    if (result.code === "SELF_CONTACT") {
      return res
        .status(400)
        .json({ message: "You cannot add yourself as a contact." });
    }
    if (result.code === "ALREADY_CONTACT") {
      return res.status(400).json({
        message: "This user is already in your contact list.",
      });
    }

    return res.status(200).json({
      message: "Contact added successfully",
      contact: result.contact,
    });
  } catch (error) {
    logger.error("Create contact error", { error });
    return res.status(500).json({ message: "Failed to add contact" });
  }
};

// POST /api/user/reaction
export const createReaction = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const parsed = reactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid reaction payload" });
    }

    const updatedMessage = await addReactionToMessage(
      user._id,
      parsed.data.messageId,
      parsed.data.reaction,
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json({
      message: "Reaction added successfully",
      updatedMessage,
      messageId: parsed.data.messageId,
      userId: user._id,
      reaction: parsed.data.reaction,
    });
  } catch (error) {
    logger.error("Create reaction error", { error });
    return res.status(500).json({ message: "Failed to add reaction" });
  }
};

// POST /api/user/send-otp
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const parsed = sendOtpEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const result = await sendOtpForNewEmail(parsed.data.email);
    if (result.code === "EMAIL_TAKEN") {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    return res
      .status(200)
      .json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    logger.error("Send OTP error", { error });
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid profile payload" });
    }

    const payload: any = { ...parsed.data };

    if (payload.username) {
      const normalizedUsername = payload.username.startsWith("#")
        ? payload.username
        : `#${payload.username}`;
      payload.username = normalizedUsername;
    }

    // Handle optional profile image upload (multer already validated file type/size)
    if (req.file) {
      // Defer to Cloudinary via service-style logic
      const cloudinary = (await import("#utils/cloudinary.js")).default;
      const stream = cloudinary.uploader.upload_stream(
        async (error, result) => {
          if (error) {
            logger.error("Cloudinary upload error", { error });
            return res.status(500).json({ message: "Image upload failed" });
          }

          if (result?.secure_url) {
            payload.profilePic = result.secure_url;

            await updateUserProfile(user._id, payload);
            return res
              .status(200)
              .json({ message: "Profile updated successfully" });
          }
        },
      );

      stream.end(req.file.buffer);
      return; // Response handled in callback
    }

    await updateUserProfile(user._id, payload);
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    logger.error("Update profile error", { error });
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

// PUT /api/user/message/:messageId
export const updateMessage = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const paramsParsed = messageIdParamsSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const bodyParsed = updateMessageSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ message: "Invalid message payload" });
    }

    const result = await updateMessageText(
      user,
      paramsParsed.data.messageId,
      bodyParsed.data.text,
    );

    if (result.code === "NOT_FOUND") {
      return res.status(404).json({ message: "Message not found" });
    }
    if (result.code === "FORBIDDEN") {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this message" });
    }

    return res.status(200).json({
      message: "Message updated successfully",
      updatedMessage: result.message,
    });
  } catch (error) {
    logger.error("Update message error", { error });
    return res.status(500).json({ message: "Failed to update message" });
  }
};

// PUT /api/user/email
export const updateEmail = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const parsed = updateEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid email/OTP payload" });
    }

    const isValid = await (
      await import("#services/mail.service.js")
    ).default.verifyOtp(parsed.data.email, parsed.data.otp);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const updated = await updateUserEmail(user._id, parsed.data.email);

    return res.status(200).json({
      message: "Email updated successfully",
      user: updated,
    });
  } catch (error) {
    logger.error("Update email error", { error });
    return res.status(500).json({ message: "Failed to update email" });
  }
};

// DELETE /api/user/delete
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const deleted = await deleteUserAccount(user._id);

    return res.status(200).json({
      message: "User deleted successfully",
      user: deleted,
    });
  } catch (error) {
    logger.error("Delete user error", { error });
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

// DELETE /api/user/message/:messageId
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const paramsParsed = messageIdParamsSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const result = await deleteMessageForUser(
      user,
      paramsParsed.data.messageId,
    );

    if (result.code === "NOT_FOUND") {
      return res.status(404).json({ message: "Message not found" });
    }
    if (result.code === "FORBIDDEN") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this message" });
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    logger.error("Delete message error", { error });
    return res.status(500).json({ message: "Failed to delete message" });
  }
};

// DELETE /api/user/contact/:contactId
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user?._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const parsed = deleteContactParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    const contactObjectId = new Types.ObjectId(parsed.data.contactId);

    const result = await deleteContactForUser(user._id, contactObjectId);

    if (result.code === "NOT_FOUND") {
      return res.status(404).json({ message: "User or contact not found" });
    }
    if (result.code === "NOT_IN_CONTACTS") {
      return res.status(404).json({
        message: "Contact not found in your contact list",
      });
    }

    // Emit contact deletion events via socket service return payload
    const { userObj, contactObj } = result;

    const { emitContactDelete } = await import("#socket/socket.js");
    emitContactDelete(user._id.toString(), parsed.data.contactId, contactObj);
    emitContactDelete(parsed.data.contactId, user._id.toString(), userObj);

    return res.status(200).json({
      message: "Contact and all messages deleted successfully",
      deletedContactId: parsed.data.contactId,
    });
  } catch (error) {
    logger.error("Delete contact error", { error });
    return res.status(500).json({ message: "Failed to delete contact" });
  }
};
