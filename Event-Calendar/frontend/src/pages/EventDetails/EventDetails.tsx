import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

import { getEventById, joinEvent } from "../../services/events.service";
import { getUserByUID } from "../../services/users.service";
import { EventData } from "../../types/event.types";
import { InfoCard } from "../../components/InfoCard/InfoCard";
import { AppContext } from "../../state/app.context";

interface ParticipantData {
  uid: string;
  firstName: string;
  lastName: string;
}

export default function EventDetails() {
  const { eventId } = useParams();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantsData, setParticipantsData] = useState<ParticipantData[]>(
    []
  );
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const { user } = useContext(AppContext);

  const currentUserUID = user.uid;
  useEffect(() => {
    if (!eventId) return;

    const loadEventAndParticipants = async () => {
      setLoading(true);
      try {
        const eventData = await getEventById(eventId);
        if (!eventData) throw new Error("Event not found");

        setEvent(eventData);

        // Load participants user info
        if (eventData.participants?.length) {
          const usersData = await Promise.all(
            eventData.participants.map(async (uid: string) => {
              const user = await getUserByUID(uid);
              return user
                ? { uid, firstName: user.firstName, lastName: user.lastName }
                : null;
            })
          );

          setParticipantsData(usersData.filter(Boolean) as ParticipantData[]);
        } else {
          setParticipantsData([]);
        }
      } catch (error) {
        console.error("Error loading event or participants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEventAndParticipants();
  }, [eventId]);

  const isParticipant = event?.participants?.includes(currentUserUID);

  const handleJoin = async () => {
    if (!event) return;
    setJoinError(null);
    setJoining(true);

    try {
      if (isParticipant) {
        setJoinError("You are already a participant.");
        setJoining(false);
        return;
      }

      await joinEvent(event.id, currentUserUID);

      // Update local state after joining
      const updatedParticipants = [
        ...(event.participants || []),
        currentUserUID,
      ];
      setEvent({ ...event, participants: updatedParticipants });

      // Fetch current user info and add to participants list
      const userData = await getUserByUID(currentUserUID);
      if (userData) {
        setParticipantsData((prev) => [
          ...prev,
          {
            firstName: userData.firstName,
            lastName: userData.lastName,
            uid: currentUserUID,
          },
        ]);
      }
    } catch (error) {
      console.error("Error joining event:", error);
      setJoinError("Failed to join event. Please try again.");
    } finally {
      setJoining(false);
    }
  };

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

      {/* Participants Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
          <HiUsers className="text-2xl text-blue-600" /> Participants (
          {participantsData.length})
        </h2>

        {participantsData.length === 0 ? (
          <p className="text-gray-500">No participants yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {participantsData.map(({ uid, firstName, lastName }) => (
              <li
                key={uid}
                className="flex items-center gap-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-semibold uppercase">
                  {firstName[0]}
                  {lastName[0]}
                </div>
                <span className="text-gray-900 font-medium">
                  {firstName} {lastName}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Join Button */}
        {event.isPublic && !isParticipant && (
          <button
            disabled={joining}
            onClick={handleJoin}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join Event"}
          </button>
        )}

        {/* Already joined message */}
        {isParticipant && (
          <p className="mt-6 text-green-600 font-semibold">
            You are already a participant of this event.
          </p>
        )}

        {/* Join error */}
        {joinError && (
          <p className="mt-4 text-red-600 font-semibold">{joinError}</p>
        )}
      </div>
    </div>
  );
}
