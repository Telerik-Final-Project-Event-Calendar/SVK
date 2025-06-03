import {
  categoryStyles,
  categoryIcons,
  categoryLabels,
} from "../../utils/eventCategoryStyles";

export default function EventLegend() {
  const categories = Object.keys(categoryLabels);

  return (
    <div className="mt-6 px-4 py-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        📘 Event Legend
      </h3>
      <div className="flex flex-wrap gap-3">
        {categories.map((key) => {
          const style = categoryStyles[key];
          const icon = categoryIcons[key];
          const label = categoryLabels[key];

          return (
            <div
              key={key}
              className={`flex items-center gap-2 px-3 py-1 rounded-md border-l-4 ${style.bg} ${style.border} ${style.text}`}
            >
              <span className="text-base">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
