type Props = {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
};

export default function CalendarHeader({ currentDate, onPrev, onNext }: Props) {
  const monthYear = currentDate.toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex justify-between items-center mb-4">
      <button onClick={onPrev} className="px-2 py-1 text-gray-600">&lt;</button>
      <h2 className="text-lg font-semibold">{monthYear}</h2>
      <button onClick={onNext} className="px-2 py-1 text-gray-600">&gt;</button>
    </div>
  );
}