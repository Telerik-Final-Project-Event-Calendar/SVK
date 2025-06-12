import React from "react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * PaginationControls component
 *
 * A reusable functional component that provides navigation controls for paginated content.
 * It displays the current page number relative to the total number of pages and
 * enables/disables "Previous" and "Next" buttons based on the current page.
 * The component will not render if there is only one or zero total pages.
 *
 * Props:
 * @param {number} currentPage - The currently active page number (1-based index).
 * @param {number} totalPages - The total number of available pages.
 * @param {() => void} onPrev - Callback function to be executed when the "Previous" button is clicked.
 * @param {() => void} onNext - Callback function to be executed when the "Next" button is clicked.
 *
 * Behavior:
 * - **Visibility:** The entire component is hidden if `totalPages` is less than or equal to 1.
 * - **"Previous" Button:** Enabled when `currentPage` is greater than 1; disabled otherwise.
 * - **"Next" Button:** Enabled when `currentPage` is less than `totalPages`; disabled otherwise.
 * - **Styling:** Uses Tailwind CSS for responsive and modern button styling, including hover effects.
 *
 * Example usage:
 * ```tsx
 * <PaginationControls
 * currentPage={myCurrentPage}
 * totalPages={myTotalPages}
 * onPrev={handlePrevPage}
 * onNext={handleNextPage}
 * />
 * ```
 */
const PaginationControls: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 gap-6">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
          currentPage === 1
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
        }`}
      >
        Previous
      </button>

      <span className="self-center text-gray-700 font-medium text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
          currentPage === totalPages
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;