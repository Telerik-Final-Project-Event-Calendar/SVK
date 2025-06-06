import { db } from '../config/firebase-config';
import { ref, get, update, remove } from 'firebase/database';
import { IUserData } from '../types/app.types';
import { EventData } from "../types/event.types";

// --- USERS ---

export const fetchAllUsers = async (): Promise<IUserData[]> => {
  const usersSnap = await get(ref(db, "users"));
  if (!usersSnap.exists()) return [];

  const data = usersSnap.val();
  return Object.entries(data).map(([handle, value]: [string, any]) => ({
    handle,
    ...value,
  }));
};

export const toggleUserBlockStatus = async (handle: string, currentState: boolean) => {
  await update(ref(db, `users/${handle}`), { isBlocked: !currentState });
};

export const toggleUserAdminStatus = async (handle: string, currentState: boolean) => {
  await update(ref(db, `users/${handle}`), { isAdmin: !currentState });
};

export const getReportStats = async (): Promise<{ total: number; distinctPosts: number }> => {
  return { total: 0, distinctPosts: 0 }; // Placeholder
};

// --- EVENTS ---

export const fetchAllEvents = async (): Promise<(EventData & { id: string })[]> => {
  const snap = await get(ref(db, "events"));
  if (!snap.exists()) return [];

  const data = snap.val();
  return Object.entries(data).map(([id, event]: [string, any]) => ({
    id,
    ...event,
  }));
};

export const deleteEvent = async (eventId: string) => {
  await remove(ref(db, `events/${eventId}`));
};