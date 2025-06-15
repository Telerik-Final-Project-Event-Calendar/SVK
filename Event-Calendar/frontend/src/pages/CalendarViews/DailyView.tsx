import React, { useContext, useEffect, useState } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { AppContext } from "../../state/app.context";
import DailyHourLabels from "../../components/Calendar/DailyHoursLabels";
import { getAllEventsForDate } from "../../services/events.service";
import { format } from "date-fns/fp";
import { categoryStyles } from "../../utils/eventCategoryStyles";
import { Link } from "react-router-dom";
import { EventData } from "../../types/event.types";

export default function DailyCalendar() {
  const { selectedDate, setSelectedDate } = useContext(CalendarContext);
  const validSelectedDate =
    selectedDate instanceof Date ? selectedDate : new Date();
  const [events, setEvents] = useState<EventData[]>([]);
  const dateKey = format("yyyy-MM-dd", validSelectedDate);

  const { eventRefreshTrigger } = useContext(CalendarContext);

  const { user } = useContext(AppContext);

  const dayLabel = validSelectedDate.toLocaleDateString("default", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const loadEvents = async () => {
      const dayEvents: EventData[] = await getAllEventsForDate(dateKey);

      const filteredEvents = user
        ? dayEvents
        : dayEvents.filter((event: EventData) => event.isPublic);
      setEvents(filteredEvents);
    };

    loadEvents();
  }, [dateKey, eventRefreshTrigger, user]);

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

  const styles = (event: EventData) => {
    const category = event.category || "default";
    return categoryStyles[category] || categoryStyles["default"];
  };

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

          {events.map((event: EventData, idx) => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            const top = getEventTop(start);
            const height = getEventHeight(start, end);

            return (
              <Link
                to={`/event/${event.id}`}
                key={idx}
                className={`absolute left-2 right-2 rounded-md shadow-md px-3 py-2 text-xs cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all
                  ${styles(event).bg} ${styles(event).border} ${
                  styles(event).text
                } border-l-4`}
                style={{
                  top: `${top}px`,
                  minHeight: `${height}px`,
                }}
                title={event.location}
              >
                <div className="font-semibold text-sm truncate">
                  {event.title}
                </div>

                <div
                  className={`flex items-center gap-1 text-[11px] ${
                    event.category === "deadline"
                      ? "text-white"
                      : "text-gray-600"
                  } mt-1`}
                >
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
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
