import React, { useContext, useEffect, useState } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { AppContext } from "../../state/app.context";
import HourLabels from "../../components/Calendar/HoursLabels";
import WeeklyDayColumns from "../../components/Calendar/WeeklyDayColumns";
import { getAllEvents } from "../../services/events.service";
import { EventData } from "../../types/event.types";

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export default function WeeklyCalendar() {
  const { selectedDate, view, setSelectedDate } = useContext(CalendarContext);
  const { user } = useContext(AppContext);
  const [weeklyEvents, setWeeklyEvents] = useState<EventData[]>([]);

  const validSelectedDate =
    selectedDate instanceof Date ? selectedDate : new Date();
  const weekStart = startOfWeek(validSelectedDate);
  const { eventRefreshTrigger } = useContext(CalendarContext);

  useEffect(() => {
    async function fetchEvents() {
      const events: EventData[] = await getAllEvents();
      const start = startOfWeek(validSelectedDate);
      const weekDates = [...Array(7)].map((_, i) =>
        addDays(start, i).toLocaleDateString("sv-SE")
      );
      const filtered = events.filter((event) =>
        weekDates.includes(event.selectedDate) && (user || event.isPublic)
      );
      setWeeklyEvents(filtered);
    }

    fetchEvents();
  }, [validSelectedDate, eventRefreshTrigger, user]);

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2 px-2">
        <button
          onClick={() => setSelectedDate(addDays(validSelectedDate, -7))}
          className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          ← Previous Week
        </button>
        <span className="font-medium text-sm">
          Week of {startOfWeek(validSelectedDate).toLocaleDateString()}
        </span>
        <button
          onClick={() => setSelectedDate(addDays(validSelectedDate, 7))}
          className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          Next Week →
        </button>
      </div>

      <div
        className="flex border border-gray-300 max-w-full overflow-x-auto"
        style={{ height: "900px" }}
      >
        <div className="w-12 border-r border-gray-300 select-none">
          <HourLabels />
        </div>
        <div className="flex flex-1">
          <WeeklyDayColumns weekStart={weekStart} events={weeklyEvents} />
        </div>
      </div>
    </div>
  );
}
