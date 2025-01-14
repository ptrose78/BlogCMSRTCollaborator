import { handleSignup } from "@/app/lib/actions";

export default async function Signup() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        action={handleSignup}
        className="w-full max-w-sm p-6 bg-white rounded shadow-md"
      >
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Create Account
        </h1>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mt-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Enter your username"
          required
          className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mt-4">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter your password"
          required
          className="w-full p-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          type="submit"
          className="w-full mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
