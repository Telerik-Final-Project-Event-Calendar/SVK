import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../state/app.context";
import { updateProfile } from "../../services/users.service";
import { uploadPicture } from "../../services/storage.service";
import { IUserData } from "../../types/app.types";
import { useRegistrationValidation } from "../../hooks/useRegistrationValidation";
import { useNavigate, useLocation } from "react-router-dom";
import ImageUploader from "../../components/ImageUploader/ImageUploader";
import LocationPickerMap from "../../components/Map/LocationPickerMap";

export default function ProfilePage() {
  const { userData, setAppState } = useContext(AppContext);
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [address, setAddress] = useState(userData?.address || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(
    userData?.photoURL || null
  );
const [position, setPosition] = useState<[number, number] | null>(null);

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
    return () => {
      if (previewURL?.startsWith("blob:")) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  const handleSave = async () => {
    if (!userData?.handle) return;

    setErrorMessage("");
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

    try {
      setIsSaving(true);

      if (newImageFile) {
        const photoURL = await uploadPicture(userData.handle, newImageFile);
        updates.photoURL = photoURL;
        setPreviewURL(photoURL);
      }

      if (previewURL === null && userData.photoURL) {
        updates.photoURL = "";
      }

      if (Object.keys(updates).length === 0) {
        setErrorMessage("⚠️ No changes made.");
        return;
      }

      await updateProfile(userData.handle, updates);

      setAppState((prev) => ({
        ...prev,
        userData: {
          ...prev.userData!,
          ...updates,
        },
      }));

      setSuccessMessage("✅ Changes saved successfully!");
      setTimeout(() => navigate(from), 1500);
    } catch (err) {
      console.error("Profile update failed:", err);
      setErrorMessage("❌ Profile update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (file: File) => {
    setNewImageFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>

      <div className="mb-6">
        <label className="label-base mb-2">Profile Picture</label>
        <ImageUploader
          previewURL={previewURL}
          onFileSelect={handleFileChange}
          onRemove={() => {
            setPreviewURL(null);
            setNewImageFile(null);
          }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="label-base">Username</label>
          <input
            disabled
            value={userData?.handle || ""}
            className="input-base bg-gray-100"
          />
        </div>

        <div>
          <label className="label-base">Email</label>
          <input
            disabled
            value={userData?.email || ""}
            className="input-base bg-gray-100"
          />
        </div>

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

        <div className="h-auto rounded-md overflow-hidden border">
          <label className="label-base">Address</label>
  <LocationPickerMap
    position={position}
    setPosition={setPosition}
    address={address}
    setAddress={setAddress}
  />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary">
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {successMessage && (
        <div className="text-green-600 font-medium text-center mt-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="text-red-500 font-medium text-center mt-4">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
