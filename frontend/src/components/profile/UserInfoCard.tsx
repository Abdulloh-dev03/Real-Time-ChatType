import { Mail, User, Pencil, Calendar, Loader2 } from "lucide-react";
import { useAppSelector } from "../../app/hooks";
import { useDeleteUserMutation } from "../../features/api/apiSlice";
import { Modal } from "antd";

interface Props {
  onEditClick: () => void;
  isEditing: boolean;
}

export default function UserInfoCard({ onEditClick, isEditing }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  if (!user) return null;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const displayName = fullName || "Unnamed User";
  const username = user.username ? `${user.username}` : "unknown";
  const joinDate = user.createdAt;
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Delete Account",
      content:
        "Are you sure you want to permanently delete your account? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await deleteUser().unwrap();
          window.location.replace("/login");
        } catch (error) {
          console.error("Failed to delete account:", error);
        }
      },
    });
  };

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 dark:from-blue-950/20 dark:to-purple-950/20"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Profile Information
          </h3>
          <div
            className={`animate-rotate-border transition-all duration-500 ease-out transform-3d hover:rotate-x-40 hover:rotate-z-3 rounded-lg cursor-pointer hover:scale-[1.03] bg-conic/[from_var(--border-angle)]
    ${
      isEditing
        ? "dark:from-black dark:via-blue-500 dark:to-black"
        : "dark:from-black dark:via-green-500 dark:to-black"
    }
    from-10% via-90% to-80% p-px`}
          >
            <button
              onClick={onEditClick}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium
      transition-all duration-200 cursor-pointer
      ${
        isEditing
          ? " dark:text-white/50 rounded-lg dark:bg-neutral-900 border dark:border-neutral-800 text-center "
          : " dark:text-white/50 rounded-lg dark:bg-neutral-900 border dark:border-neutral-800 text-center "
      }
      `}
            >
              <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4 sm:mb-6">
          {/* Avatar */}
          <div className="relative self-center sm:self-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
              {user.profilePic ? (
                <img
                  src={user.profilePic || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-500 dark:text-zinc-400" />
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-1 break-words">
                {displayName}
              </h2>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 break-words">
                {username}
              </p>
            </div>

            {user.bio && (
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2 break-words">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase break-words">
              Email — Update in Account Details
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-white break-all">
              {user.email}
            </p>
          </div>
        </div>

        {/* Additional Info Row */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-3">
          {joinDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="truncate">
                Joined{" "}
                {new Date(joinDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Active now
            </span>
          </div>
        </div>

        <hr className="w-full my-4 dark:text-neutral-600" />
        <div className="flex justify-center sm:justify-end">
          <div className="animate-rotate-border transition-all duration-500 ease-out transform-3d hover:rotate-x-40 hover:rotate-z-3 rounded-lg hover:scale-[1.03] bg-conic/[from_var(--border-angle)] dark:from-black dark:via-red-500 dark:to-black from-20% via-90% to-100% p-px">
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg cursor-pointer dark:text-white/50 dark:bg-neutral-900 border dark:border dark:border-neutral-800 text-sm flex items-center gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isDeleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
