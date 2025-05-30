import React, { useContext, useEffect, useState } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { AppContext } from "../../state/app.context";
import { db } from "../../config/firebase-config";
import { ref, get } from "firebase/database";
import { getUserByUID } from "../../services/users.service";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
}

const HOURS_IN_DAY = 24;
const WEEK_DAYS = 7;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const { user, userData } = useContext(AppContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const validSelectedDate =
    selectedDate instanceof Date ? selectedDate : new Date();
  const weekStart = startOfWeek(validSelectedDate);

  useEffect(() => {
    if (!user || !userData?.handle || !selectedDate || view !== "weekly") {
      setEvents([]);
      setLoading(false);
      return;
    }

    async function fetchEvents() {
      setLoading(true);
      try {
        const resolvedUser = await getUserByUID(user.uid);
        const eventsRef = ref(db, `users/${resolvedUser.handle}/events`);
        const snapshot = await get(eventsRef);

        if (!snapshot.exists()) {
          setEvents([]);
          return;
        }

        const allEvents = snapshot.val();
        const filtered: Event[] = [];

        for (const key in allEvents) {
          const event = allEvents[key];
          if (!event.start) continue;

          const eventStart = new Date(event.start);
          if (
            eventStart >= weekStart &&
            eventStart < addDays(weekStart, WEEK_DAYS)
          ) {
            filtered.push({ id: key, ...event });
          }
        }

        setEvents(filtered);
      } catch (err) {
        console.error("Failed to load events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [user, userData, selectedDate, view]);

  const hoursLabels = Array.from({ length: HOURS_IN_DAY }, (_, h) => (
    <div
      key={h}
      className="hour-label border-b border-gray-200 h-12 px-1 text-xs text-gray-600"
    >
      {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
    </div>
  ));

  const dayColumns = Array.from({ length: WEEK_DAYS }, (_, d) => {
    const dayDate = addDays(weekStart, d);

    const dayEvents = events.filter((e) => {
      const start = new Date(e.start);
      return (
        start.getFullYear() === dayDate.getFullYear() &&
        start.getMonth() === dayDate.getMonth() &&
        start.getDate() === dayDate.getDate()
      );
    });

    const eventElements = dayEvents.map((event) => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      const startHour = startDate.getHours() + startDate.getMinutes() / 60;
      const durationHours =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

      return (
        <div
          key={event.id}
          className="absolute left-1 right-1 bg-blue-500 text-white rounded px-1 text-xs overflow-hidden"
          style={{
            top: startHour * 48,
            height: durationHours * 48,
            zIndex: 10,
          }}
          title={`${event.title}\n${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`}
        >
          {event.title}
        </div>
      );
    });

    return (
      <div key={d} className="relative flex-1 border-l border-gray-300">
        <div className="sticky top-0 bg-white border-b border-gray-300 p-1 text-center font-semibold text-sm">
          {DAY_NAMES[dayDate.getDay()]}, {dayDate.getDate()}
        </div>
        <div className="relative h-[1152px]">{eventElements}</div>
      </div>
    );
  });

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
          {hoursLabels}
        </div>
        <div className="flex flex-1">{dayColumns}</div>
      </div>
    </div>
  );
}