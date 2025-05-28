import { db } from "../config/firebase-config";
import { ref, push, set } from "firebase/database";
import { EventData } from "../types/event.types";

export const createEvent = async (eventData: EventData): Promise<void> => {
  const eventsRef = ref(db, "events");
  const newEventRef = push(eventsRef);
  const newEventKey = newEventRef.key;

  if (!newEventKey) throw new Error("Failed to generate event ID");

  await set(newEventRef, {
    ...eventData,
    creatorId: eventData.creatorId,
  });
};
