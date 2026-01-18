// src/hooks/useSocket.ts
import { useEffect } from "react";
import { socket } from "../lib/socket";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setUserTyping,
  setUserStoppedTyping,
} from "../features/chat/typingSlice";
import { apiSlice } from "../features/api/apiSlice";
import type { IMessage } from "../types";

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      if (selectedUser?._id) {
        socket.emit("chat:join", { contactId: selectedUser._id });
      }
    });

    // Handle user presence real-time
    socket.on("user:online", ({ userId }: { userId: string }) => {
      dispatch(
        apiSlice.util.updateQueryData("getContacts", undefined, (draft) => {
          const contact = draft.find((c) => c._id === userId);
          if (contact) contact.isOnline = true;
        }),
      );
    });

    socket.on(
      "user:offline",
      ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
        dispatch(
          apiSlice.util.updateQueryData("getContacts", undefined, (draft) => {
            const contact = draft.find((c) => c._id === userId);
            if (contact) {
              contact.isOnline = false;
              contact.lastSeen = lastSeen;
            }
          }),
        );
      },
    );

    // New message received
    socket.on("message:new", ({ newMessage }: { newMessage: IMessage }) => {
      console.log("📩 New message via socket:", newMessage);
      const isMine = newMessage.sender._id === authUser?._id;
      const contactId = isMine
        ? newMessage.receiver._id
        : newMessage.sender._id;

      // 1. Update Messages Cache
      dispatch(
        apiSlice.util.updateQueryData("getMessages", contactId, (draft) => {
          if (!draft.find((m) => m._id === newMessage._id)) {
            draft.push(newMessage);
          }
        }),
      );

      // 2. Update Contacts Cache (Last Message + Unread Count)
      dispatch(
        apiSlice.util.updateQueryData("getContacts", undefined, (draft) => {
          const contact = draft.find((c) => c._id === contactId);
          if (contact) {
            contact.lastMessage = newMessage;
            // Increment unread count if it's not from me and I'm not in this chat
            if (!isMine && selectedUser?._id !== contactId) {
              contact.unreadCount = (contact.unreadCount || 0) + 1;
            }
          }
        }),
      );

      // 3. Mark as read immediately if chat is open
      if (!isMine && selectedUser?._id === contactId) {
        socket.emit("message:read", {
          contactId,
          messageIds: [newMessage._id],
        });
      }
    });

    socket.on("message:delivered", ({ messageId }: { messageId: string }) => {
      // Find which chat this message belongs to (might need to iterate or rely on active)
      dispatch(
        apiSlice.util.updateQueryData(
          "getMessages",
          selectedUser?._id as string,
          (draft) => {
            const msg = draft.find((m) => m._id === messageId);
            if (msg) msg.status = "DELIVERED";
          },
        ),
      );
    });

    socket.on(
      "message:read",
      ({
        readMessages,
        contactId,
      }: {
        readMessages: IMessage[];
        contactId: string;
      }) => {
        dispatch(
          apiSlice.util.updateQueryData("getMessages", contactId, (draft) => {
            readMessages.forEach((rm) => {
              const msg = draft.find((m) => m._id === rm._id);
              if (msg) {
                msg.status = "READ";
                msg.readAt = rm.readAt;
              }
            });
          }),
        );
      },
    );

    socket.on("notification:new", (data: any) => {
      // Sound/Toast trigger would go here
      console.log("🔔 Notification received:", data);
    });

    // ... (keep other listeners but update naming if needed)
    socket.on(
      "receiveReaction",
      ({ updateMessage }: { updateMessage: IMessage }) => {
        const contactId =
          updateMessage.sender._id === authUser?._id
            ? updateMessage.receiver._id
            : updateMessage.sender._id;
        dispatch(
          apiSlice.util.updateQueryData("getMessages", contactId, (draft) => {
            const msg = draft.find((m) => m._id === updateMessage._id);
            if (msg) msg.reactions = updateMessage.reactions;
          }),
        );
      },
    );

    socket.on(
      "getUpdatedMessage",
      ({ updatedMessage }: { updatedMessage: IMessage }) => {
        const contactId =
          updatedMessage.sender._id === authUser?._id
            ? updatedMessage.receiver._id
            : updatedMessage.sender._id;
        dispatch(
          apiSlice.util.updateQueryData("getMessages", contactId, (draft) => {
            const msg = draft.find((m) => m._id === updatedMessage._id);
            if (msg) msg.text = updatedMessage.text;
          }),
        );
      },
    );

    socket.on(
      "getDeletedMessage",
      ({ messageId, contactId }: { messageId: string; contactId: string }) => {
        dispatch(
          apiSlice.util.updateQueryData("getMessages", contactId, (draft) => {
            return draft.filter((m) => m._id !== messageId);
          }),
        );
        dispatch(apiSlice.util.invalidateTags(["Contacts"]));
      },
    );

    socket.on(
      "userTyping",
      ({ userId, contactId }: { userId: string; contactId: string }) => {
        dispatch(setUserTyping({ userId, contactId }));
      },
    );

    socket.on(
      "userStoppedTyping",
      ({ userId, contactId }: { userId: string; contactId: string }) => {
        dispatch(setUserStoppedTyping({ userId, contactId }));
      },
    );

    return () => {
      socket.off("connect");
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("message:new");
      socket.off("message:delivered");
      socket.off("message:read");
      socket.off("notification:new");
      socket.off("receiveReaction");
      socket.off("getUpdatedMessage");
      socket.off("getDeletedMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [dispatch, selectedUser?._id, authUser?._id]);

  useEffect(() => {
    if (selectedUser?._id) {
      socket.emit("chat:join", { contactId: selectedUser._id });
    }
    return () => {
      socket.emit("chat:leave");
    };
  }, [selectedUser?._id]);
};
