import StateAuth from "../components/auth/state";
import { FaGoogle } from "react-icons/fa";
import { RiTelegram2Fill } from "react-icons/ri";
import { Moon, Sun } from "lucide-react";
import { useLocation, useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useCallback, useEffect } from "react";
import { setMode, setStep } from "../features/auth/authSlice";

interface ThemeContext {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function Login() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { theme, toggleTheme } = useOutletContext<ThemeContext>();
  const step = useAppSelector((state) => state.auth.step);

  useEffect(() => {
    if (location.pathname === "/sign-in") {
      dispatch(setMode("signin"));
      dispatch(setStep("login"));
    } else if (location.pathname === "/sign-up") {
      dispatch(setMode("signup"));
      dispatch(setStep("login"));
    }
  }, [location.pathname, dispatch]);
  const GOOGLE_LOGIN = import.meta.env.VITE_API_URL;

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${GOOGLE_LOGIN}/api/oauth/google`;
  }, [GOOGLE_LOGIN]);

  return (
    <div className="flex flex-col items-center justify-center p-4 transition-colors">
      {/* Header */}
      <header className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 dark:bg-white rounded-2xl mb-4 shadow-lg">
          <RiTelegram2Fill
            size={48}
            className="text-white dark:text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2 justify-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ChatType
          </h1>
          {/* Theme Toggle */}
          <div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 text-sm leading-relaxed my-3">
          Your thoughts. Your friends. Your type of chat.
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md">
        <StateAuth />
      </main>

      {/* Footer */}
      <footer className="mt-4 w-full max-w-md">
        {step !== "verify" && (
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 bg-white dark:bg-[#212121] cursor-pointer"
            >
              <FaGoogle className="text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200" />
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
