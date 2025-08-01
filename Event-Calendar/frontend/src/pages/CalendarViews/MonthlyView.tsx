import React, { useContext, useEffect, useState, useMemo, JSX } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { getAllEvents } from "../../services/events.service";
import { categoryStyles } from "../../utils/eventCategoryStyles";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../state/app.context";
import { EventData } from "../../types/event.types";
import { getPublicHolidays, isPublicHoliday, getHolidayName, PublicHoliday } from "../../services/holidays.service";
import { format } from "date-fns";

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

  const [events, setEvents] = useState<EventData[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [loadingCalendarData, setLoadingCalendarData] = useState(true);
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  // Fetch all events once on mount
  useEffect(() => {
    async function fetchCalendarData() {
      setLoadingCalendarData(true);
      try {
        const allEvents: EventData[] = await getAllEvents();

        const filteredEvents = user
          ? allEvents
          : allEvents.filter((event: EventData) => event.isPublic);
        setEvents(filteredEvents);

        const currentYear = validSelectedDate.getFullYear();
        const fetchedHolidays = await getPublicHolidays(currentYear, 'BG');
        setHolidays(fetchedHolidays);

      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setLoadingCalendarData(false);
      }
    }
    fetchCalendarData();
  }, [eventRefreshTrigger, user, validSelectedDate]);

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

  function getEventsForDate(date: Date): EventData[] {
    const isoDate = date.toLocaleDateString("sv-SE");
    return events.filter((event) => event.selectedDate === isoDate);
  }

  const styles = (event: EventData) => {
    const category = event.category || "default";
    return categoryStyles[category] || categoryStyles["default"];
  };

  const handleDateCellClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = format(date, "yyyy-MM-dd");
    navigate(`/all-events?date=${dateKey}`);
  };
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
      <h2 className="text-lg font-semibold" aria-live="polite" aria-atomic="true">
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

    <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2" role="row">
      {WEEK_DAYS.map((day) => (
        <div key={day} className="p-1" role="columnheader">
          {day}
        </div>
      ))}
    </div>

    <div className="grid grid-cols-7 grid-rows-6 border border-gray-300" role="grid">
      {gridDates.map((date, index) => {
        const isCurrentMonth = date.getMonth() === validSelectedDate.getMonth();
        const dayEvents = getEventsForDate(date);
        const isHoliday = isPublicHoliday(date, holidays);
        const holidayName = isHoliday ? getHolidayName(date, holidays) : null;

        return (
          <div
            key={index}
            onClick={() => handleDateCellClick(date)}
            className={`p-2 border border-gray-200 text-sm h-36 overflow-hidden flex flex-col cursor-pointer ${
              isCurrentMonth ? "bg-white" : "bg-gray-100 text-gray-400"
            } ${isHoliday ? "bg-red-50" : ""}`}
            role="gridcell"
            aria-selected={isCurrentMonth}
            tabIndex={-1}
          >
            <div className="font-semibold">{date.getDate()}</div>

            {holidayName && (
              <div
                className="text-xs font-semibold text-red-700 mt-1 px-1 py-[2px] bg-red-100 rounded"
                style={{ whiteSpace: "normal", overflowWrap: "break-word" }}
                title={holidayName}
              >
                {holidayName}
              </div>
            )}

            <div className="relative mt-2 flex flex-col gap-1 overflow-y-auto max-h-[90px] pr-1">
              {dayEvents.map((event: EventData) => {
                const startTime = new Date(event.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const endTime = new Date(event.end).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <Link
                    to={`/event/${event.id}`}
                    key={event.id}
                    onClick={(e) => e.stopPropagation()}
                    className={`rounded-md shadow-md px-3 py-2 text-xs cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all ${
                      styles(event).bg
                    } ${styles(event).border} ${styles(event).text} border-l-4`}
                    title={event.location}
                  >
                    <div className="font-semibold text-sm truncate">{event.title}</div>
                    <div
                      className={`flex items-center gap-1 text-[11px] ${
                        event.category === "deadline" ? "text-white" : "text-gray-600"
                      } mt-1`}
                    >
                      <svg
                        className="w-3 h-3 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {startTime} - {endTime}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

}
