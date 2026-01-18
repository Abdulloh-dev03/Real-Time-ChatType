import type { Server, Socket } from "socket.io";
import cookie from "cookie";
import type { IUser } from "#types/user.js";
import User from "#models/user.model.js";
import Message from "#models/messages.model.js";
import { CONST } from "#lib/constants.js";
import { jwttoken } from "#utils/jwt.js";

let ioInstance: Server | null = null;
const onlineUsers = new Map<string, Set<string>>();
// Map<socketId, contactId> to track which chat the user is currently looking at
const activeChats = new Map<string, string>();

export const getSocketId = (userId: string) => {
  const userSockets = onlineUsers.get(String(userId));
  return userSockets && userSockets.size > 0
    ? Array.from(userSockets)[0]
    : null;
};

const emitToUser = (userId: string, event: string, data: any) => {
  if (ioInstance) {
    ioInstance.to(String(userId)).emit(event, data);
  }
};

export const emitNewMessage = async (
  senderId: string,
  receiverId: string,
  newMessage: any,
) => {
  const payload = { newMessage };
  emitToUser(receiverId, "message:new", payload);
  emitToUser(senderId, "message:new", payload);

  // Check if receiver is online to mark as delivered
  const receiverSockets = onlineUsers.get(receiverId);
  if (receiverSockets && receiverSockets.size > 0) {
    await Message.findByIdAndUpdate(newMessage._id, {
      status: CONST.DELIVERED,
      deliveredAt: new Date(),
    });
    emitMessageDelivered(senderId, newMessage._id.toString());

    let isWatching = false;
    receiverSockets.forEach((sid) => {
      if (activeChats.get(sid) === String(senderId)) isWatching = true;
    });

    if (!isWatching) {
      emitToUser(receiverId, "notification:new", {
        message: newMessage,
        type: "message",
      });
    }
  }
};

export const emitNewContact = (receiverId: string, currentUser: IUser) => {
  emitToUser(receiverId, "getCreatedUser", currentUser);
};

export const emitMessageRead = (
  senderId: string,
  receiverId: string,
  readMessages: any[],
) => {
  emitToUser(senderId, "message:read", { readMessages, contactId: receiverId });
};

export const emitMessageDelivered = (senderId: string, messageId: string) => {
  emitToUser(senderId, "message:delivered", { messageId });
};

export const emitReactionUpdate = (
  senderId: string,
  receiverId: string,
  updatedMessage: any,
) => {
  const payload = { updateMessage: updatedMessage };
  emitToUser(senderId, "receiveReaction", payload);
  emitToUser(receiverId, "receiveReaction", payload);
};

export const emitMessageUpdate = (
  receiverId: string,
  senderId: string,
  updatedMessage: any,
) => {
  const payload = { updatedMessage, sender: senderId };
  emitToUser(receiverId, "getUpdatedMessage", payload);
  emitToUser(senderId, "getUpdatedMessage", payload);
};

export const emitMessageDelete = (
  receiverId: string,
  senderId: string,
  messageId: string,
) => {
  emitToUser(receiverId, "getDeletedMessage", {
    messageId,
    contactId: senderId,
  });
  emitToUser(senderId, "getDeletedMessage", {
    messageId,
    contactId: receiverId,
  });
};

export const emitContactDelete = (
  receiverId: string,
  deletedContactId: string,
  deletedContact: IUser,
) => {
  emitToUser(receiverId, "getDeletedContact", {
    deletedContactId,
    deletedContact,
  });
};

export const emitUserTyping = (receiverId: string, userId: string) => {
  emitToUser(receiverId, "userTyping", { userId, contactId: userId });
};

export const emitUserStoppedTyping = (receiverId: string, userId: string) => {
  emitToUser(receiverId, "userStoppedTyping", {
    userId,
    contactId: userId,
  });
};

export const initSocket = (io: Server) => {
  ioInstance = io;

  // JWT Authentication Middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Reuse HTTP JWT verification logic to keep payloads consistent
      const decoded = jwttoken.verify(token);
      const user = await User.findById(decoded._id).lean<IUser>();

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      if (!user.isVerified) {
        return next(new Error("Authentication error: User not verified"));
      }

      socket.data.user = user;
      next();
    } catch (_err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const user = socket.data.user as IUser;
    const userId = String(user._id);

    socket.join(userId);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // First socket for this user: update DB and broadcast online
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("user:online", { userId });
    }
    onlineUsers.get(userId)?.add(socket.id);

    // Send initial online list
    socket.emit(
      "getOnlineUsers",
      Array.from(onlineUsers.keys()).map((id) => ({ user: { _id: id } })),
    );

    // Track which chat the user is currently viewing
    socket.on("chat:join", ({ contactId }: { contactId: string }) => {
      activeChats.set(socket.id, contactId);
    });

    socket.on("chat:leave", () => {
      activeChats.delete(socket.id);
    });

    socket.on(
      "message:read",
      async ({
        contactId,
        messageIds,
      }: {
        contactId: string;
        messageIds: string[];
      }) => {
        const ids = messageIds.map((id) => id.toString());
        const now = new Date();
        await Message.updateMany(
          { _id: { $in: ids }, receiver: userId },
          { status: CONST.READ, readAt: now },
        );

        const readMessages = await Message.find({ _id: { $in: ids } }).lean();
        if (readMessages.length > 0) {
          emitMessageRead(contactId, userId, readMessages);
        }
      },
    );

    socket.on("startTyping", ({ contactId }: { contactId: string }) => {
      emitUserTyping(contactId, userId);
    });

    socket.on("stopTyping", ({ contactId }: { contactId: string }) => {
      emitUserStoppedTyping(contactId, userId);
    });

    socket.on("disconnect", async () => {
      activeChats.delete(socket.id);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Last socket for this user: update DB and broadcast offline
          const lastSeen = new Date();
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
          io.emit("user:offline", { userId, lastSeen });
        }
      }
    });
  });
};
