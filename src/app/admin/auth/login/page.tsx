'use client';

import { handleLogin } from "@/app/lib/actions";
import { useActionState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation in app directory
import { useEffect } from "react";
import PasswordManagerIndicator from "@/app/components/PasswordManagerIndicator";

export default function Login() {
  const initialState = { message: null, success: null }; // Define initial state
  const [login, formAction] = useActionState(handleLogin, initialState);

  const router = useRouter();

  useEffect(() => {
    if (login?.success) {
      router.push("/admin/blog");
    }
  }, [login?.success, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        action={formAction}
        className="w-full max-w-md p-6 bg-white rounded shadow-md"
      >
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Login
        </h1>

        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Enter your username"
          required
          className="w-full p-2 mt-1 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter your password"
          required
          className="w-full p-2 mt-1 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>

        {login.message && (
          <p
            className={`mt-4 text-sm ${
              login.success ? "text-teal-500" : "text-red-500"
            }`}
          >
            {login.message}
          </p>
        )}
        <PasswordManagerIndicator /> {/* React receives the expected component. No more hydration errors. */}
        
        <p className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account?{" "}
          <a
            href="/admin/auth/signup"
            className="text-blue-500 hover:underline hover:text-blue-600"
          >
            Create account
          </a>
        </p>
      </form>
    </div>
  );
}
