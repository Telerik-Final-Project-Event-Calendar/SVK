import { useContext, useState } from "react";
import { AppContext } from "../../state/app.context";
import { updateProfile } from "../../services/users.service";
import { IUserData } from "../../types/app.types";

export default function ProfilePage() {
  const { userData, setAppState } = useContext(AppContext);

  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [address, setAddress] = useState(userData?.address || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!userData?.handle) return;

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
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // return (
  //   <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
  //     <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>

  //     {/* Profile picture section */}
  //     <div className="mb-6">
  //       <label className="block text-sm font-medium text-gray-700 mb-1">
  //         Profile Picture
  //       </label>
  //       {userData?.photoURL ? (
  //         <img
  //           src={userData.photoURL}
  //           alt="Profile"
  //           className="w-24 h-24 rounded-full object-cover mb-2"
  //         />
  //       ) : (
  //         <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold mb-2">
  //           {userData?.firstName?.charAt(0)}
  //           {userData?.lastName?.charAt(0) || "?"}
  //         </div>
  //       )}
  //       <button
  //         disabled
  //         className="bg-gray-200 text-gray-500 px-3 py-1 rounded cursor-not-allowed"
  //         title="Coming soon">
  //         Change profile picture
  //       </button>
  //     </div>

  //     {/* Editable fields */}
  //     <div className="space-y-4">
  //       <div>
  //         <label className="block text-sm font-medium text-gray-700">
  //           Username (handle)
  //         </label>
  //         <input
  //           disabled
  //           value={userData?.handle || ""}
  //           className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
  //         />
  //       </div>

  //       <div>
  //         <label className="block text-sm font-medium text-gray-700">
  //           Email
  //         </label>
  //         <input
  //           disabled
  //           value={userData?.email || ""}
  //           className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
  //         />
  //       </div>

  //       <div>
  //         <label className="block text-sm font-medium text-gray-700">
  //           First Name
  //         </label>
  //         <input
  //           value={firstName}
  //           onChange={(e) => setFirstName(e.target.value)}
  //           className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
  //         />
  //       </div>

  //       <div>
  //         <label className="block text-sm font-medium text-gray-700">
  //           Last Name
  //         </label>
  //         <input
  //           value={lastName}
  //           onChange={(e) => setLastName(e.target.value)}
  //           className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
  //         />
  //       </div>

  //       <div>
  //         <label className="block text-sm font-medium text-gray-700">
  //           Phone
  //         </label>
  //         <input
  //           value={phone}
  //           onChange={(e) => setPhone(e.target.value)}
  //           className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
  //         />
  //       </div>

  //       <div>
  //         <label className="block text-sm font-medium text-gray-700">
  //           Address
  //         </label>
  //         <input
  //           value={address}
  //           onChange={(e) => setAddress(e.target.value)}
  //           className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
  //         />
  //       </div>

  //       <button
  //         onClick={handleSave}
  //         disabled={isSaving}
  //         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
  //         {isSaving ? "Saving..." : "Save Changes"}
  //       </button>
  //     </div>
  //   </div>
  // );
    return (
    <div className="container">
      <h2 className="title">Profile Settings</h2>

      <div className="profile-picture">
        {userData?.photoURL ? (
          <img src={userData.photoURL} alt="Profile" />
        ) : (
          <div className="avatar-placeholder">
            {userData?.firstName?.charAt(0)}
            {userData?.lastName?.charAt(0) || "?"}
          </div>
        )}
        <button disabled className="button disabled" title="Coming soon">
          Change profile picture
        </button>
      </div>

      <div className="form">
        <div className="form-group">
          <label>Username (handle)</label>
          <input type="text" value={userData?.handle || ""} disabled />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={userData?.email || ""} disabled />
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <button onClick={handleSave} disabled={isSaving} className="button">
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
