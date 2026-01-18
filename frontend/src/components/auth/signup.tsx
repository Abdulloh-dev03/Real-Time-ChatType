import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../lib/validation";
import { Mail, Send, User } from "lucide-react";
import type z from "zod";
import { useAppDispatch } from "../../app/hooks";

import { useEffect } from "react";
import { message } from "antd";
import { setStep } from "../../features/auth/authSlice";
import { useLoginMutation } from "../../features/api/apiSlice";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../utils/errorHandler";

export default function SignUp() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      username: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    localStorage.setItem("tempEmail", data.email);
    try {
      await login(data).unwrap();
      dispatch(setStep("verify"));
    } catch (err) {
      // Error handled in useEffect via error status or locally
      console.error(err);
    }
  };

  useEffect(() => {
    if (error) {
      // RTK Query error is usually { status, data: { message: ... } } or similar
      // getErrorMessage utility handles unknown types
      message.error(getErrorMessage(error, "Login failed"));
    }
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto p-6  rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="username"
              {...form.register("username")}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-gray-500 ${
                form.formState.errors.username
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              } dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="email"
              placeholder="you@example.com"
              {...form.register("email")}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-gray-500 ${
                form.formState.errors.email
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              } dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center items-center gap-2 px-4 py-3 mt-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-[#212121] hover:bg-gray-800 dark:hover:bg-gray-100 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-gray-900 border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            <>
              Submit
              <Send className="size-4 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/sign-in")}
            className="text-gray-900 dark:text-white font-semibold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}
