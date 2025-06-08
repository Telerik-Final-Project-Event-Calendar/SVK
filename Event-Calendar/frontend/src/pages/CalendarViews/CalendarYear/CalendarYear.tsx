import React from "react";
import CalendarMonth from "./CalendarMonth";

const CalendarYear: React.FC = () => {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const year = new Date().getFullYear();

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {months.map((monthIndex) => (
          <CalendarMonth key={monthIndex} year={year} month={monthIndex} />
        ))}
      </div>
    </div>
  );
};

export default CalendarYear;