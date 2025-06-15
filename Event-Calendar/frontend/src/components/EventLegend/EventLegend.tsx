import {
  categoryStyles,
  categoryIcons,
  categoryLabels,
} from "../../utils/eventCategoryStyles";
import { useSearchParams } from 'react-router-dom';

interface EventLegendProps {
  onCategoryClick: (category: string) => void;
}

export default function EventLegend({ onCategoryClick }: EventLegendProps) {
  const categories = Object.keys(categoryLabels);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

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
          const isActive = activeCategory === key;

          return (
            <button
              key={key}
              onClick={() => onCategoryClick(key)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md border-l-4 transition-all duration-200 cursor-pointer 
                ${style.bg} ${style.border} ${style.text} 
                ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-[1.02]'}
                text-sm font-medium
              `}
              title={`Filter by ${label} events`}
            >
              <span className="text-base">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
