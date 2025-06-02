import React, { useContext, useEffect, useState, useMemo, JSX } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { getAllEvents } from "../../services/events.service";

interface Event {
  id: string;
  title: string;
  selectedDate: string;
  start: string;
  end: string;
}

// Helpers
function getStartOfCalendarGrid(date: Date): Date {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstOfMonth.getDay();
  return new Date(
    firstOfMonth.getFullYear(),
    firstOfMonth.getMonth(),
    1 - dayOfWeek
  );
}

function getCalendarGridDates(date: Date): Date[] {
  const start = getStartOfCalendarGrid(date);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthlyCalendar(): JSX.Element {
  const { selectedDate, setSelectedDate } = useContext(CalendarContext);
  const { eventRefreshTrigger } = useContext(CalendarContext);
  const validSelectedDate =
    selectedDate instanceof Date ? selectedDate : new Date();

  const [events, setEvents] = useState<Event[]>([]);

  // Fetch all events once on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const allEvents = await getAllEvents();
        setEvents(allEvents as Event[]);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    }
    fetchEvents();
  }, [eventRefreshTrigger]);

  const gridDates = useMemo(
    () => getCalendarGridDates(validSelectedDate),
    [validSelectedDate]
  );

  const monthName = validSelectedDate.toLocaleString("default", {
    month: "long",
  });
  const year = validSelectedDate.getFullYear();

  function goToPreviousMonth() {
    setSelectedDate(
      new Date(
        validSelectedDate.getFullYear(),
        validSelectedDate.getMonth() - 1,
        1
      )
    );
  }

  function goToNextMonth() {
    setSelectedDate(
      new Date(
        validSelectedDate.getFullYear(),
        validSelectedDate.getMonth() + 1,
        1
      )
    );
  }

  function getEventsForDate(date: Date): Event[] {
    const isoDate = date.toLocaleDateString("sv-SE");
    return events.filter((event) => event.selectedDate === isoDate);
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
          aria-label="Previous Month"
        >
          ← Previous Month
        </button>
        <h2
          className="text-lg font-semibold"
          aria-live="polite"
          aria-atomic="true"
        >
          {monthName} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
          aria-label="Next Month"
        >
          Next Month →
        </button>
      </div>

      <div
        className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2"
        role="row"
      >
        {WEEK_DAYS.map((day) => (
          <div key={day} className="p-1" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 grid-rows-6 border border-gray-300"
        role="grid"
      >
        {gridDates.map((date, index) => {
          const isCurrentMonth =
            date.getMonth() === validSelectedDate.getMonth();
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={index}
              className={`p-2 border border-gray-200 text-sm h-36 overflow-hidden flex flex-col ${
                isCurrentMonth ? "bg-white" : "bg-gray-100 text-gray-400"
              }`}
              role="gridcell"
              aria-selected={isCurrentMonth}
              tabIndex={-1}
            >
              <div className="font-semibold">{date.getDate()}</div>

              {/* <div className="mt-2 flex flex-col gap-1 overflow-hidden ">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="p-1 text-xs bg-blue-100 text-blue-700 px-1 rounded-md font-medium leading-tight truncate hover:bg-blue-600/20 transition-colors"
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div> */}
              <div className="mt-2 flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => {
                  const startTime = new Date(event.start).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );
                  const endTime = new Date(event.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={event.id}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium leading-tight hover:bg-blue-600/20 transition-colors truncate"
                      title={`${event.title} (${startTime} - ${endTime})`}
                    >
                      <div className="truncate">
                        {startTime} – {endTime}
                      </div>
                      <div className="truncate font-semibold">
                        {event.title}
                      </div>
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
