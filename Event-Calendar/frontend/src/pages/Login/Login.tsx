import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginUser } from "../../services/auth.service";
import { AppContext } from "../../state/app.context";
import { ILoginFormInputs } from "../../types/app.types";

/**
 * Login page component
 *
 * Allows users to sign in using email and password credentials.
 * Uses Firebase Authentication and sets the authenticated user in AppContext.
 * Displays relevant validation and error messages.
 *
 * @returns Rendered login form
 */
const Login: React.FC = () => {
  const { setAppState } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginFormInputs>();

  const onSubmit = async (data: ILoginFormInputs) => {
    setLoginError(null);
    try {
      const { user, userData } = await loginUser(data.email, data.password);
      setAppState((prev) => ({
        ...prev,
        user,
        userData,
      }));
      navigate(location.state?.from?.pathname || "/");
    } catch (error: any) {
      console.error("Login failed:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setLoginError("Invalid email or password.");
      } else if (error.code === "auth/too-many-requests") {
        setLoginError("Too many failed attempts. Try again later.");
      } else {
        setLoginError("An unexpected error occurred during login.");
      }
    }
  };

  return (
    <div className="mt-10 mx-auto bg-gray-100 max-w-md">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login
        </h2>

        {loginError && (
          <p className="text-red-500 text-sm text-center mb-4">{loginError}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label htmlFor="email" className="label-base">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="input-base"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label-base">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="input-base"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              })}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
