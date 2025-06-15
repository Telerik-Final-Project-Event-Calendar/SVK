import { db } from "../config/firebase-config";
import { ref, push, set, get, update, remove } from "firebase/database";
import { EventData, EventSeriesData } from "../types/event.types";
import { IUserData } from "../types/app.types";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

/**
 * Prepares recurrence data for event series, ensuring nulls instead of undefined
 * for properties that are not applicable to a given recurrence type or end type.
 * This helps maintain consistent data structure in the database.
 *
 * @param {any} data - Raw form data containing recurrence details.
 * @param {string} TIMEZONE - The timezone string used for date formatting.
 * @returns {EventSeriesData["recurrence"]} A formatted recurrence object.
 */
export const prepareRecurrenceData = (
  data: any,
  TIMEZONE: string
): EventSeriesData["recurrence"] => {
  const recurrence: EventSeriesData["recurrence"] = {
    type: data.recurrenceType,
    interval: data.recurrenceInterval ? Number(data.recurrenceInterval) : null,
    endType: data.endType,
    endDate:
      data.endType === "onDate" && data.seriesEndDate
        ? format(
            new TZDate(data.seriesEndDate, TIMEZONE),
            "yyyy-MM-dd'T'HH:mm:ssXXX"
          )
        : null,
    occurrencesCount:
      data.endType === "afterOccurrences" && data.occurrencesCount
        ? Number(data.occurrencesCount)
        : null,
  };

  if (
    data.recurrenceType === "weekly" &&
    data.daysOfWeek &&
    data.daysOfWeek.length > 0
  ) {
    recurrence.daysOfWeek = data.daysOfWeek.map(Number);
  } else {
    recurrence.daysOfWeek = null;
  }

  if (data.recurrenceType === "monthly" && data.daysOfMonth) {
    const days = String(data.daysOfMonth)
      .split(",")
      .map(Number)
      .filter((day) => !isNaN(day));
    recurrence.daysOfMonth = days.length > 0 ? days : null;
  } else {
    recurrence.daysOfMonth = null;
  }

  return recurrence;
};

/**
 * Creates a single event entry in the Firebase Realtime Database.
 * This function stores the event in a global 'events' path and also links it
 * to the creator's specific user profile under 'users/{handle}/events/{eventId}'.
 * Ensures `imageUrl` is stored as `null` if it's `undefined`.
 *
 * @param {EventData} eventData - The data for the event to be created.
 * @returns {Promise<void>} A promise that resolves when the event has been successfully saved.
 * @throws {Error} If generating an event ID fails.
 */
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
    isSeries,
    seriesId,
    recurrence,
  } = eventData;

  const eventsRef = ref(db, "events");
  const newEventRef = push(eventsRef);
  const newEventKey = newEventRef.key;

  if (!newEventKey) throw new Error("Failed to generate event ID");

  const fullEventData: EventData = {
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
    isSeries: isSeries || false,
    seriesId: seriesId || null,
    recurrence: recurrence || null,
  };

  await set(newEventRef, fullEventData);

  const userEventRef = ref(db, `users/${handle}/events/${newEventKey}`);
  await set(userEventRef, fullEventData);
};

/**
 * Creates an event series by generating multiple individual event occurrences
 * based on the provided recurrence rules. It stores the series definition
 * and each generated event occurrence in the Firebase Realtime Database.
 *
 * @param {Omit<EventSeriesData, "id">} seriesDataWithoutId - The base data for the event series, excluding its ID.
 * @param {Date} firstEventStart - The start date/time of the first event in the series.
 * @param {Date} firstEventEnd - The end date/time of the first event in the series.
 * @param {string} timezone - The timezone string relevant for date calculations (e.g., 'Europe/Sofia').
 * @returns {Promise<void>} A promise that resolves when the series and all its occurrences are saved.
 * @throws {Error} If generating a series ID or an event ID for an occurrence fails.
 */
