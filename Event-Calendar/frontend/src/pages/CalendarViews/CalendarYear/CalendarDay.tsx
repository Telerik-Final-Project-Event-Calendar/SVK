import React from "react";
import dayjs from "dayjs";

interface Props {
  day: number;
  year: number;
  month: number;
}

const CalendarDay: React.FC<Props> = ({ day, year, month }) => {
  const today = dayjs();
  const date = dayjs(new Date(year, month, day));
  const isToday = date.isSame(today, "day");

  return (
    <div
      className={`h-8 w-8 flex items-center justify-center rounded-full mx-auto ${
        isToday ? "bg-blue-500 text-white font-bold" : "hover:bg-gray-200"
      }`}
    >
      {day}
    </div>
  );
};

export default CalendarDay;