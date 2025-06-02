import { useForm } from "react-hook-form";
import { createEvent } from "../../services/events.service";
import { AppContext } from "../../state/app.context";
import { useContext, useEffect, useState } from "react";
import { EventData } from "../../types/event.types";
import { useNavigate } from "react-router-dom";
import LocationPickerMap from "../../components/Map/LocationPickerMap";
import { MapContainer, TileLayer, Marker, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

interface Props {
  selectedDate: Date | null;
  onClose: () => void;
}

export default function CreateEventModal({ selectedDate, onClose }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { user, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

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
    console.log(dateOnly);

    // Prepare event data
    const eventData = {
      title: data.title,
      start,
      end,
      description: data.description.slice(0, 500),
      location: address,
      isPublic: data.isPublic,
      participants: [user.uid],
      creatorId: user.uid,
      selectedDate: dateOnly,
      handle: userData.handle,
    };

    // Proceed with creating the event
    try {
      await createEvent(eventData);
      onClose();
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Could not create event.");
    }
  };

  // function LocationMarker() {
  //   useMapEvent("click", async (e) => {
  //     const { lat, lng } = e.latlng;
  //     setPosition([lat, lng]);

  //     try {
  //       const res = await fetch(
  //         `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  //       );
  //       const data = await res.json();

  //       if (data && data.display_name) {
  //         setAddress(data.display_name);
  //       } else {
  //         setAddress("Unknown location");
  //       }
  //     } catch (error) {
  //       console.error("Reverse geocoding failed:", error);
  //       setAddress("Failed to get address");
  //     }
  //   });

  //   return position === null ? null : <Marker position={position} />;
  // }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-4xl">
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

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  {...register("isPublic")}
                  className="accent-blue-600"
                />
                Public event
              </label>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
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
      </div>
    </div>
  );
}
