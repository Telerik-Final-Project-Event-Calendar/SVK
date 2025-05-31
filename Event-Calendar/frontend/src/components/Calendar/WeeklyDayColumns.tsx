import React from "react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

interface WeeklyDayColumnsProps {
  weekStart: Date;
}

export default function WeeklyDayColumns({ weekStart }: WeeklyDayColumnsProps) {
  return (
    <>
      {Array.from({ length: 7 }, (_, d) => {
        const dayDate = addDays(weekStart, d);
        return (
          <div
            key={d}
            className="relative flex-1 border-l border-gray-300"
            style={{ height: "1152px" }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-300 p-1 text-center font-semibold text-sm">
              {DAY_NAMES[dayDate.getDay()]}, {dayDate.getDate()}
            </div>
          </div>
        );
      })}
    </>
  );
}