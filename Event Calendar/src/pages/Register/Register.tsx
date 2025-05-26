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
      const user = await registerUser(data);
      setAppState((prev) => ({ ...prev, user }));
      navigate("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setRegistrationError(
        err.message || "Unexpected error during registration."
      );
    }
  };

  // return (
  //   <div className="register-container">
  //     <div className="register-form">
  //       <h2>Register</h2>
  //       {registrationError && (
  //         <p className="error-message">{registrationError}</p>
  //       )}
  //       <form onSubmit={handleSubmit(onSubmit)}>
  //         <div className="form-group">
  //           <label>Username</label>
  //           <input
  //             {...register("handle", {
  //               required: "Username is required",
  //               minLength: { value: 3, message: "Minimum 3 characters" },
  //               maxLength: { value: 30, message: "Maximum 30 characters" },
  //             })}
  //             placeholder="Unique username"
  //           />
  //           {errors.handle && (
  //             <p className="error-message">{errors.handle.message}</p>
  //           )}
  //         </div>

  //         <div className="form-group">
  //           <label>First Name</label>
  //           <input
  //             {...register("firstName", {
  //               required: "First name is required",
  //               pattern: {
  //                 value: /^[A-Za-z]+$/,
  //                 message: "Only letters allowed",
  //               },
  //               maxLength: { value: 30, message: "Max 30 characters" },
  //             })}
  //             placeholder="John"
  //           />
  //           {errors.firstName && (
  //             <p className="error-message">{errors.firstName.message}</p>
  //           )}
  //         </div>

  //         <div className="form-group">
  //           <label>Last Name</label>
  //           <input
  //             {...register("lastName", {
  //               required: "Last name is required",
  //               pattern: {
  //                 value: /^[A-Za-z]+$/,
  //                 message: "Only letters allowed",
  //               },
  //               maxLength: { value: 30, message: "Max 30 characters" },
  //             })}
  //             placeholder="Doe"
  //           />
  //           {errors.lastName && (
  //             <p className="error-message">{errors.lastName.message}</p>
  //           )}
  //         </div>

  //         <div className="form-group">
  //           <label>Email</label>
  //           <input
  //             {...register("email", {
  //               required: "Email is required",
  //               pattern: {
  //                 value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  //                 message: "Invalid email format",
  //               },
  //             })}
  //             placeholder="your@email.com"
  //           />
  //           {errors.email && (
  //             <p className="error-message">{errors.email.message}</p>
  //           )}
  //         </div>

  //         <div className="form-group">
  //           <label>Phone</label>
  //           <input
  //             {...register("phone", {
  //               required: "Phone is required",
  //               pattern: {
  //                 value: /^\d{10}$/,
  //                 message: "Phone must be exactly 10 digits",
  //               },
  //             })}
  //             placeholder="1234567890"
  //           />
  //           {errors.phone && (
  //             <p className="error-message">{errors.phone.message}</p>
  //           )}
  //         </div>

  //         <div className="form-group">
  //           <label>Address (optional)</label>
  //           <input
  //             {...register("address")}
  //             placeholder="Your address"
  //           />
  //         </div>

  //         <div className="form-group">
  //           <label>Password</label>
  //           <input
  //             type="password"
  //             {...register("password", {
  //               required: "Password is required",
  //               minLength: { value: 8, message: "At least 8 characters" },
  //               pattern: {
  //                 value: /^(?=.*[0-9])(?=.*[!-@#$%^&*])/,
  //                 message: "Must include number and special character",
  //               },
  //             })}
  //           />
  //           {errors.password && (
  //             <p className="error-message">{errors.password.message}</p>
  //           )}
  //         </div>

  //         <div className="form-group">
  //           <label>Confirm Password</label>
  //           <input
  //             type="password"
  //             {...register("confirmPassword", {
  //               validate: (value) =>
  //                 value === password || "Passwords do not match",
  //             })}
  //           />
  //           {errors.confirmPassword && (
  //             <p className="error-message">{errors.confirmPassword.message}</p>
  //           )}
  //         </div>

  //         <button
  //           type="submit"
  //           className="register-button">
  //           Register
  //         </button>
  //       </form>
  //       <p>
  //         Already have an account? <Link to="/login">Login here</Link>
  //       </p>
  //     </div>
  //   </div>
  // );
  return (
  <div className="mt-20 mx-auto bg-gray-100 max-w-md">
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
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            {...register("handle", {
              required: "Username is required",
              minLength: { value: 3, message: "Minimum 3 characters" },
              maxLength: { value: 30, message: "Maximum 30 characters" },
            })}
            placeholder="Unique username"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.handle && (
            <p className="text-red-500 text-xs mt-1">
              {errors.handle.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            {...register("firstName", {
              required: "First name is required",
              pattern: { value: /^[A-Za-z]+$/, message: "Only letters allowed" },
              maxLength: { value: 30, message: "Max 30 characters" },
            })}
            placeholder="John"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            {...register("lastName", {
              required: "Last name is required",
              pattern: { value: /^[A-Za-z]+$/, message: "Only letters allowed" },
              maxLength: { value: 30, message: "Max 30 characters" },
            })}
            placeholder="Doe"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
            placeholder="your@email.com"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            {...register("phone", {
              required: "Phone is required",
              pattern: {
                value: /^\d{10}$/,
                message: "Phone must be exactly 10 digits",
              },
            })}
            placeholder="1234567890"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Address (optional)
          </label>
          <input
            {...register("address")}
            placeholder="Your address"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            {...register("confirmPassword", {
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
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
