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
import { InfoCard } from "../../components/InfoCard/InfoCard";

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

  const hasImage = event.imageUrl && event.imageUrl.trim() !== "";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      {hasImage && (
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-[26rem] object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="space-y-4">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
          {event.title}
        </h1>
        <p className="text-lg text-gray-600">{event.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        <InfoCard icon={<HiCalendar />} label="Date">
          {new Date(event.start).toLocaleDateString()}
        </InfoCard>

        <InfoCard icon={<HiClock />} label="Time">
          {new Date(event.start).toLocaleTimeString()} –{" "}
          {new Date(event.end).toLocaleTimeString()}
        </InfoCard>

        <InfoCard icon={<HiLocationMarker />} label="Location">
          {event.location}
        </InfoCard>

        <InfoCard icon={<HiTag />} label="Category">
          <span className="capitalize">{event.category}</span>
        </InfoCard>

        <InfoCard icon={<HiUser />} label="Host">
          {event.handle}
        </InfoCard>

        <InfoCard
          icon={event.isPublic ? <HiGlobe /> : <HiLockClosed />}
          label="Visibility"
          color={event.isPublic ? "green" : "red"}
        >
          {event.isPublic ? "Public" : "Private"}
        </InfoCard>
      </div>
    </div>
  );
}