export const createEventSeries = async (
  seriesDataWithoutId: Omit<EventSeriesData, "id">,
  firstEventStart: Date,
  firstEventEnd: Date,
  timezone: string
): Promise<void> => {
  const { name, creatorId, creatorHandle, recurrence, baseEventData } =
    seriesDataWithoutId;

  const seriesRef = push(ref(db, "eventSeries"));
  const seriesId = seriesRef.key;

  if (!seriesId) throw new Error("Failed to generate series ID");

  const fullSeriesData: EventSeriesData = {
    ...seriesDataWithoutId,
    id: seriesId,
    createdAt: new Date().toISOString(),
  };
  await set(seriesRef, fullSeriesData);

  const generatedEvents: EventData[] = [];
  let currentStart = new Date(firstEventStart);
  let currentEnd = new Date(firstEventEnd);
  let occurrencesCount = 0;

  const MAX_OCCURRENCES = 365 * 2; 

  while (true) {
    if (recurrence.endType === "onDate" && recurrence.endDate != null) {
      const seriesEndDate = new Date(recurrence.endDate);
      if (currentStart > seriesEndDate) {
        break;
      }
    }
    if (
      recurrence.endType === "afterOccurrences" &&
      recurrence.occurrencesCount != null
    ) {
      if (occurrencesCount >= recurrence.occurrencesCount) {
        break;
      }
    }

    if (occurrencesCount >= MAX_OCCURRENCES) {
      console.warn(`Stopped generating events for series ${seriesId} due to MAX_OCCURRENCES limit.`); // Removed for cleaner output
      break;
    }

    const eventId = push(ref(db, "events")).key;
    if (!eventId)
      throw new Error("Failed to generate event ID for series occurrence.");

    const event: EventData = {
      ...baseEventData,
      id: eventId,
      title: `${name}: ${baseEventData.title}`,
      start: currentStart.toISOString(),
      end: currentEnd.toISOString(),
      selectedDate: currentStart.toLocaleDateString("en-CA"),
      isSeries: true,
      seriesId: seriesId,
      recurrence: recurrence,
    };
    generatedEvents.push(event);

    occurrencesCount++;

    const prevStart = new Date(currentStart);
    const prevEnd = new Date(currentEnd);

    if (recurrence.type === "daily") {
      const interval = recurrence.interval || 1;
      currentStart.setDate(currentStart.getDate() + interval);
      currentEnd.setDate(currentEnd.getDate() + interval);
    } else if (recurrence.type === "weekly") {
      const interval = recurrence.interval || 1;
      if (recurrence.daysOfWeek != null && recurrence.daysOfWeek.length > 0) {
        const sortedDaysOfWeek = [...recurrence.daysOfWeek].sort(
          (a, b) => a - b
        );
        const currentDayIndex = prevStart.getDay();

        let daysToAdvance = 0;
        let foundNextDayInCurrentWeek = false;

        for (const targetDay of sortedDaysOfWeek) {
          if (targetDay > currentDayIndex) {
            daysToAdvance = targetDay - currentDayIndex;
            foundNextDayInCurrentWeek = true;
            break;
          }
        }

        if (foundNextDayInCurrentWeek) {
          currentStart.setDate(prevStart.getDate() + daysToAdvance);
          currentEnd.setDate(prevEnd.getDate() + daysToAdvance);
        } else {
          const daysUntilNextSunday = (7 - currentDayIndex) % 7;
          const daysToJumpToNextWeek =
            currentDayIndex === 0 && daysUntilNextSunday === 0
              ? 7
              : daysUntilNextSunday;
          const jumpWeeksDays = (interval - 1) * 7;
          const daysToFirstSelectedDayInNextInterval = sortedDaysOfWeek[0];
          const totalDaysToAdd =
            daysToJumpToNextWeek +
            jumpWeeksDays +
            daysToFirstSelectedDayInNextInterval;

          currentStart.setDate(prevStart.getDate() + totalDaysToAdd);
          currentEnd.setDate(prevEnd.getDate() + totalDaysToAdd);
        }
      } else {
        currentStart.setDate(prevStart.getDate() + 7 * interval);
        currentEnd.setDate(prevEnd.getDate() + 7.0 * interval);
      }
    } else if (recurrence.type === "monthly") {
      const interval = recurrence.interval || 1;

      if (recurrence.daysOfMonth != null && recurrence.daysOfMonth.length > 0) {
        const sortedDaysOfMonth = [...recurrence.daysOfMonth].sort(
          (a, b) => a - b
        );
        const currentDayOfMonth = prevStart.getDate();

        let nextDayInCurrentMonth = sortedDaysOfMonth.find(
          (day) => day > currentDayOfMonth
        );

        if (nextDayInCurrentMonth !== undefined) {
          const lastDayOfCurrentMonth = new Date(
            prevStart.getFullYear(),
            prevStart.getMonth() + 1,
            0
          ).getDate();
          if (nextDayInCurrentMonth > lastDayOfCurrentMonth) {
            currentStart.setMonth(
              prevStart.getMonth() + interval,
              sortedDaysOfMonth[0]
            );
            currentEnd.setMonth(
              prevEnd.getMonth() + interval,
              sortedDaysOfMonth[0]
            );
          } else {
            currentStart.setDate(nextDayInCurrentMonth);
            currentEnd.setDate(nextDayInCurrentMonth);
          }
        } else {
          currentStart.setMonth(prevStart.getMonth() + interval);
          currentEnd.setMonth(prevEnd.getMonth() + interval);

          const firstSelectedDay = sortedDaysOfMonth[0];
          const lastDayOfNewMonth = new Date(
            currentStart.getFullYear(),
            currentStart.getMonth() + 1,
            0
          ).getDate();

          currentStart.setDate(Math.min(firstSelectedDay, lastDayOfNewMonth));
          currentEnd.setDate(Math.min(firstSelectedDay, lastDayOfNewMonth));
        }
        currentStart.setHours(
          prevStart.getHours(),
          prevStart.getMinutes(),
          prevStart.getSeconds(),
          prevStart.getMilliseconds()
        );
        currentEnd.setHours(
          prevEnd.getHours(),
          prevEnd.getMinutes(),
          prevEnd.getSeconds(),
          prevEnd.getMilliseconds()
        );
      } else {
        const originalDay = prevStart.getDate();

        currentStart.setMonth(prevStart.getMonth() + interval);
        currentEnd.setMonth(prevEnd.getMonth() + interval);

        const lastDayOfNewMonth = new Date(
          currentStart.getFullYear(),
          currentStart.getMonth() + 1,
          0
        ).getDate();
        if (originalDay > lastDayOfNewMonth) {
          currentStart.setDate(lastDayOfNewMonth);
          currentEnd.setDate(lastDayOfNewMonth);
        } else {
          currentStart.setDate(originalDay);
          currentEnd.setDate(originalDay);
        }
        currentStart.setHours(
          prevStart.getHours(),
          prevStart.getMinutes(),
          prevStart.getSeconds(),
          prevStart.getMilliseconds()
        );
        currentEnd.setHours(
          prevEnd.getHours(),
          prevEnd.getMinutes(),
          prevEnd.getSeconds(),
          prevEnd.getMilliseconds()
        );
      }
    } else if (recurrence.type === "yearly") {
      const interval = recurrence.interval || 1;
      currentStart.setFullYear(prevStart.getFullYear() + interval);
      currentEnd.setFullYear(prevEnd.getFullYear() + interval);
    } else {
      break;
    }
  }

  const eventPromises = generatedEvents.map((event) => {
    const eventRef = ref(db, `events/${event.id}`);
    const userEventRef = ref(db, `users/${event.handle}/events/${event.id}`);
    return Promise.all([set(eventRef, event), set(userEventRef, event)]);
  });

  await Promise.all(eventPromises);
};

