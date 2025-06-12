import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById } from "../../services/events.service";
import {
  HiLocationMarker,
  HiCalendar,
  HiClock,
  HiTag,
  HiUser,
  HiUsers,
  HiGlobe,
  HiLockClosed,
} from "react-icons/hi";
import { EventData } from "../../types/event.types";

export default function EventDetails() {
  const { eventId } = useParams();

  console.log("USEpARAM", eventId);

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const loadEvent = async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (error) {
        console.error("Error loading event:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  console.log(eventId);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!event)
    return <div className="p-6 text-red-500">The Event is not found</div>;

  const hasImage = event.imageUrl && event.imageUrl.trim() !== '';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {hasImage && (
          <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={event.imageUrl}
              alt={`Event image: ${event.title}`}
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
          <p className="text-gray-500 mt-1">{event.description}</p>
        </div>

        <div className="grid gird-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <HiLocationMarker className="text-blue-500 mt-0.5" />
            <span>{event.location}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <HiCalendar className="text-green-500 mt-0.5" />
          <span>{new Date(event.start).toLocaleString()}</span>
        </div>

        <div className="flex items-start gap-2">
          <HiClock className="text-yellow-500 mt-0.5" />
          <span>{new Date(event.end).toLocaleString()}</span>
        </div>

        <div className="flex items-start gap-2">
          <HiTag className="text-purple-500 mt-0.5" />
          <span className="capitalize">{event.category}</span>
        </div>

        <div className="flex items-start gap-2">
          <HiUser className="text-gray-500 mt-0.5" />
          <span>{event.handle}</span>
        </div>

        <div className="flex items-start gap-2">
          {event.isPublic ? (
            <>
              <HiGlobe className="text-green-500 mt-0.5" />
              <span className="text-green-600 font-medium">Public</span>
            </>
          ) : (
            <>
              <HiLockClosed className="text-red-500 mt-0.5" />
              <span className="text-red-500 font-medium">Private</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
