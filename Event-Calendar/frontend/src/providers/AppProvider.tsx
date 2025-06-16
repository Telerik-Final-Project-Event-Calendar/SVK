// import { useEffect, useState } from "react";
// import { AppContext } from "../state/app.context";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../config/firebase-config";
// import { getUserByUID } from "../services/users.service";
// import { IAppState, IUserData } from "../types/app.types";
// import { SyncLoader } from "react-spinners";

// interface AppProviderProps {
//   children: React.ReactNode;
// }

// export default function AppProvider({ children }: AppProviderProps) {
//   const [appState, setAppState] = useState<IAppState>({
//     user: null,
//     userData: null,
//     selectedDate: new Date(),
//     searchTerm: "",
//     view: "monthly",
//     isLoading: false,
//     error: null,
//   });

//   const [isInitialAuthLoading, setIsInitialAuthLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, handleAuthChange);
//     return () => unsubscribe();
//   }, []);

//   const handleAuthChange = async (firebaseUser: any) => {
//     setAppState((prev) => ({ ...prev, user: firebaseUser }));

//     if (!firebaseUser) {
//       setAppState((prev) => ({
//         ...prev,
//         user: null,
//         userData: null,
//         error: null,
//         isLoading: false,
//       }));
//       setIsInitialAuthLoading(false);
//       return;
//     }

//     try {
//       const data: IUserData | null = await getUserByUID(firebaseUser.uid);

//       const enrichedData: IUserData | null = data
//         ? {
//             ...data,
//             photoURL: firebaseUser.photoURL ?? data.photoURL ?? null,
//             createdOn: data.createdOn ?? null,
//           }
//         : null;

//       setAppState((prev) => ({
//         ...prev,
//         userData: enrichedData,
//         error: null,
//         isLoading: false,
//       }));
//     } catch (err) {
//       console.error("❌ Error fetching user data:", err);
//       setAppState((prev) => ({
//         ...prev,
//         userData: null,
//         error: "Failed to load user data.",
//         isLoading: false,
//       }));
//     } finally {
//       setIsInitialAuthLoading(false);
//     }
//   };

//   if (isInitialAuthLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <SyncLoader color="#36d7b7" />
//       </div>
//     );
//   }

//   return (
//     <AppContext.Provider value={{ ...appState, setAppState }}>
//       {children}
//     </AppContext.Provider>
//   );
// }

import { useEffect, useState } from "react";
import { AppContext } from "../state/app.context";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { getUserByUID } from "../services/users.service";
import { IAppState, IUserData } from "../types/app.types";
import { SyncLoader } from "react-spinners";

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

  const [isInitialAuthLoading, setIsInitialAuthLoading] = useState(true);

  useEffect(() => {
    signInWithEmailAndPassword(auth, "savina.stancheva87@gmail.com", "Levski-1914")
      .then((res) => {
        console.log("✅ Manual login success:", res.user);
      })
      .catch((err) => {
        console.error("❌ Manual login error:", err.message);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);
    return () => unsubscribe();
  }, []);

  const handleAuthChange = async (firebaseUser: any) => {
    console.log("Firebase user:", firebaseUser);
    setAppState((prev) => ({ ...prev, user: firebaseUser }));

    if (!firebaseUser) {
      setAppState((prev) => ({
        ...prev,
        user: null,
        userData: null,
        error: null,
      }));
      setIsInitialAuthLoading(false);
      return;
    }

    try {
      const data: IUserData | null = await getUserByUID(firebaseUser.uid);
      console.log("User from DB:", data);

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
        error: null,
      }));
    } catch (err) {
      console.error("Error fetching user data:", err);
      setAppState((prev) => ({
        ...prev,
        userData: null,
        error: "Failed to load user data.",
      }));
    } finally {
      setAppState((prev) => ({ ...prev, isLoading: false }));
      setIsInitialAuthLoading(false);
    }
  };

  if (isInitialAuthLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <SyncLoader color="#36d7b7" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ ...appState, setAppState }}>
      {children}
    </AppContext.Provider>
  );
}