/**
 * Deletes a single event from the Firebase Realtime Database.
 * This function performs a comprehensive deletion:
 * 1. Removes the event from the global 'events' path.
 * 2. Removes all associated reports for this event from 'eventReports' path.
 * 3. Removes the event from the 'events' list of all users who had it linked.
 *
 * @param {string} eventId - The ID of the event to be deleted.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 * @throws {Error} If any part of the deletion process fails.
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const eventRef = ref(db, `events/${eventId}`);
    await remove(eventRef);

    const eventReportsRef = ref(db, `eventReports/${eventId}`);
    await remove(eventReportsRef);

    const usersRef = ref(db, "users");
    const usersSnapshot = await get(usersRef);

    if (usersSnapshot.exists()) {
      const usersData = usersSnapshot.val();
      const userUpdates: Promise<void>[] = [];

      for (const userHandle in usersData) {
        const userSpecificEventRef = ref(
          db,
          `users/${userHandle}/events/${eventId}`
        );
        const userSpecificEventSnapshot = await get(userSpecificEventRef);

        if (userSpecificEventSnapshot.exists()) {
          userUpdates.push(remove(userSpecificEventRef));
        }
      }
      await Promise.all(userUpdates);
    }
  } catch (error) {
    console.error(
      `[deleteEvent] Failed to delete event ${eventId} completely:`,
      error
    );
    throw error;
  }
};

/**
 * Deletes an entire event series from the Firebase Realtime Database.
 * This function performs a multi-step deletion:
 * 1. Removes the series definition itself from the 'eventSeries' path.
 * 2. Identifies and deletes all individual event occurrences that belong to this series
 * by calling the `deleteEvent` function for each occurrence. This ensures all associated
 * reports and user links for these occurrences are also removed.
 *
 * @param {string} seriesId - The ID of the event series to be deleted.
 * @returns {Promise<void>} A promise that resolves when the series and all its occurrences are deleted.
 * @throws {Error} If any part of the deletion process fails.
 */
