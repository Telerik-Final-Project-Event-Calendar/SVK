import React, { useState, useEffect } from 'react';
import { AppContext } from '../state/app.context';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase-config';
import { getUserByHandle } from '../services/users.service';
import { IAppState, IUserData } from '../types/app.types';

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [appState, setAppState] = useState<IAppState>({
    user: null,
    userData: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userData = await getUserByHandle(firebaseUser.uid);
          setAppState({
            user: firebaseUser,
            userData: userData,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
          setAppState(prevState => ({
            ...prevState,
            user: firebaseUser,
            userData: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error('An unknown error occurred fetching user data.'),
          }));
        }
      } else {
        setAppState({
          user: null,
          userData: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []); 

  return (
    <AppContext.Provider value={{ ...appState, setAppState }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;