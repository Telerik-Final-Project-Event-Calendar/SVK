import { auth } from "../config/firebase-config";
import { IUserData } from "../types/app.types";

/**
 * Returns the profile picture URL from userData or auth context.
 */
export const getProfilePictureURL = (
  userData: IUserData | null
): string | null => {
  if (userData?.photoURL) {
    return userData.photoURL;
  }
  if (auth.currentUser?.photoURL) {
    return auth.currentUser.photoURL;
  }
  return null;
};
