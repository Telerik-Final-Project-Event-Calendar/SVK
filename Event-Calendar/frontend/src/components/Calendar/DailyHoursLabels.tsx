export default function DailyHourLabels() {
  return (
    <>
      {Array.from({ length: 24 }, (_, h) => (
        <div
          key={h}
          className="hour-label border-b border-gray-200 h-[37.5px] px-1 text-xs text-gray-600 select-none"
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