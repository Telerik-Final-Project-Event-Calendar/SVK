import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { registerUser } from "../../services/auth.service";
import { AppContext } from "../../state/app.context";
import { IRegisterFormInputs } from "../../types/app.types";
import { useRegistrationValidation } from "../../hooks/useRegistrationValidation";

/**
 * Register page component
 *
 * Allows users to create a new account by providing personal and login information.
 * Performs client-side validation via useRegistrationValidation hook.
 *
 * @returns Rendered registration form
 */
const Register: React.FC = () => {
  const { setAppState } = useContext(AppContext);
  const navigate = useNavigate();
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );

  const {
    handleError,
    emailError,
    phoneError,
    firstNameError,
    lastNameError,
    passwordError,
    confirmPasswordError,
    validateAll,
    validateField,
  } = useRegistrationValidation();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<IRegisterFormInputs>();

  const password = watch("password");

  const onSubmit = async (data: IRegisterFormInputs) => {
    setRegistrationError(null);

    const isValid = await validateAll(data);
    if (!isValid) return;

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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4">
          <div className="form-group">
            <label className="label-base">Username</label>
            <input
              {...register("handle")}
              onBlur={() => validateField("handle", getValues("handle"))}
              placeholder="Unique username"
              className="input-base"
            />
            {handleError && <p className="error-text">{handleError}</p>}
          </div>

          <div className="form-group">
            <label className="label-base">First Name</label>
            <input
              {...register("firstName")}
              onBlur={() => validateField("firstName", getValues("firstName"))}
              placeholder="John"
              className="input-base"
            />
            {firstNameError && <p className="error-text">{firstNameError}</p>}
          </div>

          <div className="form-group">
            <label className="label-base">Last Name</label>
            <input
              {...register("lastName")}
              onBlur={() => validateField("lastName", getValues("lastName"))}
              placeholder="Doe"
              className="input-base"
            />
            {lastNameError && <p className="error-text">{lastNameError}</p>}
          </div>

          <div className="form-group">
            <label className="label-base">Email</label>
            <input
              {...register("email")}
              onBlur={() => validateField("email", getValues("email"))}
              placeholder="your@email.com"
              className="input-base"
            />
            {emailError && <p className="error-text">{emailError}</p>}
          </div>

          <div className="form-group">
            <label className="label-base">Phone</label>
            <input
              {...register("phone")}
              onBlur={() => validateField("phone", getValues("phone"))}
              placeholder="1234567890"
              className="input-base"
            />
            {phoneError && <p className="error-text">{phoneError}</p>}
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
              {...register("password")}
              onBlur={() => validateField("password", getValues("password"))}
              className="input-base"
            />
            {passwordError && <p className="error-text">{passwordError}</p>}
          </div>

          <div className="form-group">
            <label className="label-base">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              onBlur={() =>
                validateField("confirmPassword", getValues("confirmPassword"))
              }
              className="input-base"
            />
            {confirmPasswordError && (
              <p className="error-text">{confirmPasswordError}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary">
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
