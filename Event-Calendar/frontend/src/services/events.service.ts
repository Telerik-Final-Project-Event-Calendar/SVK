import { db } from "../config/firebase-config";
import { ref, push, set, get, update } from "firebase/database";
import { EventData } from "../types/event.types";

export const createEvent = async (eventData: EventData): Promise<void> => {
  const {
    creatorId,
    title,
    start,
    end,
    description,
    isPublic,
    location,
    participants,
    handle,
    selectedDate,
    category,
    imageUrl,
  } = eventData;

  // Push event to global "events" path
  const eventsRef = ref(db, "events");
  const newEventRef = push(eventsRef);
  const newEventKey = newEventRef.key;

  if (!newEventKey) throw new Error("Failed to generate event ID");

  const fullEventData = {
    id: newEventKey,
    title,
    start,
    end,
    description,
    isPublic,
    location,
    participants,
    creatorId,
    handle,
    selectedDate,
    category,
    imageUrl: imageUrl === undefined ? null : imageUrl,
  };

  await set(newEventRef, fullEventData);

  const userEventRef = ref(db, `users/${handle}/events/${newEventKey}`);
  await set(userEventRef, fullEventData);
};

export async function getAllEventsForDate(dateKey: string) {
  const eventsRef = ref(db, "events");

  const snapshot = await get(eventsRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, any>;

  const filtered = Object.entries(data)
    .filter(([_, event]: [string, any]) => event.selectedDate === dateKey)
    .map(([id, event]) => ({ id, ...event }));

  return filtered;
}

export const getAllEvents = async () => {
  const eventsRef = ref(db, "events");
  const snapshot = await get(eventsRef);
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val());
};

export async function getEventById(eventId: string) {
  const eventRef = ref(db, `events/${eventId}`);

  console.log("Fetching event from Firebase with ID:", eventId);

  try {
    const snapshot = await get(eventRef);
    if (snapshot.exists()) {
      return { id: eventId, ...snapshot.val() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export const fetchUserEvents = async (username: string): Promise<any[]> => {
  const userRef = ref(db, `users/${username}/events`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data);
  }

  return [];
};

export const joinEvent = async (eventId: string, userId: string) => {
  const eventRef = ref(db, `events/${eventId}`);

  const snapshot = await get(eventRef);
  if (!snapshot.exists()) throw new Error("Event not found");

  const event = snapshot.val();
  const participants = event.participants || [];

  if (participants.includes(userId)) return;

  await update(eventRef, {
    participants: [...participants, userId],
  });
};
