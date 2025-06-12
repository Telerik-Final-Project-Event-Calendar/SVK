import { useState } from "react";

export interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  visibleItems: T[];
  goToNextPage: () => void;
  goToPrevPage: () => void;
  setPage: (page: number) => void;
}

/**
 * usePagination hook
 *
 * A custom React hook that provides pagination logic for an array of items.
 * It manages the current page, calculates total pages, determines visible items,
 * and provides functions to navigate through pages.
 *
 * @template T The type of items in the array being paginated.
 *
 * Parameters:
 * @param {T[]} items - The array of items to be paginated.
 * @param {number} itemsPerPage - The number of items to display per page.
 *
 * Returns:
 * @returns {PaginationResult<T>} An object containing pagination state and control functions.
 * @property {number} currentPage - The current active page number (1-based index).
 * @property {number} totalPages - The total number of available pages.
 * @property {T[]} visibleItems - An array containing the items visible on the current page.
 * @property {() => void} goToNextPage - Function to navigate to the next page.
 * @property {() => void} goToPrevPage - Function to navigate to the previous page.
 * @property {(page: number) => void} setPage - Function to directly set the current page number.
 *
 * Example usage:
 * ```tsx
 * // In your component:
 * import { usePagination } from '../../hooks/usePagination';
 *
 * // Assuming `data` is an array of items
 * const { currentPage, totalPages, visibleItems, goToNextPage, goToPrevPage } = usePagination(data, 10);
 *
 * return (
 * <div>
 * {visibleItems.map(item => (
 * // Render your item here
 * <div key={item.id}>{item.name}</div>
 * ))}
 * <button onClick={goToPrevPage} disabled={currentPage === 1}>Previous</button>
 * <span>Page {currentPage} of {totalPages}</span>
 * <button onClick={goToNextPage} disabled={currentPage === totalPages}>Next</button>
 * </div>
 * );
 * ```
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number
): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  return {
    currentPage,
    totalPages,
    visibleItems,
    goToNextPage,
    goToPrevPage,
    setPage: setCurrentPage,
  };
}