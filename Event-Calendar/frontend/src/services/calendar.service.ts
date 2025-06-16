import { ref, set, get } from "firebase/database";
import { db } from "../config/firebase-config";

export const createDate = async (handle: string, date: Date) => {
  const dateOnly = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };

  await set(ref(db, `users/${handle}/selectedDate`), dateOnly);
};

export const getUserSelectedDate = async (
  handle: string
): Promise<Date | null> => {
  try {
    const dateRef = ref(db, `users/${handle}/selectedDate`);
    const snapshot = await get(dateRef);
    if (!snapshot.exists()) return null;

    const val = snapshot.val();
    return new Date(val.year, val.month - 1, val.day);
  } catch (error) {
    console.error("Error fetching selected date:", error);
    return null;
  }
};

export const getUserView = async (handle: string): Promise<string | null> => {
  try {
    const viewRef = ref(db, `users/${handle}/view`);
    const snapshot = await get(viewRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error fetching calendar view:", error);
    return null;
  }
};

export const setUserView = async (
  handle: string,
  view: string
): Promise<void> => {
  const viewRef = ref(db, `users/${handle}/view`);
  await set(viewRef, view);
};
