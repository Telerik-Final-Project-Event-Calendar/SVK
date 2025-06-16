import { useForm } from "react-hook-form";
import {
  createEvent,
  createEventSeries,
  prepareRecurrenceData,
} from "../../services/events.service";
import { AppContext } from "../../state/app.context";
import { useContext, useEffect, useState } from "react";
import { EventData, EventSeriesData } from "../../types/event.types";
import { useNavigate } from "react-router-dom";
import LocationPickerMap from "../../components/Map/LocationPickerMap";
import "leaflet/dist/leaflet.css";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { CalendarContext } from "../../state/calendar.context";
import ImageUploader from "../../components/ImageUploader/ImageUploader";
import { uploadPicture } from "../../services/storage.service";
import EventSeriesForm from "../../components/EventSeriesForm/EventSeriesForm";
import { createInvitation } from "../../services/invitations.service";
import { getUserByHandle } from "../../services/users.service";
import { getGroupedContactsByOwnerId } from "../../services/contacts.service";

interface Props {
  selectedDate: Date | null;
  onClose: () => void;
}

export default function CreateEventModal({ selectedDate, onClose }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const { user, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string>("");
  const { triggerEventRefresh } = useContext(CalendarContext);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedInvitees, setSelectedInvitees] = useState<any[]>([]);
  const [contactGroups, setContactGroups] = useState<
    { id: string; name: string; contacts: any[] }[]
  >([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null
  );

  const isSeries = watch("isSeries");
  const recurrenceType = watch("recurrenceType");
  const endType = watch("endType");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchContacts() {
      if (user?.uid) {
        const groups = await getGroupedContactsByOwnerId(user.uid);
        setContactGroups(groups);
      }
    }
    fetchContacts();
  }, [user]);

  useEffect(() => {
    setValue("invitees", selectedInvitees.map((c) => c.handle).join(","));
  }, [selectedInvitees, setValue]);

  const handleFileSelect = (file: File) => {
    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
  };

  const onSubmit = async (data: any) => {
    if (!selectedDate) {
      alert("Please select a date to the event");
      return;
    }

    if (!position) {
      alert("Please select a location on the map.");
      return;
    }

    if (!userData) {
      alert("User data is missing.");
      return;
    }

    const TIMEZONE = "Europe/Sofia";

    const startDate = new TZDate(selectedDate, TIMEZONE);
    startDate.setHours(
      data.startHour.split(":")[0],
      data.startHour.split(":")[1]
    );

    const endDate = new TZDate(selectedDate, TIMEZONE);
    endDate.setHours(data.endHour.split(":")[0], data.endHour.split(":")[1]);

    const start = format(startDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
    const end = format(endDate, "yyyy-MM-dd'T'HH:mm:ssXXX");

    const dateOnly = selectedDate.toLocaleDateString("en-CA");

    let finalImageUrl: string | null = null;

    if (selectedImageFile && userData.handle) {
      setIsUploadingImage(true);
      try {
        finalImageUrl = await uploadPicture(userData.handle, selectedImageFile);
      } catch (error) {
        console.error("Error uploading event image:", error);
        alert("Failed to upload image. Please try again.");
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    const baseEventData: Omit<
      EventData,
      | "id"
      | "start"
      | "end"
      | "selectedDate"
      | "isSeries"
      | "seriesId"
      | "recurrence"
    > = {
      title: data.title,
      description: data.description.slice(0, 500),
      location: address,
      isPublic: data.isPublic,
      participants: [user.uid],
      creatorId: user.uid,
      handle: userData.handle,
      category: data.category,
      imageUrl: finalImageUrl,
    };

    try {
      if (data.isSeries) {
        const recurrence = prepareRecurrenceData(data, TIMEZONE);

        const seriesData: Omit<EventSeriesData, "id"> = {
          name: data.seriesName,
          creatorId: user.uid,
          creatorHandle: userData.handle,
          createdAt: new Date().toISOString(),
          recurrence: recurrence,
          baseEventData: baseEventData,
        };
        await createEventSeries(seriesData, startDate, endDate, TIMEZONE);
        alert("Event series created successfully!");
      } else {
        const singleEventData: EventData = {
          ...baseEventData,
          start,
          end,
          selectedDate: dateOnly,
          isSeries: false,
          id: "",
        };
        const eventId = await createEvent(singleEventData);

        // await createEvent(singleEventData);
        const inviteesRaw = data.invitees || "";
        const inviteHandles = inviteesRaw
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        for (const handle of inviteHandles) {
          try {
            const invitedUser = await getUserByHandle(handle);
            if (!invitedUser) continue;

            await createInvitation({
              eventId,
              eventTitle: data.title,
              fromUserId: user.uid,
              fromHandle: userData.handle,
              toUserId: invitedUser.uid,
              toHandle: invitedUser.handle,
            });
          } catch (err) {
            console.error(`Failed to invite ${handle}:`, err);
          }
        }

        alert("Event created successfully!");
      }
      triggerEventRefresh();
      onClose();
    } catch (error) {
      console.error("Failed to create event/series:", error);
      alert("Could not create event/series. Check console for details.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Create Event
        </h2>

        {selectedDate && (
          <p className="mb-4 text-sm text-gray-600">
            Selected Date:{" "}
            <strong>
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </p>
        )}

        {/* Layout: Left (form), Right (map) */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  {...register("title", {
                    required: true,
                    minLength: 3,
                    maxLength: 30,
                  })}
                  className="input-base"
                />
                {errors.title && (
                  <p className="error-text">Title must be 3–30 characters.</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="time"
                  {...register("startHour", { required: true })}
                  defaultValue="09:00"
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  {...register("endHour", { required: true })}
                  defaultValue="10:00"
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <textarea
                placeholder="Description (max 500 chars)"
                {...register("description", { maxLength: 500 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />

              <div className="py-2">
                <label className="label-base mb-2 block">
                  Event Image (Optional)
                </label>
                <ImageUploader
                  previewURL={imagePreviewUrl}
                  onFileSelect={handleFileSelect}
                  onRemove={handleRemoveImage}
                />
                {isUploadingImage && (
                  <p className="text-blue-600 text-sm mt-2">
                    Uploading image...
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  {...register("isPublic")}
                  className="accent-blue-600"
                />
                Public event
              </label>

              <select
                {...register("category", { required: true })}
                className="input-base"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="deadline">Deadline</option>
                <option value="important">Important</option>
                <option value="work">Work</option>
                <option value="sports">Sports</option>
                <option value="personal">Personal</option>
              </select>

              <div className="mb-4">
                <label className="label-base mb-1 block">
                  Invite People by Group
                </label>

                <div className="flex gap-2 flex-wrap mb-2">
                  {contactGroups.map((group, index) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroupIndex(index)}
                      className={`px-3 py-1 rounded-md border text-sm ${
                        selectedGroupIndex === index
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {group.name}
                    </button>
                  ))}
                </div>

                {selectedGroupIndex !== null && (
                  <ul className="border rounded p-2 max-h-48 overflow-y-auto">
                    {contactGroups[selectedGroupIndex].contacts.map(
                      (contact) => {
                        const isSelected = selectedInvitees.some(
                          (c) => c.uid === contact.uid
                        );
                        return (
                          <li
                            key={contact.uid}
                            onClick={() =>
                              setSelectedInvitees((prev) =>
                                isSelected
                                  ? prev.filter((c) => c.uid !== contact.uid)
                                  : [...prev, contact]
                              )
                            }
                            className={`flex justify-between p-2 cursor-pointer ${
                              isSelected ? "bg-blue-100" : "hover:bg-gray-100"
                            }`}
                          >
                            <span>{contact.handle}</span>
                            {isSelected && (
                              <span className="text-green-600 font-bold">
                                ✔
                              </span>
                            )}
                          </li>
                        );
                      }
                    )}
                  </ul>
                )}

                {selectedInvitees.length > 0 && (
                  <p className="mt-2 text-sm text-gray-700">
                    Inviting:{" "}
                    <span className="font-medium">
                      {selectedInvitees.map((c) => c.handle).join(", ")}
                    </span>
                  </p>
                )}

                {/* Hidden input to sync with react-hook-form */}
                <input type="hidden" {...register("invitees")} />
              </div>

              <EventSeriesForm
                register={register}
                errors={errors}
                watch={watch}
                isSeries={isSeries}
                recurrenceType={recurrenceType}
                endType={endType}
              />
            </form>
          </div>

          {/* Right: Map */}
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-2">
              Click on the map to select a location:
            </p>
            {address && (
              <p className="text-sm text-green-700 mt-2">
                📍 Address: {address}
              </p>
            )}
            <div className="h-96 rounded-md overflow-hidden border">
              <LocationPickerMap
                position={position}
                address={address}
                setPosition={setPosition}
                setAddress={setAddress}
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-transparent p-4 border-t border-gray-200 flex justify-end gap-2 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            disabled={isUploadingImage}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
