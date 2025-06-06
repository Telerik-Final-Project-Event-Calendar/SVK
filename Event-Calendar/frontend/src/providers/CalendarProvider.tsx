import { useState, useEffect, useContext } from "react";
import { CalendarContext } from "../state/calendar.context";
import { AppContext } from "../state/app.context";

interface CalendarProviderProps {
  children: React.ReactNode;
}

export const CalendarProvider = ({ children }: CalendarProviderProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<string>("weekly");

  const [eventRefreshTrigger, setEventRefreshTrigger] = useState(0);
  const triggerEventRefresh = () => setEventRefreshTrigger((prev) => prev + 1);

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
