import React from "react";

const HOURS_IN_DAY = 24;

export default function HourLabels() {
  return (
    <>
      {Array.from({ length: HOURS_IN_DAY }, (_, h) => (
        <div
          key={h}
          className="hour-label border-b border-gray-200 h-12 px-1 text-xs text-gray-600"
        >
          {h === 0
            ? "12 AM"
            : h < 12
            ? `${h} AM`
            : h === 12
            ? "12 PM"
            : `${h - 12} PM`}
        </div>
      ))}
    </>
  );
}
