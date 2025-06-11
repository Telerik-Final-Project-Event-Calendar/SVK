import { Link } from "react-router-dom";
import { categoryStyles } from "../../utils/eventCategoryStyles";
import { useContext } from "react";
import { AppContext } from "../../state/app.context";

const styles = (event: any) => {
  const category = event.category || "default";
  return categoryStyles[category] || categoryStyles["default"];
};

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
  const { user } = useContext(AppContext);

  return (
    <>
      {Array.from({ length: 7 }, (_, d) => {
        const dayDate = addDays(weekStart, d);
        const dayStr = dayDate.toLocaleDateString("sv-SE");
        const dayEvents = events
          .filter((e) => e.selectedDate === dayStr)
          .filter((e) => user || e.isPublic);

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
                <Link
                  to={`/event/${event.id}`}
                  key={i}
                  className={`absolute text-xs rounded-md shadow-md px-3 py-2 transition-all hover:shadow-lg hover:scale-[1.01]
                    ${styles(event).bg} ${styles(event).border} ${
                    styles(event).text
                  } border-l-4`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: "6px",
                    right: "6px",
                  }}
                  title={event.location} // Tooltip with address
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">
                      {event.handle}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-1 text-[11px] ${
                      event.category === "deadline"
                        ? "text-white"
                        : "text-gray-600"
                    } mt-1`}
                  >
                    <svg
                      className="w-3 h-3 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l4 2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
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
                </Link>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
