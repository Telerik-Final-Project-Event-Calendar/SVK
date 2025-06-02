import { createContext } from "react";
import { CalendarContextType } from "../types/calendar.types";

export const CalendarContext = createContext<CalendarContextType>({
  selectedDate: new Date(),
  setSelectedDate: () => {},
  view: "weekly",
  setView: () => {},
  eventRefreshTrigger: 0,
  triggerEventRefresh: () => {},
});
