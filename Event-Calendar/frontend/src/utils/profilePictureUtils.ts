import { auth } from "../config/firebase-config";
import { IUserData } from "../types/app.types";

export const getProfilePictureURL = (
  userData: IUserData | null | undefined
): string | null => {
  if (userData?.photoURL) {
    return userData.photoURL;
  }
  if (auth.currentUser?.photoURL) {
    return auth.currentUser.photoURL;
  }
  return null;
};
