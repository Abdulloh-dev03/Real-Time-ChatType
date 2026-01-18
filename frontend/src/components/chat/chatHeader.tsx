import { ArrowLeft, MoreVertical } from "lucide-react";
import { useAppSelector } from "../../app/hooks";
import { useGetContactsQuery } from "../../features/api/apiSlice";

interface ChatHeaderProps {
  fullName: string;
  onBack?: () => void;
  isMobile: boolean;
  onMenuClick: () => void;
}

export function ChatHeader({
  fullName,
  onBack,
  isMobile,
  onMenuClick,
}: ChatHeaderProps) {
  const { data: contacts = [] } = useGetContactsQuery();
  const typingUsers = useAppSelector((state) => state.typing.typingUsers);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);

  const contact = contacts.find((c) => c._id === selectedUser?._id);
  const isOnline = contact?.isOnline;
  const lastSeen = contact?.lastSeen;

  const isTyping = selectedUser?._id && typingUsers[selectedUser._id];

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return "last seen recently";
    const date = new Date(dateString);
    return `last seen at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-[#3a3a3a] flex items-center gap-4">
      {isMobile && onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-white">
          {fullName}
        </h3>

        {isTyping ? (
          <p className="text-xs text-blue-500 font-medium animate-pulse">
            ● typing...
          </p>
        ) : isOnline ? (
          <p className="text-xs text-green-500 font-medium">● Online</p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            ● {formatLastSeen(lastSeen)}
          </p>
        )}
      </div>

      <button
        onClick={onMenuClick}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition cursor-pointer"
      >
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
}
