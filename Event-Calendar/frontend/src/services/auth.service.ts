import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { ref, set, serverTimestamp, get, child, query, orderByChild, equalTo } from 'firebase/database';
import { auth, db } from '../config/firebase-config';
import { IRegisterFormInputs, IUserData, RegistrationResult } from '../types/app.types';
import { getUserByUID } from './users.service';


/**
 * Register new user.
 * Create in Realtime Database to.
 * @param {IRegisterFormInputs} registrationData data for registration
 * @returns {Promise<RegistrationResult>} the FIrebase object
 */
export const registerUser = async (registrationData: IRegisterFormInputs): Promise<RegistrationResult> => {
  const { email, password, firstName, lastName, handle, phone, address } = registrationData;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData: IUserData = {
      email,
      firstName,
      lastName,
      handle,
      phone,
      uid: user.uid,
      createdOn: new Date().toISOString(),
      address: address || "",
      photoURL: "",
    };

    await set(ref(db, `users/${handle}`), userData);

    await firebaseUpdateProfile(user, { displayName: `${firstName} ${lastName}`, photoURL: ''});

    return { user, userData };
  } catch (error) {
    console.error("Error during user registration:", error);
    throw error;
  }
};

/**
 * Log in.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ user: FirebaseUser; userData: IUserData }>} 
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: FirebaseUser; userData: IUserData }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const userData = await getUserByUID(user.uid);
    if (!userData) throw new Error("User data not found.");
    return { user, userData };
  } catch (error) {
    console.error("Error during user login:", error);
    throw error;
  }
};

/**
 * Log out
 * @returns {Promise<void>} 
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during user logout:", error);
    throw error;
  }
};

/**
 * Sends mail for reset.
 * @param {string} email 
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const isUsernameTaken = async (handle: string): Promise<boolean> => {
  const snapshot = await get(child(ref(db), `users/${handle}`));
  return snapshot.exists();
};

export const isEmailTaken = async (email: string): Promise<boolean> => {
  const snapshot = await get(
    query(ref(db, 'users'), orderByChild('email'), equalTo(email))
  );
  return snapshot.exists();
};

export const isPhoneTaken = async (phone: string): Promise<boolean> => {
  const snapshot = await get(
    query(ref(db, 'users'), orderByChild('phone'), equalTo(phone))
  );
  return snapshot.exists();
};