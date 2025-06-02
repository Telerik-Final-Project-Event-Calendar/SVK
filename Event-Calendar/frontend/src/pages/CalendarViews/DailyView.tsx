import React, { useContext, useEffect, useState } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { AppContext } from "../../state/app.context";
import DailyHourLabels from "../../components/Calendar/DailyHoursLabels";
import { getAllEventsForDate } from "../../services/events.service";
import { format } from "date-fns/fp";

export default function DailyCalendar() {
  const { selectedDate, setSelectedDate } = useContext(CalendarContext);
  const validSelectedDate =
    selectedDate instanceof Date ? selectedDate : new Date();
  const [events, setEvents] = useState<any[]>([]);
  const dateKey = format("yyyy-MM-dd", validSelectedDate);

  const { eventRefreshTrigger } = useContext(CalendarContext);

  const dayLabel = validSelectedDate.toLocaleDateString("default", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const loadEvents = async () => {
      const dayEvents = await getAllEventsForDate(dateKey);
      setEvents(dayEvents);
    };

    loadEvents();
  }, [dateKey, eventRefreshTrigger]);

  function getEventTop(start: Date) {
    return start.getHours() * 37.5 + (start.getMinutes() / 60) * 37.5;
  }

  function getEventHeight(start: Date, end: Date) {
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return durationHours * 37.5;
  }

  function addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4 px-2">
        <button
          onClick={() => setSelectedDate(addDays(validSelectedDate, -1))}
          className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          ← Previous Day
        </button>
        <h2 className="text-lg font-semibold">{dayLabel}</h2>
        <button
          onClick={() => setSelectedDate(addDays(validSelectedDate, 1))}
          className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          Next Day →
        </button>
      </div>
      <div
        className="flex border border-gray-300 max-w-full overflow-x-auto overflow-y-auto"
        style={{ height: "900px" }}
      >
        <div className="w-12 border-r border-gray-300 select-none">
          <DailyHourLabels />
        </div>

        <div
          className="flex-1 relative border-l border-gray-200"
          style={{ height: 37.5 * 24 }}
        >
          {Array.from({ length: 24 }).map((_, hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-b border-gray-200"
              style={{ top: hour * 37.5, height: 37.5 }}
            />
          ))}

          {events.map((event, idx) => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            const top = getEventTop(start);
            const height = getEventHeight(start, end);

            return (
              <div
                key={idx}
                onClick={() => alert(`Event: ${event.title}`)}
                className="absolute left-2 right-2 bg-blue-500 text-white rounded px-2 py-1 text-xs truncate cursor-pointer hover:bg-blue-600 transition"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                }}
              >
                <strong>{event.title}</strong>
                <div className="text-[10px] truncate">{event.location}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
