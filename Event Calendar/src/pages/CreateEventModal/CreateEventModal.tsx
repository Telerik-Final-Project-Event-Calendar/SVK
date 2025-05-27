import { useForm } from "react-hook-form";
import { createEvent } from "../../services/events.service";
import { AppContext } from "../../state/app.context";
import { useContext } from "react";
import { EventData } from "../../types/event.types";

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

  const { user } = useContext(AppContext);

  const onSubmit = async (data: any) => {
    if (!selectedDate) {
      alert("No date selected.");
      return;
    }

    const start = new Date(
      `${selectedDate.toDateString()} ${data.startHour}`
    ).toISOString();
    const end = new Date(
      `${selectedDate.toDateString()} ${data.endHour}`
    ).toISOString();

    const eventData: EventData = {
      title: data.title,
      start,
      end,
      description: data.description.slice(0, 500),
      location: data.location,
      isPublic: data.isPublic,
      participants: [user.uid],
    };

    try {
      await createEvent(eventData);
      onClose();
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Could not create event.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className=" bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Create Event
        </h2>

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

          <input
            type="text"
            placeholder="Location"
            {...register("location")}
            className="input-base"
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
    </div>
  );
}
