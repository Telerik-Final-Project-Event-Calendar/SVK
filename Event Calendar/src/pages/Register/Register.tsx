import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { registerUser } from "../../services/auth.service";
import { AppContext } from "../../state/app.context";
import { IRegisterFormInputs } from "../../types/app.types";

const Register: React.FC = () => {
  const { setAppState } = useContext(AppContext);
  const navigate = useNavigate();
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IRegisterFormInputs>();

  const password = watch("password");

  const onSubmit = async (data: IRegisterFormInputs) => {
    setRegistrationError(null);
    if (data.password !== data.confirmPassword) {
      setRegistrationError("Passwords do not match.");
      return;
    }

    try {
      const { user, userData } = await registerUser(data);
      setAppState((prev) => ({
        ...prev,
        user,
        userData,
      }));
      navigate("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setRegistrationError(
        err.message || "Unexpected error during registration."
      );
    }
  };

  return (
    <div className="mt-10 mx-auto bg-gray-100 max-w-md">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Register
        </h2>

        {registrationError && (
          <p className="text-red-500 text-sm text-center mb-4">
            {registrationError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label-base">Username</label>
            <input
              {...register("handle", {
                required: "Username is required",
                minLength: { value: 3, message: "Minimum 3 characters" },
                maxLength: { value: 30, message: "Maximum 30 characters" },
              })}
              placeholder="Unique username"
              className="input-base"
            />
            {errors.handle && (
              <p className="error-text">{errors.handle.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="label-base">First Name</label>
            <input
              {...register("firstName", {
                required: "First name is required",
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: "Only letters allowed",
                },
                maxLength: { value: 30, message: "Max 30 characters" },
              })}
              placeholder="John"
              className="input-base"
            />
            {errors.firstName && (
              <p className="error-text">{errors.firstName.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="label-base">Last Name</label>
            <input
              {...register("lastName", {
                required: "Last name is required",
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: "Only letters allowed",
                },
                maxLength: { value: 30, message: "Max 30 characters" },
              })}
              placeholder="Doe"
              className="input-base"
            />
            {errors.lastName && (
              <p className="error-text">{errors.lastName.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="label-base">Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              placeholder="your@email.com"
              className="input-base"
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="label-base">Phone</label>
            <input
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Phone must be exactly 10 digits",
                },
              })}
              placeholder="1234567890"
              className="input-base"
            />
            {errors.phone && (
              <p className="error-text">{errors.phone.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="label-base">Address (optional)</label>
            <input
              {...register("address")}
              placeholder="Your address"
              className="input-base"
            />
          </div>

          <div className="form-group">
            <label className="label-base">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
                pattern: {
                  value: /^(?=.*[0-9])(?=.*[!-@#$%^&*])/,
                  message: "Must include number and special character",
                },
              })}
              className="input-base"
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="label-base">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="input-base"
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
