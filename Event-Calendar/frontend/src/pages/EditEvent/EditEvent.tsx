// src/pages/EditEvent.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { ref, get, getDatabase, set } from "firebase/database";
import { useForm } from "react-hook-form";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { AppContext } from "../../state/app.context";
import { CalendarContext } from "../../state/calendar.context";
import { EventData } from "../../types/event.types";
import LocationPickerMap from "../../components/Map/LocationPickerMap";
import ImageUploader from "../../components/ImageUploader/ImageUploader";
import { uploadPicture } from "../../services/storage.service";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useContext(AppContext);
  const { triggerEventRefresh } = useContext(CalendarContext);

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchEvent = async () => {
      const db = getDatabase();
      const snapshot = await get(ref(db, `events/${id}`));

      if (!snapshot.exists()) {
        alert("Event not found.");
        navigate("/");
        return;
      }

      const data = snapshot.val();
      if (user && user.uid !== data.creatorId) {
        alert("Not authorized to edit this event.");
        navigate("/");
        return;
      }

      setEventData(data);
      setAddress(data.location);
      if (data.imageUrl) setImagePreviewUrl(data.imageUrl);

      // Prefill form
      setValue("title", data.title);
      setValue("startHour", format(new Date(data.start), "HH:mm"));
      setValue("endHour", format(new Date(data.end), "HH:mm"));
      setValue("description", data.description);
      setValue("category", data.category);
      setValue("isPublic", data.isPublic);

      setLoading(false);
    };

    fetchEvent();
  }, [id, navigate, user, setValue]);

  const handleFileSelect = (file: File) => {
    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
  };

  const onSubmit = async (data: any) => {
    if (!eventData || !user || !userData) return;
    const TIMEZONE = "Europe/Sofia";

    const startDate = new TZDate(eventData.selectedDate, TIMEZONE);
    startDate.setHours(
      +data.startHour.split(":")[0],
      +data.startHour.split(":")[1]
    );

    const endDate = new TZDate(eventData.selectedDate, TIMEZONE);
    endDate.setHours(+data.endHour.split(":")[0], +data.endHour.split(":")[1]);

    const start = format(startDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
    const end = format(endDate, "yyyy-MM-dd'T'HH:mm:ssXXX");

    let imageUrl = eventData.imageUrl;

    if (selectedImageFile && userData.handle) {
      setIsUploadingImage(true);
      try {
        imageUrl = await uploadPicture(userData.handle, selectedImageFile);
      } catch (err) {
        console.error("Image upload failed", err);
        alert("Failed to upload image.");
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    const updatedEvent: EventData = {
      ...eventData,
      title: data.title,
      start,
      end,
      description: data.description.slice(0, 500),
      location: address,
      isPublic: data.isPublic,
      category: data.category,
      imageUrl: imageUrl === undefined ? null : imageUrl,
    };

    try {
      await set(ref(getDatabase(), `events/${eventData.id}`), updatedEvent);
      triggerEventRefresh();
      navigate("/");
    } catch (error) {
      console.error("Update failed", error);
      alert("Could not update event.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading event...</p>;

  // return (
  //   <div className="max-w-4xl mx-auto p-6">
  //     <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
  //     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  //       <input
  //         type="text"
  //         placeholder="Title"
  //         {...register("title", { required: true })}
  //         className="input-base w-full"
  //       />
  //       {errors.title && (
  //         <p className="text-red-600 text-sm">Title is required.</p>
  //       )}

  //       <div className="flex gap-2">
  //         <input
  //           type="time"
  //           {...register("startHour", { required: true })}
  //           className="w-1/2 input-base"
  //         />
  //         <input
  //           type="time"
  //           {...register("endHour", { required: true })}
  //           className="w-1/2 input-base"
  //         />
  //       </div>

  //       <textarea
  //         placeholder="Description (max 500 chars)"
  //         {...register("description", { maxLength: 500 })}
  //         className="w-full input-base"
  //         rows={3}
  //       />

  //       <label className="block text-sm font-medium text-gray-700">
  //         Event Image (Optional)
  //       </label>
  //       <ImageUploader
  //         previewURL={imagePreviewUrl}
  //         onFileSelect={handleFileSelect}
  //         onRemove={handleRemoveImage}
  //       />
  //       {isUploadingImage && (
  //         <p className="text-sm text-blue-600">Uploading image...</p>
  //       )}

  //       <label className="flex items-center gap-2 text-sm text-gray-700">
  //         <input
  //           type="checkbox"
  //           {...register("isPublic")}
  //           className="accent-blue-600"
  //         />
  //         Public event
  //       </label>

  //       <select
  //         {...register("category", { required: true })}
  //         className="input-base w-full"
  //       >
  //         <option value="">Select Category</option>
  //         <option value="deadline">Deadline</option>
  //         <option value="important">Important</option>
  //         <option value="work">Work</option>
  //         <option value="sports">Sports</option>
  //         <option value="personal">Personal</option>
  //       </select>

  //       <div className="h-96 border rounded-md overflow-hidden mt-4">
  //         <p className="text-sm text-gray-700 mb-1">
  //           Click the map to select a location:
  //         </p>
  //         {address && <p className="text-sm text-green-700">📍 {address}</p>}
  //         <LocationPickerMap
  //           position={position}
  //           address={address}
  //           setPosition={setPosition}
  //           setAddress={setAddress}
  //         />
  //       </div>

  //       <div className="flex justify-end gap-2 pt-4">
  //         <button
  //           type="button"
  //           onClick={() => navigate("/")}
  //           className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
  //         >
  //           Cancel
  //         </button>
  //         <button
  //           type="submit"
  //           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
  //           disabled={isUploadingImage}
  //         >
  //           Save Changes
  //         </button>
  //       </div>
  //     </form>
  //   </div>
  // );
  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Event</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Left Column: Form Fields */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              {...register("title", { required: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">Title is required.</p>
            )}
          </div>

          {/* Time */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                {...register("startHour", { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                {...register("endHour", { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description", { maxLength: 500 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe your event (max 500 characters)"
            />
          </div>

          {/* Public & Category */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                {...register("isPublic")}
                className="accent-blue-600"
              />
              Public event
            </label>

            <select
              {...register("category", { required: true })}
              className="w-48 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              <option value="deadline">Deadline</option>
              <option value="important">Important</option>
              <option value="work">Work</option>
              <option value="sports">Sports</option>
              <option value="personal">Personal</option>
            </select>
          </div>
        </div>

        {/* Right Column: Map + Image */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Image (Optional)
            </label>
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
              <ImageUploader
                previewURL={imagePreviewUrl}
                onFileSelect={handleFileSelect}
                onRemove={handleRemoveImage}
              />
              {isUploadingImage && (
                <p className="text-sm text-blue-600 mt-2">Uploading image...</p>
              )}
            </div>
          </div>

          {/* Map */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            {address && (
              <p className="text-sm text-green-700 mb-2">📍 {address}</p>
            )}
            <div className="h-80 border rounded-lg overflow-hidden">
              <LocationPickerMap
                position={position}
                address={address}
                setPosition={setPosition}
                setAddress={setAddress}
              />
            </div>
          </div>
        </div>

        {/* Full-Width Buttons */}
        <div className="col-span-full flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploadingImage}
            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
