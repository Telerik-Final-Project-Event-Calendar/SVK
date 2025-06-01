import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { sendPasswordReset } from "../../services/auth.service";
import { Link } from "react-router-dom";

interface IForgotPasswordInputs {
  email: string;
}

/**
 * ForgotPassword component
 *
 * This component allows users to request a password reset link by entering their email.
 * Uses Firebase authentication and react-hook-form for validation.
 *
 * @component
 *
 * @example
 * <ForgotPassword />
 *
 * @returns Rendered forgot password form
 */
const ForgotPassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordInputs>();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: IForgotPasswordInputs) => {
    setMessage(null);
    setError(null);
    try {
      await sendPasswordReset(data.email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      console.error("Error sending password reset email:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    }
  };

  return (
    <div className="mt-20 mx-auto bg-gray-100 max-w-md">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Forgot Password
        </h2>
        <p className="text-center text-sm text-gray-600 mb-4">
          Enter your email address to receive a password reset link.
        </p>

        {message && (
          <p className="text-green-600 text-sm text-center mb-2">{message}</p>
        )}
        {error && (
          <p className="text-red-500 text-sm text-center mb-2">{error}</p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4">
          <div className="form-group">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Send Reset Link
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
