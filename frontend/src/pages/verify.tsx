import Verify from "../components/auth/verify";
import { RiTelegram2Fill } from "react-icons/ri";

export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[80vh]">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 dark:bg-white rounded-2xl mb-4 shadow-lg">
          <RiTelegram2Fill
            size={48}
            className="text-white dark:text-gray-900"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Your Account
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please enter the code sent to your email.
        </p>
      </header>
      <main className="w-full max-w-md">
        <Verify />
      </main>
    </div>
  );
}
