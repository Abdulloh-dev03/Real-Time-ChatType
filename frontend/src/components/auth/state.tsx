import SignIn from "./signin";
import SignUp from "./signup";
import Verify from "./verify";
import { useAppSelector } from "../../app/hooks";

export default function StateAuth() {
  const { step, mode } = useAppSelector((state) => state.auth);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
              step === "login"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            1
          </div>
          <div
            className={`w-12 h-0.5 transition-all duration-200 ${
              step === "verify"
                ? "bg-gray-900 dark:bg-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
              step === "verify"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-8 px-4">
        <span
          className={
            step === "login" ? "text-gray-900 dark:text-white font-medium" : ""
          }
        >
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </span>
        <span
          className={
            step === "verify" ? "text-gray-900 dark:text-white font-medium" : ""
          }
        >
          Verify
        </span>
      </div>

      {/* Content */}
      <div className="transition-all duration-300 ease-in-out">
        {step === "login" && (mode === "signin" ? <SignIn /> : <SignUp />)}
        {step === "verify" && <Verify />}
      </div>
    </div>
  );
}
