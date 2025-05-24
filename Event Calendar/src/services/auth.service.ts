import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, db } from '../config/firebase-config';
import { IRegisterFormInputs, IUserData } from '../types/app.types';


/**
 * Register new user.
 * Create in Realtime Database to.
 * @param {IRegisterFormInputs} registrationData data for registration
 * @returns {Promise<FirebaseUser>} the FIrebase object
 */
export const registerUser = async (registrationData: IRegisterFormInputs): Promise<FirebaseUser> => {
  const { email, password, firstName, lastName } = registrationData;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData: IUserData = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      handle: user.uid, 
      createdOn: new Date().toISOString(), 
      // photoURL: '', 
    };

    await set(ref(db, `users/${user.uid}`), userData);

    await firebaseUpdateProfile(user, { displayName: `${firstName} ${lastName}` });

    return user;
  } catch (error) {
    console.error("Error during user registration:", error);
    throw error;
  }
};

/**
 * Log in.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<FirebaseUser>} 
 */
export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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