export const deleteEventSeries = async (seriesId: string): Promise<void> => {
  try {
    await remove(ref(db, `eventSeries/${seriesId}`));

    const eventsRef = ref(db, "events");
    const snapshot = await get(eventsRef);

    if (snapshot.exists()) {
      const allEvents = snapshot.val() as Record<string, EventData>;
      const eventsInSeries = Object.values(allEvents).filter(
        (event: EventData) => event.isSeries && event.seriesId === seriesId
      );

      const deletionPromises = eventsInSeries.map((event) =>
        deleteEvent(event.id)
      );
      await Promise.all(deletionPromises);
    }
  } catch (error) {
    console.error(
      `[deleteEventSeries] Failed to delete event series ${seriesId} completely:`,
      error
    );
    throw error;
  }
};

/**
 * Fetches all events scheduled for a specific date.
 *
 * @param {string} dateKey - The date in "yyyy-MM-dd" format (e.g., "2023-10-27").
 * @returns {Promise<EventData[]>} A promise that resolves to an array of `EventData` objects
 * for the specified date. Returns an empty array if no events are found for that date.
 */
export async function getAllEventsForDate(
  dateKey: string
): Promise<EventData[]> {
  const eventsRef = ref(db, "events");
  const snapshot = await get(eventsRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val() as Record<string, EventData>;

  const filtered = Object.values(data).filter(
    (event) => event.selectedDate === dateKey
  );

  return filtered;
}

/**
 * Fetches all events stored in the Firebase Realtime Database.
 *
 * @returns {Promise<EventData[]>} A promise that resolves to an array of all `EventData` objects.
 * Returns an empty array if no events are found.
 */
export const getAllEvents = async (): Promise<EventData[]> => {
  const eventsRef = ref(db, "events");
  const snapshot = await get(eventsRef);
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val()) as EventData[];
};

/**
 * Fetches a single event by its ID from the Firebase Realtime Database.
 *
 * @param {string} eventId - The ID of the event to fetch.
 * @returns {Promise<EventData | null>} A promise that resolves to the `EventData` object
 * if found, or `null` if the event does not exist or an error occurs.
 */
export async function getEventById(eventId: string): Promise<EventData | null> {
  const eventRef = ref(db, `events/${eventId}`);

  try {
    const snapshot = await get(eventRef);
    if (snapshot.exists()) {
      return { id: eventId, ...snapshot.val() } as EventData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

/**
 * Fetches all events associated with a specific user handle from their profile.
 *
 * @param {string} username - The handle (username) of the user whose events are to be fetched.
 * @returns {Promise<EventData[]>} A promise that resolves to an array of `EventData` objects
 * linked to the specified user. Returns an empty array if no events are found for the user.
 */
export const fetchUserEvents = async (
  username: string
): Promise<EventData[]> => {
  const userRef = ref(db, `users/${username}/events`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data) as EventData[];
  }

  return [];
};

/**
 * Adds a user as a participant to an event.
 * Checks if the user is already a participant before adding to prevent duplicates.
 *
 * @param {string} eventId - The ID of the event to join.
 * @param {string} userId - The UID of the user joining the event.
 * @returns {Promise<void>} A promise that resolves when the user is added to the participants list.
 * @throws {Error} If the event is not found.
 */
export const joinEvent = async (eventId: string, userId: string) => {
  const eventRef = ref(db, `events/${eventId}`);

  const snapshot = await get(eventRef);
  if (!snapshot.exists()) throw new Error("Event not found");

  const event = snapshot.val();
  let participants: string[] = [];
  if (event.participants) {
    if (Array.isArray(event.participants)) {
      participants = [...event.participants];
    } else if (typeof event.participants === "object") {
      participants = Object.values(event.participants);
    }
  }

  if (participants.includes(userId)) return;

  await update(eventRef, {
    participants: [...participants, userId],
  });
};
