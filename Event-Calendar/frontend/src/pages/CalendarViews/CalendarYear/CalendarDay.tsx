import React from "react";
import { CalendarContext } from "../../../state/calendar.context";
import { useContext } from "react";

interface Props {
  day: number;
  year: number;
  month: number;
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const CalendarDay: React.FC<Props> = ({ day, year, month }) => {
  const { selectedDate, setSelectedDate } = useContext(CalendarContext);

  const date = new Date(year, month, day);
  const isSelected = selectedDate && isSameDay(date, selectedDate);

  const baseClasses =
    "h-8 w-8 flex items-center justify-center rounded-full mx-auto cursor-pointer";

  const activeClasses = isSelected ? "bg-blue-500 text-white font-bold" : "hover:bg-gray-200";

  return (
    <div
      className={`${baseClasses} ${activeClasses}`}
      onClick={() => setSelectedDate(date)}
    >
      {day}
    </div>
  );
};

export default CalendarDay;