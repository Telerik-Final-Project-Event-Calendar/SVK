import { useState } from "react";
import {
  isEmailTaken,
  isPhoneTaken,
  isUsernameTaken,
} from "../services/auth.service";
import { IRegisterFormInputs } from "../types/app.types";

interface ValidationState {
  handleError: string;
  emailError: string;
  phoneError: string;
  firstNameError: string;
  lastNameError: string;
  passwordError: string;
  confirmPasswordError: string;
}

/**
 * Custom React Hook for validating registration and profile forms.
 *
 * Performs both client-side validation (format, length, etc.)
 * and asynchronous checks against Firebase Realtime Database
 * to ensure uniqueness of username, email, and phone number.
 *
 * @param {string} [currentPhone] - The current phone number of the user (used when editing a profile to avoid false collision).
 * @returns {{
 *   handleError: string;
 *   emailError: string;
 *   phoneError: string;
 *   firstNameError: string;
 *   lastNameError: string;
 *   passwordError: string;
 *   confirmPasswordError: string;
 *   validateField: (field: keyof IRegisterFormInputs, value: string, passwordValue?: string) => Promise<void>;
 *   validateAll: (data: IRegisterFormInputs) => Promise<boolean>;
 *   setPhoneError: (value: string) => void;
 * }}
 *
 * @example
 * const {
 *   handleError,
 *   emailError,
 *   validateField,
 *   validateAll
 * } = useRegistrationValidation();
 *
 * await validateField("email", "test@example.com");
 *
 * const isValid = await validateAll(formData);
 */
export const useRegistrationValidation = (currentPhone?: string) => {
  const [state, setState] = useState<ValidationState>({
    handleError: "",
    emailError: "",
    phoneError: "",
    firstNameError: "",
    lastNameError: "",
    passwordError: "",
    confirmPasswordError: "",
  });

  const validateField = async (
    field: keyof IRegisterFormInputs,
    value: string,
    passwordValue?: string
  ) => {
    switch (field) {
      case "handle":
        if (!value.trim())
          return setState((s) => ({
            ...s,
            handleError: "Username is required.",
          }));
        if (value.length < 3 || value.length > 30)
          return setState((s) => ({
            ...s,
            handleError: "Username must be 3-30 characters.",
          }));
        if (/[.#$\[\]]/.test(value))
          return setState((s) => ({
            ...s,
            handleError: "Username cannot contain ., #, $, [, or ].",
          }));
        if (await isUsernameTaken(value))
          return setState((s) => ({
            ...s,
            handleError: "Username is already taken.",
          }));
        return setState((s) => ({ ...s, handleError: "" }));

      case "email":
        if (!value.trim())
          return setState((s) => ({ ...s, emailError: "Email is required." }));
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return setState((s) => ({
            ...s,
            emailError: "Invalid email format.",
          }));
        if (await isEmailTaken(value))
          return setState((s) => ({
            ...s,
            emailError: "Email is already in use.",
          }));
        return setState((s) => ({ ...s, emailError: "" }));

      case "phone":
        if (!value.trim())
          return setState((s) => ({ ...s, phoneError: "Phone is required." }));
        if (!/^[0-9]{10}$/.test(value))
          return setState((s) => ({
            ...s,
            phoneError: "Phone must be exactly 10 digits.",
          }));
        if (value !== currentPhone && (await isPhoneTaken(value)))
          return setState((s) => ({
            ...s,
            phoneError: "Phone number is already in use.",
          }));
        return setState((s) => ({ ...s, phoneError: "" }));

      case "firstName":
        if (!value.trim())
          return setState((s) => ({
            ...s,
            firstNameError: "First name is required.",
          }));
        if (!/^[A-Za-z]+$/.test(value))
          return setState((s) => ({
            ...s,
            firstNameError: "Only letters allowed.",
          }));
        return setState((s) => ({ ...s, firstNameError: "" }));

      case "lastName":
        if (!value.trim())
          return setState((s) => ({
            ...s,
            lastNameError: "Last name is required.",
          }));
        if (!/^[A-Za-z]+$/.test(value))
          return setState((s) => ({
            ...s,
            lastNameError: "Only letters allowed.",
          }));
        return setState((s) => ({ ...s, lastNameError: "" }));

      case "password":
        if (!value)
          return setState((s) => ({
            ...s,
            passwordError: "Password is required.",
          }));
        if (
          value.length < 8 ||
          !/[0-9]/.test(value) ||
          !/[-!@#$%^&*]/.test(value)
        )
          return setState((s) => ({
            ...s,
            passwordError:
              "Password must include number and special character (-!@()#$%^&*).",
          }));
        return setState((s) => ({ ...s, passwordError: "" }));

      case "confirmPassword":
        if (!value.trim()) {
          return setState((s) => ({
            ...s,
            confirmPasswordError: "Confirm your password.",
          }));
        }

        if (typeof passwordValue === "string" && value !== passwordValue) {
          return setState((s) => ({
            ...s,
            confirmPasswordError: "Passwords do not match.",
          }));
        }

        return setState((s) => ({ ...s, confirmPasswordError: "" }));

      default:
        console.warn(`Unknown field: ${field}`);
        break;
    }
  };

  const validateAll = async (data: IRegisterFormInputs): Promise<boolean> => {
    await Promise.all([
      validateField("handle", data.handle),
      validateField("email", data.email),
      validateField("phone", data.phone),
      validateField("firstName", data.firstName),
      validateField("lastName", data.lastName),
      validateField("password", data.password),
      validateField("confirmPassword", data.confirmPassword, data.password),
    ]);

    const {
      handleError,
      emailError,
      phoneError,
      firstNameError,
      lastNameError,
      passwordError,
      confirmPasswordError,
    } = state;

    return (
      !handleError &&
      !emailError &&
      !phoneError &&
      !firstNameError &&
      !lastNameError &&
      !passwordError &&
      !confirmPasswordError
    );
  };

  return {
    ...state,
    validateAll,
    validateField,
    setPhoneError: (v: string) => setState((s) => ({ ...s, phoneError: v })),
  };
};
