import { db } from "../config/firebase-config";
import { ref, push } from "firebase/database";
import { EventData } from "../types/event.types";

export const createEvent = async (eventData: EventData): Promise<void> => {
  const eventsRef = ref(db, "events");
  await push(eventsRef, eventData);
};
