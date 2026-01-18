import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { LogOut, Plus, Sun, Moon } from "lucide-react";
import { useLogoutMutation } from "../features/api/apiSlice";
import { AddContactModal } from "./AddContactModal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export function Sidebar({ isOpen, onClose, theme, toggleTheme }: SidebarProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleAddContactClick = () => {
    setShowAddModal(true);
    onClose(); // Close sidebar when opening modal
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div
        className={`absolute top-20 left-6 z-50 w-64 p-4 
          rounded-xl shadow-lg backdrop-blur-xl border 
          border-white/10 bg-white/80 dark:bg-black/40 
          transition-all duration-300 ease-in-out 
          ${
            isOpen
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0 pointer-events-none"
          }`}
      >
        <ul className="flex flex-col gap-4 text-sm font-medium text-gray-800 dark:text-white">
          {/* Profile */}
          <NavLink
            to="/profile"
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-200/40 dark:hover:bg-white/10 px-2 py-2 rounded-md"
          >
            <img
              src={user?.profilePic || "/user.jpg"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
            <span>{user?.firstName || "User"}</span>
          </NavLink>

          {/* Add Contact */}
          <li
            onClick={handleAddContactClick}
            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-200/40 dark:hover:bg-white/10 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <div className="flex-1 flex items-center justify-between">
              <span>Add Contacts</span>
            </div>
          </li>

          {/* Theme Toggle */}
          <li
            onClick={toggleTheme}
            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-200/40 dark:hover:bg-white/10 cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </li>

          {/* Logout */}
          <li
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-400/10 text-red-500 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </li>
        </ul>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        isDark={theme === "dark"}
      />
    </>
  );
}
