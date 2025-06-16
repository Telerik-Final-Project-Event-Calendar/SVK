import { useState, useEffect, useContext } from "react";
import { CalendarContext } from "../state/calendar.context";
import { ref, get } from "firebase/database";
import { db } from "../config/firebase-config";
import { AppContext } from "../state/app.context";
import { getUserByHandle } from "../services/users.service";

interface CalendarProviderProps {
  children: React.ReactNode;
}

export const CalendarProvider = ({ children }: CalendarProviderProps) => {
  const { user } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<string | null>(null);

  const [eventRefreshTrigger, setEventRefreshTrigger] = useState(0);
  const triggerEventRefresh = () => setEventRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    async function fetchView() {
      if (!user) {
        setView("weekly");
        return;
      }

      try {
        const usersSnap = await get(ref(db, "users"));
        if (!usersSnap.exists()) {
          setView("weekly");
          return;
        }

        const usersData = usersSnap.val();
        let foundHandle = null;

        for (const handle in usersData) {
          if (usersData[handle].uid === user.uid) {
            foundHandle = handle;
            break;
          }
        }

        if (!foundHandle) {
          setView("weekly");
          return;
        }

        const userData = await getUserByHandle(foundHandle);

        if (userData?.view) {
          setView(userData.view);
        } else {
          setView("weekly");
        }
      } catch (error) {
        console.error("❌ Error loading user view:", error);
        setView("weekly");
      }
    }

    fetchView();
  }, [user]);

  if (!view) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-lg">Loading calendar view...</div>
      </div>
    );
  }

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        view,
        setView,
        eventRefreshTrigger,
        triggerEventRefresh,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
