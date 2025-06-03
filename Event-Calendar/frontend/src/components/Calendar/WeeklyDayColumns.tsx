import React from "react";

// const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// function addDays(date: Date, days: number) {
//   return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
// }

// interface WeeklyDayColumnsProps {
//   weekStart: Date;
// }

// export default function WeeklyDayColumns({ weekStart }: WeeklyDayColumnsProps) {
//   return (
//     <>
//       {Array.from({ length: 7 }, (_, d) => {
//         const dayDate = addDays(weekStart, d);
//         return (
//           <div
//             key={d}
//             className="relative flex-1 border-l border-gray-300"
//             style={{ height: "1152px" }}
//           >
//             <div className="sticky top-0 bg-white border-b border-gray-300 p-1 text-center font-semibold text-sm">
//               {DAY_NAMES[dayDate.getDay()]}, {dayDate.getDate()}
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// }

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PIXELS_PER_MINUTE = 0.8;

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

interface WeeklyDayColumnsProps {
  weekStart: Date;
  events: any[];
}

export default function WeeklyDayColumns({
  weekStart,
  events,
}: WeeklyDayColumnsProps) {
  return (
    <>
      {Array.from({ length: 7 }, (_, d) => {
        const dayDate = addDays(weekStart, d);
        const dayStr = dayDate.toLocaleDateString("sv-SE");
        const dayEvents = events.filter((e) => e.selectedDate === dayStr);

        return (
          <div
            key={d}
            className="relative flex-1 border-l border-gray-300"
            style={{ height: "1152px" }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-300 p-1 text-center font-semibold text-sm">
              {DAY_NAMES[dayDate.getDay()]}, {dayDate.getDate()}
            </div>

            {dayEvents.map((event, i) => {
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);

              const startMin =
                startDate.getHours() * 60 + startDate.getMinutes();
              const endMin = endDate.getHours() * 60 + endDate.getMinutes();
              const top = startMin * PIXELS_PER_MINUTE;
              const height = (endMin - startMin) * PIXELS_PER_MINUTE;

              return (
                <div
                  key={i}
                  className="absolute bg-blue-500 text-white text-xs rounded px-2 py-1 shadow"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: "4px",
                    right: "4px",
                  }}
                >
                  <strong>{event.handle}</strong>
                  <div className="text-[10px]">
                    {startDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {endDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="truncate text-[10px]">
                    {event.description}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
