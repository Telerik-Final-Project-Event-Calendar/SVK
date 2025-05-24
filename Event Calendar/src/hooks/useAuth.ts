import { useContext } from 'react';
import { AppContext } from '../state/app.context';
import { IAppContextType, IUserData } from '../types/app.types';
import { User as FirebaseUser } from 'firebase/auth';
import { logoutUser as serviceLogoutUser } from '../services/auth.service'; 

/**
 * Custom React Hook to access authentication state and functions from AppContext.
 * @returns {{
 * user: FirebaseUser | null;
 * userData: IUserData | null;
 * isLoading: boolean;
 * error: Error | null;
 * setUser: (user: FirebaseUser | null) => void;
 * setUserData: (userData: IUserData | null) => void;
 * logout: () => Promise<void>;
 * }}
 */
export const useAuth = () => {
  const { user, userData, isLoading, error, setAppState } = useContext(AppContext);

  const setUser = (newUser: FirebaseUser | null) => {
    setAppState(prevState => ({ ...prevState, user: newUser }));
  };

  const setUserData = (newUserData: IUserData | null) => {
    setAppState(prevState => ({ ...prevState, userData: newUserData }));
  };

  const logout = async (): Promise<void> => {
    try {
      await serviceLogoutUser(); 
      setAppState({ 
        user: null,
        userData: null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error during logout:", err);
      throw err; 
    }
  };

  return {
    user,
    userData,
    isLoading,
    error,
    setUser,
    setUserData,
    logout, 
  };
};