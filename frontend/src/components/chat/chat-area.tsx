import { useEffect, useState } from "react";
import { X, User } from "lucide-react";
import Silk from "../background/Silk";
import Squares from "../background/Squares ";
import { useAppSelector } from "../../app/hooks";
import MessageInput from "./messageInput";
import { ChatHeader } from "./chatHeader";
import { ChatMessages } from "./ChatMessages";
import MessagesSkeleton from "./messages-skeleton";
import { DeleteContactModal } from "./DeleteContactModal";
import {
  useGetMessagesQuery,
  useCreateMessageMutation,
  useMessageReadMutation,
  useEditMessageMutation,
  useDeleteContactMutation,
} from "../../features/api/apiSlice";
// import type { IMessage } from "../../types" // Removed unused
import { CONST } from "../../lib/constant";

interface ChatAreaProps {
  theme: "light" | "dark";
  onBackToChatList: () => void;
  isMobile: boolean;
}

export function ChatArea({ theme, onBackToChatList, isMobile }: ChatAreaProps) {
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);
  const currentUser = useAppSelector((state) => state.auth.user);

  const { data: messages = [], isLoading: loading } = useGetMessagesQuery(
    selectedUser?._id || "",
    {
      skip: !selectedUser?._id,
    },
  );

  const [createMessage] = useCreateMessageMutation();
  const [messageRead] = useMessageReadMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteContact] = useDeleteContactMutation();

  const [showSidebar, setShowSidebar] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Remove getMessages dispatch effect

  useEffect(() => {
    if (messages.length > 0 && selectedUser?._id && currentUser?._id) {
      const unreadMessages = messages.filter(
        (msg) =>
          msg.sender._id === selectedUser._id && msg.status !== CONST.READ,
      );

      if (unreadMessages.length > 0) {
        // dispatch(markMessagesAsReadOptimistic({ messageIds })) // Handling via API invalidation
        messageRead({ messages: unreadMessages });
      }
    }
  }, [messages, selectedUser, currentUser, messageRead]);

  const handleSendText = async (text: string, editingId?: string) => {
    if (editingId) {
      try {
        await editMessage({ messageId: editingId, text }).unwrap();
        setEditingMessageId(null);
        setEditingText("");
      } catch (error) {
        console.error("Error editing message:", error);
      }
    } else if (selectedUser?._id && currentUser && text.trim()) {
      const tempId = `temp_${Date.now()}_${Math.random()}`;

      try {
        const formData = new FormData();
        formData.append("receiver", selectedUser._id);
        formData.append("text", text.trim());
        formData.append("tempId", tempId);

        await createMessage(formData).unwrap();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleSendImage = async (file: File) => {
    if (selectedUser?._id && currentUser) {
      const tempId = `temp_${Date.now()}_${Math.random()}`;

      try {
        const formData = new FormData();
        formData.append("receiver", selectedUser._id);
        formData.append("file", file);
        formData.append("tempId", tempId);

        await createMessage(formData).unwrap();
      } catch (error) {
        console.error("Error sending image:", error);
      }
    }
  };

  const handleEditMessage = (messageId: string, text: string) => {
    setEditingMessageId(messageId);
    setEditingText(text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleDeleteContact = async () => {
    if (selectedUser?._id) {
      try {
        await deleteContact(selectedUser._id).unwrap();
        onBackToChatList();
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0f0f0f] p-4">
        <div className="text-center text-gray-600 dark:text-gray-400 mb-6">
          <div className="w-32 h-32 mx-auto mb-6">
            <img
              src="/chaticons.png"
              alt="Light Chat Icon"
              className="block dark:hidden"
            />
            <img
              src="/chaticon.png"
              alt="Dark Chat Icon"
              className="hidden dark:block"
            />
          </div>
          <h2 className="text-xl font-medium mb-2">
            Select a chat to start messaging
          </h2>
          <p className="text-md font-medium mb-2">or add your contact</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-screen relative">
      <div className="flex-1 flex flex-col">
        <ChatHeader
          fullName={
            `${selectedUser?.firstName || ""} ${
              selectedUser?.lastName || ""
            }`.trim() ||
            selectedUser?.username ||
            ""
          }
          username={selectedUser?.username || ""}
          isMobile={isMobile}
          onBack={onBackToChatList}
          onMenuClick={() => setShowSidebar(!showSidebar)}
        />

        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0">
            {theme === "dark" ? (
              <Silk
                speed={5}
                scale={1}
                color="#7B7481"
                noiseIntensity={1.5}
                rotation={0}
              />
            ) : (
              <Squares
                speed={0.5}
                squareSize={40}
                direction="diagonal"
                borderColor="#e5e7eb"
              />
            )}
          </div>
          <div className="relative z-10 h-full">
            {loading ? (
              <MessagesSkeleton />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="mb-4">
                  {selectedUser.profilePic ? (
                    <img
                      src={
                        selectedUser.profilePic ||
                        "/placeholder.svg?height=80&width=80&query=user avatar"
                      }
                      alt={selectedUser.firstName || selectedUser.username}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600 mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto">
                      <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {`${selectedUser.firstName || ""} ${
                    selectedUser.lastName || ""
                  }`.trim() || selectedUser.username}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {selectedUser.username}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                  <ChatMessages
                    messages={messages}
                    onEditMessage={handleEditMessage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <MessageInput
          onSendText={handleSendText}
          onSendImage={handleSendImage}
          onCancel={handleCancelEdit}
          editingMessageId={editingMessageId || undefined}
          initialText={editingText}
        />
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-[300px] md:w-[350px] backdrop-blur-md bg-white/10 dark:bg-black/10 border-l border-white/20 dark:border-white/10 shadow-lg z-50 transition-transform duration-300 ease-in-out ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setShowSidebar(false)}
          className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center mt-6 mb-6 px-6">
          {selectedUser.profilePic ? (
            <img
              src={
                selectedUser.profilePic ||
                "/placeholder.svg?height=80&width=80&query=user profile"
              }
              alt="User avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-zinc-600"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-2 border-gray-300 dark:border-zinc-600">
              <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <h2 className="text-lg font-semibold mt-2 text-gray-800 dark:text-white text-center">
            {`${selectedUser.firstName || ""} ${
              selectedUser.lastName || ""
            }`.trim() || selectedUser.username}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {selectedUser.username}
          </p>
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            {selectedUser.bio}
          </p>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2 px-4">
          Shared Media
        </div>
        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-64 pr-4 px-4">
          {messages.filter((msg) => msg.image).length > 0 ? (
            messages
              .filter((msg) => msg.image)
              .map((img) => (
                <img
                  key={img._id}
                  src={
                    img.image ||
                    "/placeholder.svg?height=80&width=80&query=shared image"
                  }
                  alt="shared"
                  className="w-20 h-20 object-cover rounded-md"
                />
              ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-500 px-4">
              No shared images yet
            </p>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete Contact
          </button>
        </div>
      </div>

      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 z-40"
        />
      )}

      <DeleteContactModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteContact}
        contactName={
          `${selectedUser?.firstName || ""} ${
            selectedUser?.lastName || ""
          }`.trim() ||
          selectedUser?.username ||
          ""
        }
        isDark={theme === "dark"}
      />
    </div>
  );
}
