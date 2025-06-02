import React, { useContext } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { AppContext } from "../../state/app.context";

function getStartOfCalendarGrid(date: Date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstOfMonth.getDay(); 
  return new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - dayOfWeek);
}

function getCalendarGridDates(date: Date) {
  const start = getStartOfCalendarGrid(date);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    days.push(current);
  }
  return days;
}

export default function MonthlyCalendar() {
  const { selectedDate, setSelectedDate } = useContext(CalendarContext);
  const validSelectedDate = selectedDate instanceof Date ? selectedDate : new Date();
  const gridDates = getCalendarGridDates(validSelectedDate);

  const monthName = validSelectedDate.toLocaleString("default", { month: "long" });
  const year = validSelectedDate.getFullYear();

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={() =>
            setSelectedDate(new Date(validSelectedDate.getFullYear(), validSelectedDate.getMonth() - 1, 1))
          }
          className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          ← Previous Month
        </button>
        <h2 className="text-lg font-semibold">
          {monthName} {year}
        </h2>
        <button
          onClick={() =>
            setSelectedDate(new Date(validSelectedDate.getFullYear(), validSelectedDate.getMonth() + 1, 1))
          }
          className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          Next Month →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 border border-gray-300">
        {gridDates.map((date, index) => {
          const isCurrentMonth = date.getMonth() === validSelectedDate.getMonth();
          return (
            <div
              key={index}
              className={`p-2 border border-gray-200 text-sm h-36 overflow-hidden ${
                isCurrentMonth ? "bg-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              <div className="font-semibold">{date.getDate()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}