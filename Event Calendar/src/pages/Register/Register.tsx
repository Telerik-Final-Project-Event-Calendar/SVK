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
    <div className="form-container">
      <h2 className="form-title">Register</h2>
      {registrationError && (
        <p className="error-message">{registrationError}</p>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form">
        <div className="form-group">
          <label>Username</label>
          <input
            {...register("handle", {
              required: "Username is required",
              minLength: { value: 3, message: "Minimum 3 characters" },
              maxLength: { value: 30, message: "Maximum 30 characters" },
            })}
            placeholder="Unique username"
          />
          {errors.handle && (
            <p className="error-message">{errors.handle.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>First Name</label>
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
          />
          {errors.firstName && (
            <p className="error-message">{errors.firstName.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Last Name</label>
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
          />
          {errors.lastName && (
            <p className="error-message">{errors.lastName.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            {...register("phone", {
              required: "Phone is required",
              pattern: {
                value: /^\d{10}$/,
                message: "Phone must be exactly 10 digits",
              },
            })}
            placeholder="1234567890"
          />
          {errors.phone && (
            <p className="error-message">{errors.phone.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Address (optional)</label>
          <input
            {...register("address")}
            placeholder="Your address"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "At least 8 characters" },
              pattern: {
                value: /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
                message: "Must include number and special character",
              },
            })}
          />
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword", {
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="button">
          Register
        </button>
      </form>

      <p className="text-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
