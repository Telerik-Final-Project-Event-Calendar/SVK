import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById } from "../../services/events.service";

export default function EventDetails() {
  const { eventId } = useParams();

  console.log("USEpARAM", eventId);

  const [event, setEvent] = useState<any>(null);
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-gray-500">{event.description}</p>
      </div>

      <div className="mb-2">
        <strong>Location:</strong> {event.location}
      </div>
      <div className="mb-2">
        <strong>Start:</strong> {new Date(event.start).toLocaleString()}
      </div>
      <div className="mb-2">
        <strong>End:</strong> {new Date(event.end).toLocaleString()}
      </div>
      <div className="mb-2">
        <strong>Category:</strong> {event.category}
      </div>
      <div className="mb-2">
        <strong>Creator:</strong> {event.handle}
      </div>
      <div className="mb-2">
        <strong>Public:</strong> {event.isPublic ? "Yes" : "No"}
      </div>

      {event.participants && (
        <div className="mb-2">
          <strong>Participants:</strong>
          <ul className="list-disc ml-6">
            {Object.values(event.participants).map((p: any, idx: number) => (
              <li key={idx}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
