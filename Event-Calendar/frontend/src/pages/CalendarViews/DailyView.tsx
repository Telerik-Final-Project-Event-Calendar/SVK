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
                className="absolute left-2 right-2 bg-white border-l-4 border-blue-500 text-gray-800 rounded-md shadow-md px-3 py-2 text-xs cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                }}
                title={event.location} // shows full location on hover
              >
                <div className="font-semibold text-sm truncate">
                  {event.title}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-1">
                  <svg
                    className="w-3 h-3 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  {new Date(event.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(event.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="text-[11px] text-gray-700 mt-1 line-clamp-2">
                  {event.location}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
