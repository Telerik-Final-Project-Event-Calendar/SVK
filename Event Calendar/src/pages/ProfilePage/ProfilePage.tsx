import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../state/app.context";
import { updateProfile } from "../../services/users.service";
import { IUserData } from "../../types/app.types";
import { useRegistrationValidation } from "../../hooks/useRegistrationValidation";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { userData, setAppState } = useContext(AppContext);
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [address, setAddress] = useState(userData?.address || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const {
    phoneError,
    firstNameError,
    lastNameError,
    validateField,
    validateAll,
  } = useRegistrationValidation(userData?.phone);

  const handleSave = async () => {
    if (!userData?.handle) return;

    const inputData: Partial<IUserData> = {
      firstName,
      lastName,
      phone,
      address,
    };

    const isValid = await validateAll({
      handle: userData.handle,
      email: userData.email,
      password: "placeholder",
      confirmPassword: "placeholder",
      firstName,
      lastName,
      phone,
      address,
    });

    if (!isValid) return;

    const updates: Partial<IUserData> = {};
    if (firstName !== userData.firstName) updates.firstName = firstName;
    if (lastName !== userData.lastName) updates.lastName = lastName;
    if (phone !== userData.phone) updates.phone = phone;
    if (address !== userData.address) updates.address = address;

    if (Object.keys(updates).length === 0) {
      alert("No changes to save.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(userData.handle, updates);
      setAppState((prev) => ({
        ...prev,
        userData: {
          ...prev.userData!,
          ...updates,
        },
      }));
      setSuccessMessage("✅ Profile updated successfully!");

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>

      {/* Profile picture section - for later */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profile Picture
        </label>
        {userData?.photoURL ? (
          <img
            src={userData.photoURL}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold mb-2">
            {userData?.firstName?.charAt(0)}
            {userData?.lastName?.charAt(0) || "?"}
          </div>
        )}
        <button
          disabled
          className="bg-gray-200 text-gray-500 px-3 py-1 rounded cursor-not-allowed"
          title="Coming soon">
          Change profile picture
        </button>
      </div>

      {/* Editable fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            disabled
            value={userData?.handle || ""}
            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            disabled
            value={userData?.email || ""}
            className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            value={firstName}
            onBlur={() => validateField("firstName", firstName)}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          {firstNameError && (
            <p className="text-red-500 text-sm mt-1">{firstNameError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            value={lastName}
            onBlur={() => validateField("lastName", lastName)}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          {lastNameError && (
            <p className="text-red-500 text-sm mt-1">{lastNameError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            value={phone}
            onBlur={() => validateField("phone", phone)}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          {phoneError && (
            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 text-green-600 font-medium text-center">
          {successMessage}
        </div>
      )}
    </div>
  );
}
