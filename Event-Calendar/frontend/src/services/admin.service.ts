import { db } from "../config/firebase-config";
import { ref, get, update, remove } from "firebase/database";
import { IUserData } from "../types/app.types";
import { EventData } from "../types/event.types";
import { getEventReportStats } from "./eventReports.service";
import {
  deleteEvent as deleteEventFromEventsService,
  deleteEventSeries as deleteEventSeriesFromEventsService,
} from "./events.service";

/**
 * Admin Service Functions
 *
 * This service provides a collection of functions for administrative tasks within the application,
 * primarily interacting with Firebase Realtime Database. It covers user management (fetching, blocking,
 * promoting/demoting) and event management (fetching, deleting single events, deleting event series,
 * and retrieving report statistics).
 */

// --- USERS ---

/**
 * Fetches all user data from the Firebase Realtime Database.
 *
 * @returns {Promise<IUserData[]>} A promise that resolves to an array of `IUserData` objects,
 * representing all registered users. Returns an empty array if no users are found.
 */
export const fetchAllUsers = async (): Promise<IUserData[]> => {
  const usersSnap = await get(ref(db, "users"));
  if (!usersSnap.exists()) return [];

  const data = usersSnap.val();
  return Object.entries(data).map(([handle, value]: [string, any]) => ({
    handle,
    ...value,
  }));
};

/**
 * Toggles the `isBlocked` status of a specific user.
 * If the user is currently blocked, they will be unblocked, and vice-versa.
 *
 * @param {string} handle - The unique handle (username) of the user to modify.
 * @param {boolean} currentState - The current `isBlocked` status of the user.
 * @returns {Promise<void>} A promise that resolves when the update operation is complete.
 */
export const toggleUserBlockStatus = async (
  handle: string,
  currentState: boolean
) => {
  await update(ref(db, `users/${handle}`), { isBlocked: !currentState });
};

/**
 * Toggles the `isAdmin` status of a specific user.
 * If the user is currently an admin, they will be demoted to a regular user, and vice-versa.
 *
 * @param {string} handle - The unique handle (username) of the user to modify.
 * @param {boolean} currentState - The current `isAdmin` status of the user.
 * @returns {Promise<void>} A promise that resolves when the update operation is complete.
 */
export const toggleUserAdminStatus = async (
  handle: string,
  currentState: boolean
) => {
  await update(ref(db, `users/${handle}`), { isAdmin: !currentState });
};

/**
 * Sorts an array of user data based on their block and admin status.
 *
 * The sorting priority is as follows:
 * 1. Blocked users come before unblocked users.
 * 2. Within each block status group, admin users come before regular users.
 *
 * @param {IUserData[]} users - The array of `IUserData` objects to be sorted.
 * @returns {IUserData[]} A new array containing the sorted user data.
 */
export const sortUsersByStatusAndAdmin = (users: IUserData[]): IUserData[] => {
  return [...users].sort((a, b) => {
    if (a.isBlocked && !b.isBlocked) return -1;
    if (!a.isBlocked && b.isBlocked) return 1;
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;

    return 0;
  });
};

// --- EVENTS ---

/**
 * Fetches all event data from the Firebase Realtime Database.
 * Each event object includes its unique `id`.
 *
 * @returns {Promise<(EventData & { id: string })[]>} A promise that resolves to an array of event data
 * where each event also has an `id` property. Returns an empty array if no events are found.
 */
export const fetchAllEvents = async (): Promise<
  (EventData & { id: string })[]
> => {
  const snap = await get(ref(db, "events"));
  if (!snap.exists()) return [];

  const data = snap.val();
  return Object.entries(data).map(([id, event]: [string, any]) => ({
    id,
    ...event,
  }));
};

/**
 * Deletes a single event by its ID. This function is an alias
 * to `deleteEvent` from the `events.service`.
 * It will remove the event from the global events collection,
 * associated reports, and all user event lists.
 *
 * @param {string} eventId - The ID of the event to be deleted.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const deleteEvent = deleteEventFromEventsService;

/**
 * Deletes an entire event series by its series ID. This function is an alias
 * to `deleteEventSeries` from the `events.service`.
 * It will remove the series definition and all individual event occurrences
 * belonging to that series from the global events collection,
 * associated reports, and all user event lists.
 *
 * @param {string} seriesId - The ID of the event series to be deleted.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const deleteEventSeries = deleteEventSeriesFromEventsService;

/**
 * Retrieves statistics about reported events.
 * This function is an alias to `getEventReportStats` from the `eventReports.service`.
 *
 * @returns {Promise<{ total: number; distinctEvents: number }>} A promise that resolves to an object
 * containing the total number of reports and the count of distinct reported events.
 */
export const getReportStats = async () => {
  return await getEventReportStats();
};
