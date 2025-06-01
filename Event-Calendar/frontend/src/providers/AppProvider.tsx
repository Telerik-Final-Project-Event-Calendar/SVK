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
    selectedDate: new Date(),
    searchTerm: "",
    view: "monthly",
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);
    return () => unsubscribe();
  }, []);

  const handleAuthChange = async (firebaseUser: any) => {
    setAppState((prev) => ({ ...prev, user: firebaseUser, isLoading: true }));

    if (!firebaseUser) {
      setAppState((prev) => ({
        ...prev,
        user: null,
        userData: null,
        isLoading: false,
        error: null,
      }));
      return;
    }

    try {
      const data: IUserData | null = await getUserByUID(firebaseUser.uid);

      const enrichedData: IUserData | null = data
        ? {
            ...data,
            photoURL: firebaseUser.photoURL ?? data.photoURL ?? null,
            createdOn: data.createdOn ?? null,
          }
        : null;

      setAppState((prev) => ({
        ...prev,
        userData: enrichedData,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      console.error("Error fetching user data:", err);
      setAppState((prev) => ({
        ...prev,
        userData: null,
        isLoading: false,
        error: "Failed to load user data.",
      }));
    }
  };

  return (
    <AppContext.Provider value={{ ...appState, setAppState }}>
      {!appState.isLoading ? (
        children
      ) : (
        <div className="text-center mt-20">Loading...</div>
      )}
    </AppContext.Provider>
  );
}
