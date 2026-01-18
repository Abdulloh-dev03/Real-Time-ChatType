import { useState } from "react";
import { useRef, useEffect } from "react";
import { User, Clock, AlertCircle } from "lucide-react";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import type { IMessage } from "../../types";
import { useAppSelector } from "../../app/hooks";
import { CONST } from "../../lib/constant";
import MessageContextMenu from "./messageContextMenu";
import {
  useCreateReactionMutation,
  useDeleteMessageMutation,
  useGetContactsQuery,
} from "../../features/api/apiSlice";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteMessageModal } from "./DeleteMessageModal";

interface ChatMessagesProps {
  messages: IMessage[];
  onEditMessage: (messageId: string, text: string) => void; // Added edit callback prop
}

export function ChatMessages({ messages, onEditMessage }: ChatMessagesProps) {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector((state) => state.auth.user);
  const { selectedUser } = useAppSelector((state) => state.chat);
  const { data: contacts = [] } = useGetContactsQuery();

  const [createReaction] = useCreateReactionMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    x: 0,
    y: 0,
    message: null as IMessage | null,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    message: null as IMessage | null,
  });

  // Track message count to only scroll on new messages
  const [lastMessageCount, setLastMessageCount] = useState(messages.length);

  const handleEditMessage = (msg: IMessage) => {
    onEditMessage(msg._id, msg.text ?? "");
    setContextMenu({ x: 0, y: 0, message: null });
  };

  const handleDeleteMessage = (msg: IMessage) => {
    if (!msg._id) {
      console.error("[v0] Cannot delete message without ID");
      return;
    }
    setDeleteModal({ isOpen: true, message: msg });
    setContextMenu({ x: 0, y: 0, message: null });
  };

  const handleConfirmDelete = async (
    messageId: string,
    deleteForBoth: boolean
  ) => {
    if (!messageId || !selectedUser?._id) {
      console.error(
        "[v0] Missing messageId or selectedUser for delete operation"
      );
      return;
    }

    try {
      await deleteMessage({
        messageId,
        deleteForBoth,
        receiverId: selectedUser._id,
      }).unwrap();
      setDeleteModal({ isOpen: false, message: null });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  useEffect(() => {
    if (messages.length > lastMessageCount) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage?.sender._id === currentUser?._id ||
        messages.length <= 5
      ) {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    setLastMessageCount(messages.length);
  }, [messages, lastMessageCount, currentUser?._id]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu({ x: 0, y: 0, message: null });
      }
    };

    const handleClickOutside = () => {
      setContextMenu({ x: 0, y: 0, message: null });
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, []);

  function renderStatusIcon(status: string) {
    switch (status) {
      case "SENDING":
        return <Clock className="w-4 h-4 text-gray-400 animate-pulse" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case CONST.SENT:
        return <IoCheckmark className="w-4 h-4 text-gray-400" />;
      case CONST.DELIVERED:
        return <IoCheckmarkDone className="w-4 h-4 text-gray-400" />;
      case CONST.READ:
        return <IoCheckmarkDone className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  }

  function openContextMenu(e: React.MouseEvent, msg: IMessage) {
    e.stopPropagation();

    if (chatContainerRef.current) {
      const rect = chatContainerRef.current.getBoundingClientRect();
      const contextMenuWidth = 200;
      const isMyMessage = msg.sender._id === currentUser?._id;
      const menuHeight = isMyMessage ? 150 : 100;

      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      if (x + contextMenuWidth > rect.width - 16) {
        x = rect.width - contextMenuWidth - 16;
      }

      if (y + menuHeight > rect.height - 16) {
        y = y - menuHeight - 16;
      }

      x = Math.max(16, x);
      y = Math.max(16, y);

      setContextMenu({ x, y, message: msg });
    }
  }

  return (
    <div className="px-4 py-12 space-y-6 relative flex flex-col flex-1">
      <div ref={chatContainerRef} className="flex-1 space-y-6">
        {messages.map((msg) => {
          const isMe = msg.sender._id === currentUser?._id;

          return (
            <div
              key={msg._id || msg.tempId}
              className={`flex ${
                isMe ? "justify-end" : "justify-start"
              } flex-1`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  {selectedUser?.profilePic ? (
                    <img
                      src={selectedUser.profilePic || "/placeholder.svg"}
                      alt={selectedUser.firstName || selectedUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
              )}

              <div className="max-w-xs lg:max-w-md relative">
                {msg.image ? (
                  <div
                    className="relative"
                    onClick={(e) => openContextMenu(e, msg)}
                  >
                    <img
                      src={msg.image || "/placeholder.svg"}
                      alt="Sent media"
                      className={`rounded-lg shadow-md max-w-full cursor-pointer ${
                        msg.status === "SENDING" ? "opacity-75" : ""
                      }`}
                    />
                    {msg.status === "SENDING" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-opacity-30 rounded-lg">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm cursor-pointer transition backdrop-blur-sm ${
                      msg.status === "FAILED"
                        ? "bg-red-500/80 text-white"
                        : "bg-white text-black dark:bg-black/30  dark:text-white"
                    } ${isMe ? "rounded-br-md" : "rounded-bl-md"}`}
                    onClick={(e) => openContextMenu(e, msg)}
                  >
                    {msg.text}
                  </div>
                )}

                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs opacity-75 text-gray-300 dark:text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe && msg.status && (
                    <span className="ml-1">{renderStatusIcon(msg.status)}</span>
                  )}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-2">
                      {Array.from(
                        msg.reactions.reduce((acc, r) => {
                          if (!acc.has(r.emoji)) acc.set(r.emoji, []);
                          acc.get(r.emoji)!.push(r.userId);
                          return acc;
                        }, new Map<string, string[]>())
                      ).map(([emoji, userIds]) => (
                        <motion.div
                          key={emoji}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="flex items-center space-x-1 px-1 py-1 bg-neutral-600 dark:bg-gray-800/50 rounded-full"
                        >
                          <span className="text-sm">{emoji}</span>
                          <div className="flex -space-x-1">
                            <AnimatePresence>
                              {userIds.map((_id) => {
                                const user =
                                  contacts.find((c) => c._id === _id) ||
                                  (currentUser?._id === _id
                                    ? currentUser
                                    : undefined);

                                return (
                                  <motion.img
                                    key={_id}
                                    src={user?.profilePic || "/user.jpg"}
                                    alt={user?.username || "User"}
                                    className="w-5 h-5 rounded-full cursor-pointer"
                                    initial={{ opacity: 0, scale: 0.6, y: -8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.6, y: -8 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 18,
                                      mass: 0.5,
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                  />
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Context Menu */}
      {contextMenu.message && (
        <MessageContextMenu
          ref={contextMenuRef}
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          isMyMessage={contextMenu.message.sender._id === currentUser?._id}
          onClose={() => setContextMenu({ x: 0, y: 0, message: null })}
          onReact={async (msg, emoji) => {
            try {
              await createReaction({
                messageId: msg._id,
                reaction: emoji,
              }).unwrap();
              setContextMenu({ x: 0, y: 0, message: null });
            } catch (error) {
              console.error("Failed to create reaction:", error);
            }
          }}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.message && deleteModal.message._id && (
        <DeleteMessageModal
          isOpen={deleteModal.isOpen}
          message={deleteModal.message}
          otherUserName={
            selectedUser?.firstName || selectedUser?.username || "User"
          }
          onClose={() => setDeleteModal({ isOpen: false, message: null })}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
