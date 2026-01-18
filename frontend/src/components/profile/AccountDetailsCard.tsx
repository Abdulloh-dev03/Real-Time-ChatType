import { useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import {
  useSendOtpMutation,
  useUpdateEmailMutation,
} from "../../features/api/apiSlice";
import { message } from "antd";

export default function AccountDetailsCard() {
  const { user } = useAppSelector((state) => state.auth);
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [updateEmail, { isLoading: isUpdatingEmail }] =
    useUpdateEmailMutation();

  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  // isVerifying local state replaced by isUpdatingEmail

  useEffect(() => {
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [user]);

  if (!user) return null;

  const handleOtpChange = (value: string, index: number) => {
    if (!otpSent) return;

    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Handle backspace to focus previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };

  const handleSendOtp = async () => {
    if (!isEmailValid || !isEmailChanged) return;

    try {
      await sendOtp({ email: newEmail }).unwrap();
      message.success("6-digital code sent to your email");
      setOtpSent(true);
      setOtp(Array(6).fill(""));

      setTimeout(() => {
        const firstInput = document.getElementById("otp-0");
        if (firstInput) (firstInput as HTMLInputElement).focus();
      }, 100);
    } catch (error: unknown) {
      console.error("Error sending OTP:", error);
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to send code";
      message.error(errorMessage);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const otpCode = otp.join("");
      await updateEmail({ email: newEmail, otp: otpCode }).unwrap();
      message.success("Email updated successfully!");
      setOtpSent(false);
    } catch (err: unknown) {
      console.error("Error verifying OTP:", err);
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Verification failed";
      message.error(errorMessage);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(paste)) return; // Only allow exactly 6 digits

    const digits = paste.split("").slice(0, 6);
    setOtp(digits);

    // Auto-focus last digit
    const lastInput = document.getElementById(`otp-${digits.length - 1}`);
    if (lastInput) (lastInput as HTMLInputElement).focus();
  };

  const isEmailValid =
    newEmail && newEmail.includes("@") && newEmail.includes(".");
  const isEmailChanged = newEmail !== user.email;
  const isOtpComplete = otp.every((digit) => digit !== "");
  const canSendOtp = isEmailValid && isEmailChanged && !otpSent;
  const canVerify = isOtpComplete && otpSent && !isUpdatingEmail;

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 sm:p-6 bg-white dark:bg-zinc-900">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
        Account Details
      </h3>

      <div className="space-y-4 sm:space-y-6">
        {/* Email Section */}
        <div>
          <label className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email Address
          </label>
          <input
            type="email"
            disabled={otpSent}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 outline-none focus:ring-1 focus:ring-white focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
        </div>

        {/* OTP Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Verification Code
            </label>
            {otpSent && (
              <button
                onClick={() => {
                  setOtpSent(false);
                  setOtp(Array(6).fill(""));
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Change Email
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* OTP Inputs */}
            <div className="flex gap-1.5 sm:gap-2 justify-center sm:justify-start">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  disabled={!otpSent}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold rounded-xl border transition-all duration-200 ${
                    otpSent
                      ? "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-transparent"
                      : "bg-zinc-100 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                  }`}
                />
              ))}
            </div>

            {/* Action Button */}
            {canSendOtp ? (
              <button
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-zinc-600 hover:bg-neutral-800 active:bg-zinc-700 disabled:bg-zinc-400 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            ) : canVerify ? (
              <button
                onClick={handleVerifyOtp}
                disabled={isUpdatingEmail}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-zinc-600 hover:bg-neutral-800 active:bg-zinc-700 disabled:bg-zinc-400 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdatingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </button>
            ) : null}
          </div>

          {/* Helper Text */}
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {!otpSent
              ? isEmailValid && isEmailChanged
                ? "Click 'Submit' to receive a verification code"
                : !isEmailValid
                ? "Please enter a valid email address"
                : "Email is already verified"
              : "Enter the 6-digit code sent to your email"}
          </div>
        </div>
      </div>
    </div>
  );
}
