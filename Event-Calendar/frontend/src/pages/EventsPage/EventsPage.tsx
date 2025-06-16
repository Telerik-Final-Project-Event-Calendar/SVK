import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../state/app.context";
import { EventData } from "../../types/event.types";
import { searchAndFilterEvents } from "../../services/events.service";
import { FiCalendar, FiMapPin, FiUser } from "react-icons/fi";
import {
  categoryStyles,
  categoryLabels,
} from "../../utils/eventCategoryStyles";
import { usePagination } from "../../hooks/usePagination";
import PaginationControls from "../../components/PaginationControls/PaginationControls";

/**
 * EventsPage Component
 *
 * This component displays a list of events, allowing users to search and filter them.
 * It dynamically fetches events based on the current user's login status and
 * a search term provided in the URL query parameters.
 *
 * - Public Events: Always visible to all users (logged in or not).
 * - Private Events: Visible only to the logged-in user who created them.
 *
 * The search functionality filters events by their title and description.
 * Pagination is implemented to display events in manageable chunks.
 * Category filtering is added, allowing users to click on category labels to filter events.
 */
export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const dateFilter = searchParams.get("date") || "";

  const { user, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const [allFilteredEvents, setAllFilteredEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    currentPage,
    totalPages,
    visibleItems: paginatedEvents,
    goToNextPage,
    goToPrevPage,
    setPage,
  } = usePagination(allFilteredEvents, 9);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const fetchedEvents = await searchAndFilterEvents(
        searchTerm,
        user?.uid,
        userData?.handle,
        categoryFilter
      );
      const filteredByDate = dateFilter
        ? fetchedEvents.filter((event) => event.selectedDate === dateFilter)
        : fetchedEvents;
      setAllFilteredEvents(filteredByDate);
      setPage(1);
      setLoading(false);
    };

    loadEvents();
  }, [searchTerm, user, userData, categoryFilter, dateFilter, setPage]);

  const getCategoryStyles = (category?: string) => {
    const styleKey = category || "default";
    return categoryStyles[styleKey] || categoryStyles["default"];
  };

  const handleCategoryClick = (category: string) => {
    const newSearchParams = new URLSearchParams();
    if (searchTerm) {
      newSearchParams.set("q", searchTerm);
    }
    if (dateFilter) {
      newSearchParams.set("date", dateFilter);
    }
    if (searchParams.get("category") === category) {
      newSearchParams.delete("category");
    } else {
      newSearchParams.set("category", category);
    }

    navigate(`/all-events?${newSearchParams.toString()}`);
  };

  const handleClearFilters = () => {
    navigate(`/all-events`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        Discover Events
      </h1>

      <div className="text-center mb-6 space-y-2">
        {searchTerm && (
          <p className="text-gray-600">
            Showing results for: <strong className="text-blue-600">"{searchTerm}"</strong>
          </p>
        )}
        {categoryFilter && (
          <p className="text-gray-600">
            Filtered by category: <strong className="text-purple-600 capitalize">
              "{categoryLabels[categoryFilter] || categoryFilter}"
            </strong>
          </p>
        )}
        {dateFilter && (
          <p className="text-gray-600">
            Filtered by date: <strong className="text-green-600">{dateFilter}</strong>
          </p>
        )}
        {(searchTerm || categoryFilter || dateFilter) && (
          <button
            onClick={handleClearFilters}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {Object.keys(categoryLabels).map((key) => (
          <button
            key={key}
            onClick={() => handleCategoryClick(key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer 
              ${categoryStyles[key]?.bg || categoryStyles["default"].bg} 
              ${categoryStyles[key]?.text || categoryStyles["default"].text}
              ${
                categoryFilter === key
                  ? "ring-2 ring-offset-2 ring-blue-500"
                  : "hover:scale-105"
              }
            `}
          >
            {categoryLabels[key]}
          </button>
        ))}
      </div>

      {paginatedEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-2xl text-gray-500">No events found matching your criteria.</p>
          <p className="text-lg text-gray-400 mt-2">Try a different search or check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedEvents.map((event) => (
            <Link
              to={`/event/${event.id}`}
              key={event.id}
              className={`bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border-t-4 
                ${getCategoryStyles(event.category).border}
              `}
            >
              {event.imageUrl && event.imageUrl.trim() !== "" && (
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                    {event.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p className="flex items-center">
                      <FiCalendar className="mr-2 text-blue-500" />
                      {new Date(event.start).toLocaleString()}
                    </p>
                    <p className="flex items-center">
                      <FiMapPin className="mr-2 text-green-500" />
                      {event.location}
                    </p>
                    <p className="flex items-center">
                      <FiUser className="mr-2 text-purple-500" />
                      {event.handle}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      getCategoryStyles(event.category).bg
                    } ${getCategoryStyles(event.category).text}`}
                  >
                    {event.category || "General"}
                  </span>
                  {event.isSeries && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      Series
                    </span>
                  )}
                  {!event.isPublic && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800">
                      Private
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={goToPrevPage}
        onNext={goToNextPage}
      />
    </div>
  );
}