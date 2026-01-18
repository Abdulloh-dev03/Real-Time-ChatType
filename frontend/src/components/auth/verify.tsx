// Complete updated verify.tsx with proper navigation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Shield, ArrowRight } from "lucide-react";
import { useAppDispatch } from "../../app/hooks";
import { useState, useRef, useEffect } from "react";
import { message } from "antd"; // For better error handling

const verifySchema = z.object({
  code: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits"),
});

// ... imports
import { setUser } from "../../features/auth/authSlice";
import { useVerifyMutation } from "../../features/api/apiSlice";
import { getErrorMessage } from "../../utils/errorHandler";

// ...

export default function Verify() {
  const dispatch = useAppDispatch();
  // Remove unused selector if not needed for loading, or use hook status
  // const { status, error } = useAppSelector((state) => state.auth)

  // Using hook state instead
  const [verifyMutation, { isLoading, error }] = useVerifyMutation();

  // Get email from localStorage
  const [email] = useState<string>(localStorage.getItem("tempEmail") || "");
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  // Sync otpValues with form code value
  useEffect(() => {
    const code = otpValues.join("");
    form.setValue("code", code, { shouldValidate: code.length === 6 });
  }, [otpValues, form]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtpValues = [...otpValues];
        newOtpValues[index] = "";
        setOtpValues(newOtpValues);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length > 0) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newOtpValues[i] = pastedData[i] || "";
      }
      setOtpValues(newOtpValues);

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtpValues.findIndex((val) => val === "");
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    if (!email) {
      message.error("Email not found for verification");
      return;
    }

    try {
      // First verify the OTP
      const user = await verifyMutation({
        email: email,
        otp: data.code,
      }).unwrap();
      console.log("Backend returned user:", user);
      // Clear the temp email
      localStorage.removeItem("tempEmail");

      // Show success message
      message.success("Email verified successfully!");

      // Update user state which triggers App navigation
      dispatch(setUser(user));
    } catch (error) {
      // Error handled in UI via hook error or catch
      console.error("Verification failed:", error);
      // message.error handled by effect below if desired
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="p-6 rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        <div className="text-center mb-6 ">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Shield className="size-6 text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            We've sent a 6-digit verification code to your email address. Please
            enter it below.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {getErrorMessage(error, "Verification failed")}
              </p>
            </div>
          )}

          {/* OTP Input Fields */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Code
            </label>
            <div className="flex gap-2 justify-center">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-12 text-center text-xl font-mono rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-gray-500 ${
                    form.formState.errors.code
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  } dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder="0"
                />
              ))}
            </div>
            {/* Fixed height container for error message */}
            <div className="h-5 mt-1">
              {form.formState.errors.code && (
                <p className="text-sm text-red-500 text-center animate-in slide-in-from-top-1 duration-200">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otpValues.join("").length !== 6}
            className="group relative w-full flex justify-center items-center gap-2 px-4 py-3 mt-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-[#212121] hover:bg-gray-800 dark:hover:bg-gray-100 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-gray-900 border-t-transparent"></div>
                Verifying...
              </>
            ) : (
              <>
                Verify Code
                <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
