type Props = {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

export default function CalendarGrid({
  currentDate,
  selectedDate,
  onSelectDate,
}: Props) {
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const startDay = startOfMonth.getDay();

  const daysInMonth = endOfMonth.getDate();
  const today = new Date();

  const dates = [];
  for (let i = 0; i < startDay; i++) {
    dates.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
  }

  return (
    <div className="grid grid-cols-7 gap-2 text-center">
      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
        <div key={d} className="text-sm font-medium text-gray-500">
          {d}
        </div>
      ))}

      {dates.map((date, idx) => {
        if (!date) {
          return <div key={idx}></div>;
        }

        const isToday = date.toDateString() === today.toDateString();
        const isSelected =
          selectedDate && date.toDateString() === selectedDate.toDateString();

        return (
          <button
            key={idx}
            onClick={() => onSelectDate(date)}
            className={`p-2 rounded-full w-10 h-10
              ${isSelected ? "bg-blue-600 text-white" : ""}
              ${isToday ? "border border-blue-500" : ""}
              hover:bg-blue-100`}
          >
            {date.getDate()}
          </button>
        );
      })}
    </div>
  );
}
