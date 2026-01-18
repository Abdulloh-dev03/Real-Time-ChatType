import { useState } from "react";
import { X, Plus, User } from "lucide-react";
import { useCreateContactMutation } from "../features/api/apiSlice";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export function AddContactModal({
  isOpen,
  onClose,
  isDark = false,
}: AddContactModalProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [createContact, { isLoading }] = useCreateContactMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      try {
        await createContact({ username: usernameInput.trim() }).unwrap();
        setUsernameInput("");
        onClose();
      } catch (error) {
        // Error is handled by the Redux state
        console.error("Failed to add contact:", error);
      }
    }
  };

  const handleClose = () => {
    setUsernameInput("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 p-6 rounded-xl shadow-xl border transition-all ${
          isDark
            ? "bg-neutral-900 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Plus className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold">Add New Contact</h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter #username"
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isLoading}
              />
              <User
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!usernameInput.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 cursor-pointer text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Contact
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div
          className={`mt-4 p-3 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <p
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            💡 Enter the username with or without the # symbol. The contact will
            be added to your chat list once found.
          </p>
        </div>
      </div>
    </div>
  );
}
