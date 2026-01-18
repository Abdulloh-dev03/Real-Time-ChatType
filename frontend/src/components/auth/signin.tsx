import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "../../lib/validation";
import { LogIn, User } from "lucide-react";
import type z from "zod";
import { useAppDispatch } from "../../app/hooks";
import { useEffect } from "react";
import { message } from "antd";
import { setStep } from "../../features/auth/authSlice";
import { useSignInMutation } from "../../features/api/apiSlice";
import { getErrorMessage } from "../../utils/errorHandler";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [signIn, { isLoading, error }] = useSignInMutation();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      const result = await signIn(data).unwrap();
      // If successful sign-in (verified user)
      if (result) {
        navigate("/");
      }
    } catch (err) {
      const errorData = err as {
        status?: number;
        data?: { code?: string; email?: string };
      };
      if (errorData.status === 403 && errorData.data?.code === "NOT_VERIFIED") {
        localStorage.setItem("tempEmail", errorData.data.email || "");
        dispatch(setStep("verify"));
      } else if (errorData.status === 404) {
        message.error("Account not found");
      } else {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (error) {
      const err = error as { status?: number };
      if (err.status !== 403 && err.status !== 404) {
        message.error(getErrorMessage(error, "Sign in failed"));
      }
    }
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Identifier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email or Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="email or username"
              {...form.register("identifier")}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 outline-none focus:ring-2 focus:ring-gray-500 ${
                form.formState.errors.identifier
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              } dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            />
          </div>
          {form.formState.errors.identifier && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.identifier.message}
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
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <LogIn className="size-4 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/sign-up")}
            className="text-gray-900 dark:text-white font-semibold hover:underline cursor-pointer"
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}
