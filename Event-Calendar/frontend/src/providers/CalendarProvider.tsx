import { useState } from "react";
import { CalendarContext } from "../state/calendar.context";

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedDate, setSelectedDate] = useState<any>(null); 
  const [view, setView] = useState("monthly");

  return (
    <CalendarContext.Provider value={{ selectedDate, setSelectedDate, view, setView }}>
      {children}
    </CalendarContext.Provider>
  );
}