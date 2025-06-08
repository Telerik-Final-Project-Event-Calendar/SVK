import React from "react";
import dayjs from "dayjs";
import CalendarDay from "./CalendarDay";

interface Props {
  year: number;
  month: number; 
}

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarMonth: React.FC<Props> = ({ year, month }) => {
  const startDate = dayjs(new Date(year, month, 1));
  const daysInMonth = startDate.daysInMonth();
  const startDay = startDate.day(); // 0 = Sunday

  const blankDays = Array.from({ length: startDay });
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = startDate.format("MMMM");

  return (
    <div className="border rounded-xl shadow-md p-4">
      <h2 className="text-xl font-semibold text-center mb-2">{monthName}</h2>
      <div className="grid grid-cols-7 text-xs text-center font-medium text-gray-600 mb-1">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-sm text-center gap-1">
        {blankDays.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {monthDays.map((day) => (
          <CalendarDay key={day} day={day} year={year} month={month} />
        ))}
      </div>
    </div>
  );
};

export default CalendarMonth;