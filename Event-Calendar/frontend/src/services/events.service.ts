import { db } from "../config/firebase-config";
import { ref, push, set } from "firebase/database";
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
  } = eventData;

  // Push event to global "events" path
  const eventsRef = ref(db, "events");
  const newEventRef = push(eventsRef);
  const newEventKey = newEventRef.key;

  if (!newEventKey) throw new Error("Failed to generate event ID");

  const fullEventData = {
    title,
    start,
    end,
    description,
    isPublic,
    location,
    participants,
    creatorId,
    handle,
  };

  await set(newEventRef, fullEventData);

  const userEventRef = ref(db, `users/${handle}/events/${newEventKey}`);
  await set(userEventRef, fullEventData);
};
