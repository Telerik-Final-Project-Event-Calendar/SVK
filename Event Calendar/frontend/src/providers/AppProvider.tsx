import { useEffect, useState } from "react";
import { AppContext } from "../state/app.context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { getUserByUID } from "../services/users.service";
import { IAppState, IUserData } from "../types/app.types";

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  const [appState, setAppState] = useState<IAppState>({
    user: null,
    userData: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAppState((prev) => ({ ...prev, user: firebaseUser }));
      setIsLoading(true);
      if (firebaseUser) {
        try {
          const data = await getUserByUID(firebaseUser.uid);
          setAppState((prev) => ({
            ...prev,
            userData: data || null,
          }));
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data.");
          setAppState((prev) => ({
            ...prev,
            userData: null,
          }));
        }
      } else {
        setAppState({ user: null, userData: null });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ ...appState, setAppState }}>
      {!isLoading ? (
        children
      ) : (
        <div className="text-center mt-20">Loading...</div>
      )}
    </AppContext.Provider>
  );
}
