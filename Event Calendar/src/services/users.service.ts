import { ref, get, child, update, set } from 'firebase/database';
import { db } from '../config/firebase-config';
import { IUserData } from '../types/app.types';

/**
 * Gets ures's data from Realtime Database by handle (UID).
 * @param {string} handle 
 * @returns {Promise<IUserData | null>} 
 */
export const getUserByHandle = async (handle: string): Promise<IUserData | null> => {
  try {
    const snapshot = await get(child(ref(db), `users/${handle}`));
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
export const createUserProfile = async (handle: string, userData: IUserData): Promise<void> => {
  try {
    await set(ref(db, `users/${handle}`), userData);
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
export async function getLatestUser(): Promise<({ handle: string; fullName: string; createdOn: string; timestamp: number; } | null)> {
  try {
    const snapshot = await get(child(ref(db), "users"));
    if (!snapshot.exists()) return null;

    const usersData: Record<string, IUserData> = snapshot.val();
    const usersArray = Object.entries(usersData).map(([handle, user]) => ({
      handle,
      fullName: `${user.firstName} ${user.lastName}`,
      createdOn: user.createdOn || "",
      timestamp: Date.parse(user.createdOn) || 0, 
    }));

    const sorted = usersArray.sort((a, b) => b.timestamp - a.timestamp);
    return sorted[0] || null;
  } catch (error) {
    console.error("Error getting latest user:", error);
    throw error;
  }
}