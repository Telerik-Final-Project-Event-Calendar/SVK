import React, { useContext, useEffect, useState } from "react";
import { CalendarContext } from "../../state/calendar.context";
import { AppContext } from "../../state/app.context";
import HourLabels from "../../components/Calendar/HoursLabels";
import WeeklyDayColumns from "../../components/Calendar/WeeklyDayColumns";

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


  const validSelectedDate =
    selectedDate instanceof Date ? selectedDate : new Date();
  const weekStart = startOfWeek(validSelectedDate);

  

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
          <WeeklyDayColumns weekStart={weekStart} />
        </div>
      </div>
    </div>
  );
}