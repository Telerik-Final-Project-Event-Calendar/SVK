import { ref, get, child, update, set, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase-config';
import { IUserData } from '../types/app.types';

/**
 * Gets ures's data from Realtime Database by handle (UID).
 * @param {string} handle 
 * @returns {Promise<IUserData | null>} 
 */
export const getUserByHandle = async (handle: string): Promise<IUserData | null> => {
  try {
    const snapshot = await get(ref(db, `users/${handle}`));
    if (snapshot.exists()) {
      return snapshot.val() as IUserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting user with handle ${handle}:`, error);
    throw error;
  }
};

/**
 * Creates new user in Realtime Database.
 * @param {string} handle 
 * @param {IUserData} userData
 * @returns {Promise<void>}
 */
export const createUserProfile = async (
  handle: string,
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  address?: string
): Promise<void> => {
  const newUserProfile: IUserData = {
    email,
    handle,
    firstName,
    lastName,
    phone,
    uid,
    address: address || "",
    isAdmin: false,
    isBlocked: false,
    createdOn: new Date().toISOString(),
      photoURL: "",
  };
  try {
    await set(ref(db, `users/${handle}`), newUserProfile);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Updates user's data in Realtime Database.
 * @param {string} handle 
 * @param {Partial<IUserData>} updates
 * @returns {Promise<void>}
 */
export const updateProfile = async (handle: string, updates: Partial<IUserData>): Promise<void> => {
  try {
    await update(ref(db, `users/${handle}`), updates);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Gets users count.
 * @returns {Promise<number>} 
 */
export const getUsersCount = async (): Promise<number> => {
  try {
    const snapshot = await get(ref(db, "users"));
    if (snapshot.exists()) {
      return Object.keys(snapshot.val()).length;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error getting users count:", error);
    throw error;
  }
};

/**
 * Gets the latest user.
 * @returns {Promise<({ handle: string; fullName: string; createdOn: string; timestamp: number; } | null)>}
 */
export const getLatestUser = async (): Promise<IUserData | null> => {
  const snapshot = await get(ref(db, "users"));
  if (!snapshot.exists()) return null;

  const users = Object.values(snapshot.val()) as IUserData[];
  const sorted = users.sort(
    (a, b) => Date.parse(b.createdOn || "") - Date.parse(a.createdOn || "")
  );
  return sorted[0] || null;
};

export const getUserByUID = async (uid: string): Promise<IUserData | null> => {
  const snapshot = await get(
    query(ref(db, "users"), orderByChild("uid"), equalTo(uid))
  );
  if (!snapshot.exists()) return null;
  const users = snapshot.val();
  const firstKey = Object.keys(users)[0];
  return users[firstKey] as IUserData;
};