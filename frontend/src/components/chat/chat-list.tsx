import { Menu, Search, User } from "lucide-react";
import { useGetContactsQuery, apiSlice } from "../../features/api/apiSlice";
import { useEffect, useMemo, useState, useCallback } from "react";
import { message } from "antd";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import type { IUser } from "../../types";
import { setSelectedUser } from "../../features/chat/chatSlice";
import { AddContactModal } from "../AddContactModal";
import { sliceText } from "../../utils/sliceText";

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  onMenuClick: () => void;
  isDark: boolean;
}

export function ChatList({ onSelectChat, onMenuClick, isDark }: ChatListProps) {
  const dispatch = useAppDispatch();

  // Use RTK Query hook
  const {
    data: contacts = [],
    isLoading: loading,
    error,
  } = useGetContactsQuery();

  const typingUsers = useAppSelector((state) => state.typing.usersTypingToMe);
  const [showAddModal, setShowAddModal] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (error) {
      messageApi.error({
        content: error,
        duration: 4,
        style: { marginTop: "10vh" },
      });
    }
  }, [error, messageApi]);

  const handleSelect = useCallback(
    (user: IUser) => {
      dispatch(setSelectedUser(user));
      onSelectChat(user._id.toString());
      // Clear unread count in cache
      dispatch(
        apiSlice.util.updateQueryData("getContacts", undefined, (draft) => {
          const contact = draft.find((c) => c._id === user._id);
          if (contact) {
            contact.unreadCount = 0;
          }
        }),
      );
    },
    [dispatch, onSelectChat],
  );

  const filteredContacts = useMemo(() => {
    return contacts
      .filter((contact) => {
        const q = query.toLowerCase();
        return (
          contact.firstName?.toLowerCase().includes(q) ||
          contact.username?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if ((a.unreadCount || 0) > (b.unreadCount || 0)) return -1;
        if ((a.unreadCount || 0) < (b.unreadCount || 0)) return 1;
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return (a.firstName ?? "").localeCompare(b.firstName ?? "");
      });
  }, [contacts, query]);

  const getWrapperClass = (isOnline: boolean) =>
    `
      animate-rotate-border transition-all duration-500 ease-out
      transform-3d hover:rotate-x-40 hover:rotate-z-3 hover:scale-[1.03]
      bg-conic/[from_var(--border-angle)]
      ${
        isOnline
          ? "from-white via-emerald-400 to-white dark:from-black dark:via-green-500 dark:to-black from-10% via-90% to-80%"
          : "from-gray-50 via-zinc-800 to-zinc-700 dark:from-black dark:via-gray-100 dark:to-black from-70% via-90% to-10%"
      }
      rounded-lg p-px mb-2
    `;

  return (
    <>
      {contextHolder}
      <div
        className={`w-full flex flex-col border-r h-screen ${
          isDark ? "border-zinc-700" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b ${
            isDark ? "border-[#3a3a3a]" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onMenuClick}
              className={`p-2 rounded-full cursor-pointer ${
                isDark ? "hover:bg-[#3a3a3a]" : "hover:bg-gray-100"
              }`}
            >
              <Menu
                className={`w-6 h-6  ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
                  isDark
                    ? "bg-[#3a3a3a] text-white placeholder-gray-400"
                    : "bg-gray-100 text-gray-900 placeholder-gray-500"
                }`}
              />
              <Search
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-400">
                Loading contacts...
              </span>
            </div>
          ) : contacts && contacts.length > 0 ? (
            <div className="p-2">
              {filteredContacts.map((contact) => {
                const isOnline = contact.isOnline;
                const isTyping = typingUsers[contact._id];

                return (
                  <div
                    key={contact._id}
                    className={getWrapperClass(!!isOnline)}
                  >
                    <div
                      onClick={() => handleSelect(contact)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        isDark
                          ? "bg-neutral-900 text-white"
                          : "bg-white text-gray-900 border border-gray-300"
                      }`}
                    >
                      {/* Profile Image */}
                      <div className="relative">
                        {contact.profilePic ? (
                          <img
                            src={contact.profilePic || "/placeholder.svg"}
                            alt={contact.firstName || contact.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isDark ? "bg-gray-600" : "bg-gray-300"
                            }`}
                          >
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                            {contact.firstName || "No Name"}
                          </h3>
                          {contact.unreadCount && contact.unreadCount > 0 ? (
                            <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {contact.unreadCount}
                            </span>
                          ) : null}
                        </div>

                        {isTyping ? (
                          <span className="inline-block mt-1 text-xs font-medium text-blue-500 animate-pulse">
                            typing...
                          </span>
                        ) : contact.lastMessage ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs font-medium text-gray-500 truncate flex-1">
                              {sliceText(contact.lastMessage.text ?? "", 20)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {contact.lastMessage.createdAt
                                ? new Date(
                                    contact.lastMessage.createdAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-block mt-1 text-xs font-medium text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                            No message yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center">
              <div className="mb-4">
                <User
                  className={`w-16 h-16 mx-auto ${
                    isDark ? "text-gray-600" : "text-gray-400"
                  }`}
                />
              </div>
              <p className="text-sm text-gray-400 mb-2">No contacts yet</p>
              <p className="text-xs text-gray-500 mb-4">
                Add contacts to start chatting
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-neutral-700 cursor-pointer transition-colors text-sm font-medium"
              >
                Add Your First Contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        isDark={isDark}
      />
    </>
  );
}
