import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchUserEvents } from "../../services/events.service";
import { FiCalendar, FiMapPin, FiTag, FiEye, FiEdit2 } from "react-icons/fi";

const EVENTS_PER_PAGE = 6;

export const UserEvents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const creator = searchParams.get("creator");

  const [events, setEvents] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadEvents = async () => {
      if (!creator) return;

      const userEvents = await fetchUserEvents(creator);
      setEvents(userEvents);
    };

    loadEvents();
  }, [creator]);

  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const visibleEvents = events.slice(startIndex, startIndex + EVENTS_PER_PAGE);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 bg-gradient-to-tr from-gray-50 via-white to-gray-50 min-h-screen">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-gray-900 tracking-wide">
        {creator.toUpperCase()}'S EVENTS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className="relative bg-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] transition-transform duration-300 border border-gray-200 overflow-hidden"
          >
            <div className="p-7">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-3xl font-semibold text-gray-800 tracking-tight">
                  {event.title || "Untitled Event"}
                </h3>
                <span
                  className={`uppercase text-xs font-bold px-4 py-1 rounded-full tracking-widest select-none ${
                    event.isPublic
                      ? "text-green-700 bg-green-100"
                      : "text-red-700 bg-red-100"
                  }`}
                >
                  {event.isPublic ? "PUBLIC" : "PRIVATE"}
                </span>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed tracking-wide">
                {event.description || "No description provided."}
              </p>

              <div className="space-y-4 text-gray-700 text-sm">
                <p className="flex items-center gap-3 uppercase font-semibold text-indigo-600 tracking-wide">
                  <FiTag className="w-6 h-6" />
                  <span>{event.category}</span>
                </p>
                <p className="flex items-center gap-3 text-pink-600 font-medium">
                  <FiMapPin className="w-5 h-5" />
                  <span>{event.location || "Location not specified"}</span>
                </p>
                <p className="flex items-center gap-3 text-blue-600 font-medium">
                  <FiCalendar className="w-5 h-5" />
                  <span>
                    <strong>Start:</strong>{" "}
                    {new Date(event.start).toLocaleString()}
                  </span>
                </p>
                <p className="flex items-center gap-3 text-blue-600 font-medium">
                  <FiCalendar className="w-5 h-5" />
                  <span>
                    <strong>End:</strong> {new Date(event.end).toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="mt-8 flex gap-6 justify-center">
                <button
                  onClick={() => console.log("View", event.id)}
                  className="flex items-center gap-2 px-7 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-600 hover:text-white transition-colors duration-300 shadow-md"
                >
                  <FiEye className="w-5 h-5" />
                  View
                </button>
                <button
                  onClick={() => console.log("Edit", event.id)}
                  className="flex items-center gap-2 px-7 py-3 border-2 border-pink-600 text-pink-600 font-semibold rounded-full hover:bg-pink-600 hover:text-white transition-colors duration-300 shadow-md"
                >
                  <FiEdit2 className="w-5 h-5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <p className="text-center text-gray-500 mt-16 text-lg font-medium">
          No events to show.
        </p>
      )}

      {events.length > EVENTS_PER_PAGE && (
        <div className="flex justify-center mt-12 gap-8">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-8 py-3 rounded-full font-semibold tracking-wide transition ${
              currentPage === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
            }`}
          >
            Previous
          </button>
          <span className="self-center text-gray-700 font-semibold tracking-wide">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-8 py-3 rounded-full font-semibold tracking-wide transition ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
