import User from "#models/user.model.js";
import Message from "#models/messages.model.js";
import type { IUser } from "#types/user.js";
import { Types } from "mongoose";
import { CONST } from "#lib/constants.js";
import mailService from "#services/mail.service.js";

export async function getContactsWithMeta(userId: Types.ObjectId | string) {
  const user = await User.findById(userId).populate({
    path: "contacts",
    select:
      "username firstName lastName profilePic email bio isOnline lastSeen",
  });

  if (!user) {
    return null;
  }

  const contacts = user.contacts as any[];

  const contactsWithLastMessage = await Promise.all(
    contacts.map(async (contact: any) => {
      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, receiver: contact._id },
          { sender: contact._id, receiver: userId },
        ],
      })
        .populate({ path: "sender", select: "username" })
        .populate({ path: "receiver", select: "username" })
        .sort({ createdAt: -1 })
        .lean();

      const unreadCount = await Message.countDocuments({
        sender: contact._id,
        receiver: userId,
        status: { $ne: CONST.READ },
      });

      return {
        ...contact.toObject(),
        lastMessage: lastMsg,
        unreadCount,
      };
    }),
  );

  return contactsWithLastMessage;
}

export async function createContactForUser(
  userId: Types.ObjectId | string,
  username: string,
) {
  const user = await User.findById(userId);
  if (!user) return { code: "USER_NOT_FOUND" as const };

  const searchUsername = username.startsWith("#") ? username : `#${username}`;
  const contact = await User.findOne({ username: searchUsername });

  if (!contact) {
    return { code: "CONTACT_NOT_FOUND" as const };
  }

  if (user.username === contact.username) {
    return { code: "SELF_CONTACT" as const };
  }

  const existingContact = await User.findOne({
    _id: userId,
    contacts: contact._id,
  });
  if (existingContact) {
    return { code: "ALREADY_CONTACT" as const };
  }

  await User.findByIdAndUpdate(userId, { $push: { contacts: contact._id } });
  await User.findByIdAndUpdate(contact._id, { $push: { contacts: userId } });

  const addedContact = await User.findById(contact._id).select(
    "username firstName lastName profilePic email",
  );

  return { code: "OK" as const, contact: addedContact };
}

export async function sendOtpForNewEmail(email: string) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { code: "EMAIL_TAKEN" as const };
  }

  await mailService.sendOtp(email);
  return { code: "OK" as const };
}

export async function updateUserProfile(
  userId: Types.ObjectId | string,
  payload: Partial<IUser>,
) {
  // Username normalization and uniqueness is handled at controller/validation level.
  const updated = await User.findByIdAndUpdate(userId, payload, { new: true });
  return updated;
}

export async function updateUserEmail(
  userId: Types.ObjectId | string,
  email: string,
) {
  const user = await User.findByIdAndUpdate(userId, { email }, { new: true });
  return user;
}

export async function deleteUserAccount(userId: Types.ObjectId | string) {
  const deleted = await User.findByIdAndDelete(userId);
  return deleted;
}

export async function deleteContactForUser(
  userId: Types.ObjectId | string,
  contactId: Types.ObjectId,
) {
  const user = await User.findById(userId);
  const contact = await User.findById(contactId);

  if (!user || !contact) {
    return { code: "NOT_FOUND" as const };
  }

  if (!user.contacts.includes(contactId)) {
    return { code: "NOT_IN_CONTACTS" as const };
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { contacts: contactId },
  });
  await User.findByIdAndUpdate(contactId, {
    $pull: { contacts: userId },
  });

  await Message.deleteMany({
    $or: [
      { sender: userId, receiver: contactId },
      { sender: contactId, receiver: userId },
    ],
  });

  const userObj = {
    ...user.toObject(),
    bio: user.bio || undefined,
    googleId: user.googleId || undefined,
  };
  const contactObj = {
    ...contact.toObject(),
    bio: contact.bio || undefined,
    googleId: contact.googleId || undefined,
  };

  return { code: "OK" as const, userObj, contactObj };
}
