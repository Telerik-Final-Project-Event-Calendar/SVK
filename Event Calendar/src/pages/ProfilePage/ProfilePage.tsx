import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../state/app.context";
import { updateProfile } from "../../services/users.service";
import { uploadPicture } from "../../services/storage.service";
import { IUserData } from "../../types/app.types";
import { useRegistrationValidation } from "../../hooks/useRegistrationValidation";
import { useNavigate, useLocation } from "react-router-dom";

export default function ProfilePage() {
  const { userData, setAppState } = useContext(AppContext);
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [address, setAddress] = useState(userData?.address || "");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/";

  const {
    phoneError,
    firstNameError,
    lastNameError,
    validateField,
    validateAll,
  } = useRegistrationValidation(userData?.phone);

  useEffect(() => {
    if (newImageFile) {
      const objectUrl = URL.createObjectURL(newImageFile);
      setPreviewURL(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [newImageFile]);

  const handleSave = async () => {
    if (!userData?.handle) return;

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

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (newImageFile) {
        const imageUrl = await uploadPicture(userData.handle, newImageFile);
        updates.photoURL = imageUrl;
      }

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
        navigate(from);
      }, 2000);
    } catch (err) {
      console.error("Profile update failed:", err);
      setErrorMessage("❌ Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setNewImageFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Profile Settings
      </h2>

      <div className="mb-6">
        <label className="label-base mb-1">Profile Picture</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer mx-auto mb-2 overflow-hidden bg-gray-100">
          {previewURL ? (
            <img
              src={previewURL}
              alt="Preview"
              className="object-cover w-full h-full rounded-full"
            />
          ) : userData?.photoURL ? (
            <img
              src={userData.photoURL}
              alt="Current"
              className="object-cover w-full h-full rounded-full"
            />
          ) : (
            <span className="text-gray-500 text-sm">Click or drop</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && setNewImageFile(e.target.files[0])}
          className="hidden"
        />
      </div>

      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="label-base">Username</label>
          <input
            disabled
            value={userData?.handle || ""}
            className="input-base bg-gray-100"
          />
        </div>

        {/* Email */}
        <div>
          <label className="label-base">Email</label>
          <input
            disabled
            value={userData?.email || ""}
            className="input-base bg-gray-100"
          />
        </div>

        {/* First Name */}
        <div>
          <label className="label-base">First Name</label>
          <input
            value={firstName}
            onBlur={() => validateField("firstName", firstName)}
            onChange={(e) => setFirstName(e.target.value)}
            className="input-base"
          />
          {firstNameError && <p className="error-text">{firstNameError}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label className="label-base">Last Name</label>
          <input
            value={lastName}
            onBlur={() => validateField("lastName", lastName)}
            onChange={(e) => setLastName(e.target.value)}
            className="input-base"
          />
          {lastNameError && <p className="error-text">{lastNameError}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="label-base">Phone</label>
          <input
            value={phone}
            onBlur={() => validateField("phone", phone)}
            onChange={(e) => setPhone(e.target.value)}
            className="input-base"
          />
          {phoneError && <p className="error-text">{phoneError}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="label-base">Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-base"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary">
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        {successMessage && (
          <p className="text-green-600 text-sm text-center mt-2">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="text-red-600 text-sm text-center mt-2">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
