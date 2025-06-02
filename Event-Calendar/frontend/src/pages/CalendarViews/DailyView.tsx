import React, { useContext } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { AppContext } from "../../state/app.context";
import DailyHourLabels from "../../components/Calendar/DailyHoursLabels";

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export default function DailyCalendar() {
  const { selectedDate, setSelectedDate } = useContext(CalendarContext);
  const validSelectedDate = selectedDate instanceof Date ? selectedDate : new Date();

  const dayLabel = validSelectedDate.toLocaleDateString("default", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
  <div className="p-4">
    <div className="flex justify-between mb-4 px-2">
      <button
        onClick={() => setSelectedDate(addDays(validSelectedDate, -1))}
        className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
      >
        ← Previous Day
      </button>
      <h2 className="text-lg font-semibold">
        {dayLabel}
      </h2>
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
      <div className="flex-1 border-l border-gray-200">
        {Array.from({ length: 24 }).map((_, hour) => (
          <div
            key={hour}
            className="h-[37.5px] border-b border-gray-200 text-xs px-2 py-1"
          >
          </div>
        ))}
      </div>
    </div>
  </div>
);
}