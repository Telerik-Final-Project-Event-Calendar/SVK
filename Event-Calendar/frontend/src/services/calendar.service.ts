import { ref, set } from "firebase/database";
import { db } from "../config/firebase-config";

export const createDate = async (handle: string, date: Date) => {
  const dateOnly = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };

  await set(ref(db, `users/${handle}/selectedDate`), dateOnly);
};