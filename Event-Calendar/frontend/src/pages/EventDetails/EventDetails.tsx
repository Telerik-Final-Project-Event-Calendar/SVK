import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { FiFlag } from "react-icons/fi";
import { getEventById, joinEvent } from "../../services/events.service";
import { getUserByUID } from "../../services/users.service";
import { EventData } from "../../types/event.types";
import { InfoCard } from "../../components/InfoCard/InfoCard";
import { AppContext } from "../../state/app.context";
import { reportEvent } from "../../services/eventReports.service";

interface ParticipantData {
  uid: string;
  firstName: string;
  lastName: string;
}

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantsData, setParticipantsData] = useState<ParticipantData[]>(
    []
  );
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const { user, userData } = useContext(AppContext);

  const currentUserUID = user?.uid;

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<boolean | null>(null);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const currentUserHandle = userData?.handle;
  const isCreator = event?.creatorId === currentUserUID;

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

  const isParticipant = event?.participants?.includes(currentUserUID || "");

  const handleJoin = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!event || !currentUserUID) {
        setJoinError("Event data or user ID is missing.");
        return;
    }    
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
      const userDataFromDB = await getUserByUID(currentUserUID);
      if (userDataFromDB) {
        setParticipantsData((prev) => [
          ...prev,
          {
            firstName: userDataFromDB.firstName,
            lastName: userDataFromDB.lastName,
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

    const handleReportSubmit = async () => {
    if (!user) {
      alert("You must be logged in to report events!");
      setShowReportModal(false);
      setReportReason("");
      setReportSuccess(null);
      setReportMessage(null);
      return;
    }

    if (!event || !currentUserHandle || !eventId || !reportReason.trim()) {
      setReportMessage("Please provide a reason for the report.");
      setReportSuccess(false);
      return;
    }

    setReporting(true);
    setReportSuccess(null);
    setReportMessage(null);

    try {
      await reportEvent(eventId, currentUserHandle, reportReason.trim());
      setReportSuccess(true);
      setReportMessage("Event reported successfully. Thank you!");
      setReportReason("");
      setTimeout(() => setShowReportModal(false), 1200);
    } catch (error) {
      console.error("Error reporting event:", error);
      setReportSuccess(false);
      setReportMessage("Failed to report event. Please try again.");
    } finally {
      setReporting(false);
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
            src={event.imageUrl || undefined}
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
        <InfoCard
          icon={<HiCalendar />}
          label="Date">
          {new Date(event.start).toLocaleDateString()}
        </InfoCard>

        <InfoCard
          icon={<HiClock />}
          label="Time">
          {new Date(event.start).toLocaleTimeString()} –{" "}
          {new Date(event.end).toLocaleTimeString()}
        </InfoCard>

        <InfoCard
          icon={<HiLocationMarker />}
          label="Location">
          {event.location}
        </InfoCard>

        <InfoCard
          icon={<HiTag />}
          label="Category">
          <span className="capitalize">{event.category}</span>
        </InfoCard>

        <InfoCard
          icon={<HiUser />}
          label="Host">
          {event.handle}
        </InfoCard>

        <InfoCard
          icon={event.isPublic ? <HiGlobe /> : <HiLockClosed />}
          label="Visibility"
          color={event.isPublic ? "green" : "red"}>
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
                className="flex items-center gap-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition">
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
        {user && event.isPublic && !isParticipant && (
          <button
            disabled={joining}
            onClick={handleJoin}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {joining ? "Joining..." : "Join Event"}
          </button>
        )}

        {/* Report Event Button */}
        {user && !isCreator && (
          <button
            onClick={() => setShowReportModal(true)}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition disabled:opacity-50 flex items-center gap-2">
            <FiFlag className="w-5 h-5" /> Report
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

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Report Event
            </h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows={4}
              placeholder="Please describe why you are reporting this event (e.g., inappropriate content, spam, misleading information)."
              value={reportReason}
              onChange={(e) => {
                setReportReason(e.target.value);
                setReportSuccess(null);
                setReportMessage(null);
              }}
            />
            {reportMessage && (
              <p
                className={`mt-2 text-sm ${
                  reportSuccess ? "text-green-600" : "text-red-600"
                }`}>
                {reportMessage}
              </p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportSuccess(null);
                  setReportMessage(null);
                }}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={reporting || !reportReason.trim()}
                className="px-5 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition disabled:opacity-50">
                {reporting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
