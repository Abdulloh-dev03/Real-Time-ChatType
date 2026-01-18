import Message from "#models/messages.model.js";
import type { IUser } from "#types/user.js";
import { Types } from "mongoose";
import { CONST } from "#lib/constants.js";
import {
  emitMessageDelete,
  emitMessageDelivered,
  emitMessageRead,
  emitMessageUpdate,
  emitNewMessage,
  emitReactionUpdate,
} from "#socket/socket.js";
import { uploadToCloudinary } from "#utils/cloudinary.js";

export async function markMessageAsDelivered(
  messageId: string,
  senderId: string,
) {
  await Message.findByIdAndUpdate(messageId, {
    status: CONST.DELIVERED,
    deliveredAt: new Date(),
  });
  emitMessageDelivered(senderId, messageId);
}

export async function getMessagesForContact(
  userId: Types.ObjectId | string,
  contactId: Types.ObjectId | string,
) {
  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: contactId },
      { sender: contactId, receiver: userId },
    ],
  })
    .populate({ path: "sender", select: "email username" })
    .populate({ path: "receiver", select: "email username" })
    .sort({ createdAt: 1 });

  await Message.updateMany(
    { sender: contactId, receiver: userId, status: { $ne: CONST.READ } },
    { status: CONST.READ, readAt: new Date() },
  );

  return messages;
}

export async function createMessageForUser(options: {
  senderId: Types.ObjectId | string;
  receiverId: Types.ObjectId | string;
  text?: string;
  imageBuffer?: Buffer;
}) {
  const { senderId, receiverId, text, imageBuffer } = options;

  const messageData: any = {
    sender: senderId,
    receiver: receiverId,
    text: text || undefined,
  };

  if (imageBuffer) {
    const result = await uploadToCloudinary(imageBuffer, "messages");
    messageData.image = result.secure_url;
  }

  const newMessage = await Message.create(messageData);
  const currentMessage = await Message.findById(newMessage._id)
    .populate({ path: "sender", select: "email username profilePic" })
    .populate({ path: "receiver", select: "email username profilePic" });

  if (currentMessage) {
    emitNewMessage(String(senderId), String(receiverId), currentMessage);
  }

  return currentMessage;
}

export async function markMessagesRead(
  currentUserId: Types.ObjectId | string,
  messages: { _id: string }[],
) {
  const ids = messages.map((m) => new Types.ObjectId(m._id));
  const now = new Date();

  await Message.updateMany(
    { _id: { $in: ids } },
    { status: CONST.READ, readAt: now },
  );

  const updatedMessages = await Message.find({ _id: { $in: ids } })
    .populate({ path: "sender", select: "email username" })
    .populate({ path: "receiver", select: "email username" });

  if (updatedMessages.length > 0 && updatedMessages[0]?.sender?._id) {
    const senderId = updatedMessages[0].sender._id.toString();
    const receiverId = updatedMessages[0].receiver._id.toString();
    if (senderId !== String(currentUserId)) {
      emitMessageRead(senderId, receiverId, updatedMessages);
    }
  }

  return updatedMessages;
}

export async function addReactionToMessage(
  userId: Types.ObjectId | string,
  messageId: Types.ObjectId | string,
  reaction: string,
) {
  await Message.findByIdAndUpdate(messageId, {
    $pull: { reactions: { userId } },
  });

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    { $push: { reactions: { userId, emoji: reaction } } },
    { new: true },
  ).populate("sender receiver");

  if (!updatedMessage) return null;

  const senderId = updatedMessage.sender._id.toString();
  const receiverId = updatedMessage.receiver._id.toString();

  emitReactionUpdate(senderId, receiverId, updatedMessage);

  return updatedMessage;
}

export async function updateMessageText(
  user: IUser,
  messageId: Types.ObjectId | string,
  text: string,
) {
  const message = await Message.findById(messageId)
    .populate({ path: "sender", select: "email username profilePic" })
    .populate({ path: "receiver", select: "email username profilePic" });

  if (!message) return { code: "NOT_FOUND" as const };

  if (String(message.sender._id) !== String(user._id)) {
    return { code: "FORBIDDEN" as const };
  }

  message.text = text;
  await message.save();

  const receiverId = message.receiver._id.toString();
  const senderId = message.sender._id.toString();

  emitMessageUpdate(receiverId, senderId, message);

  return { code: "OK" as const, message };
}

export async function deleteMessageForUser(
  user: IUser,
  messageId: Types.ObjectId | string,
) {
  const messageToDelete = await Message.findById(messageId)
    .populate({ path: "sender", select: "_id" })
    .populate({ path: "receiver", select: "_id" });

  if (!messageToDelete) {
    return { code: "NOT_FOUND" as const };
  }

  if (String(messageToDelete.sender._id) !== String(user._id)) {
    return { code: "FORBIDDEN" as const };
  }

  await Message.findByIdAndDelete(messageId);

  const receiverId = messageToDelete.receiver._id.toString();
  const senderId = messageToDelete.sender._id.toString();

  emitMessageDelete(receiverId, senderId, String(messageId));

  return { code: "OK" as const };
}
