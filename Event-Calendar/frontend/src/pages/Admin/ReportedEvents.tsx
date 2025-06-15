import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../state/app.context";
import { useNavigate, Link } from "react-router-dom";
import {
  fetchReportedEvents,
  markEventReportReviewed,
} from "../../services/eventReports.service";
import {
  deleteEvent as deleteSingleEventFromAdmin,
  deleteEventSeries as deleteEventSeriesFromAdmin,
} from "../../services/admin.service";
import { EventData } from "../../types/event.types";
import { FiFlag, FiEye, FiTrash2, FiCheckCircle } from "react-icons/fi";
import PaginationControls from "../../components/PaginationControls/PaginationControls";
import { usePagination } from "../../hooks/usePagination";

interface ReportData {
  reportedBy: string;
  reason: string;
  createdOn: number;
}

interface EventReportItem {
  eventId: string;
  reportId: string;
  report: ReportData;
  event: EventData & { seriesName?: string };
}

interface GroupedReports {
  [eventId: string]: EventReportItem[];
}

interface ReportedEventsProps {
  onReportAction: () => void;
}

/**
 * ReportedEvents Component
 *
 * A React functional component designed for the administrative panel to display and manage reported events.
 * It fetches event reports, groups them by event, and provides functionalities for reviewing
 * individual reports or deleting entire events/series along with their associated reports.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {() => void} props.onReportAction - A callback function invoked after an action (e.g., deleting an event, marking a report as reviewed)
 * to signal the parent component (AdminPanel) to refresh its report statistics.
 *
 * @returns {React.FC<ReportedEventsProps>} A React functional component.
 *
 * State:
 * - `reportsByEvent`: An object (`GroupedReports`) mapping `eventId` to an array of `EventReportItem`s,
 * representing all reports for a given event.
 *
 * Effects:
 * - Fetches all reported events on component mount and when `userData` or `navigate` dependencies change.
 * - Groups the fetched reports by `eventId` for display.
 * - Redirects non-admin users to the home page (`/`).
 *
 * Functions:
 * - `fetchAndGroupReports()`: Asynchronously fetches all event reports and event data (including series name if applicable)
 * and groups them into `reportsByEvent` state.
 * - `handleDeleteSingleEvent(eventId: string, eventTitle: string)`: Handles the deletion of a single event occurrence.
 * Prompts for confirmation, calls `deleteEvent` service, updates local state, and triggers `onReportAction`.
 * - `handleDeleteEventSeries(seriesId: string, eventTitle: string)`: Handles the deletion of an entire event series.
 * Prompts for confirmation, calls `deleteEventSeries` service, refetches all reports to update state,
 * and triggers `onReportAction`.
 * - `handleReview(eventId: string, reportId: string)`: Marks a specific report as reviewed by deleting it from Firebase.
 * Updates local state by removing the specific report and potentially the entire event group if no reports remain.
 * Triggers `onReportAction`.
 *
 * Features:
 * - **Admin Access Control:** Only accessible by users with `isAdmin` privileges; redirects otherwise.
 * - **Report Grouping:** Displays reports grouped by the event they refer to, showing event title, author, and series name.
 * - **Individual Report Details:** For each event, lists individual reports with reporter, reason, and timestamp.
 * - **Action Buttons:**
 * - `View`: Links to the detailed page of the reported event.
 * - `Delete`: For non-series events, deletes the event and all its reports.
 * - `Delete` (for series events): Deletes only the specific occurrence and its reports.
 * - `Delete all from series` (for series events): Deletes the entire series (all occurrences) and all their reports.
 * - `Mark as Reviewed`: Deletes a specific report, signaling it has been addressed.
 * - **Pagination:** Uses the `usePagination` hook to paginate through the list of reported events (grouped by event ID).
 * - **Conditional Rendering:** Adapts button visibility based on whether the event is a single event or part of a series.
 *
 * Usage Example:
 * This component is typically used within an administrative dashboard, such as `AdminPanel.tsx`.
 *
 * ```tsx
 * import React from 'react';
 * import ReportedEvents from '../components/ReportedEvents/ReportedEvents'; // Adjust path
 *
 * function AdminPanel() {
 * const handleReportAction = () => {
 * // Logic to update report statistics in the AdminPanel
 * console.log('Report action completed. Refreshing stats...');
 * };
 *
 * return (
 * <div>
 * <h1>Admin Dashboard</h1>
 * {/* ... other admin sections *\/}
 * <ReportedEvents onReportAction={handleReportAction} />
 * </div>
 * );
 * }
 * ```
 */
export default function ReportedEvents({
  onReportAction,
}: ReportedEventsProps) {
  const { userData } = useContext(AppContext);
  const [reportsByEvent, setReportsByEvent] = useState<GroupedReports>({});
  const navigate = useNavigate();

  const fetchAndGroupReports = async () => {
    const compiled = await fetchReportedEvents();
    const grouped: GroupedReports = {};

    for (const item of compiled) {
      const { eventId } = item;
      if (!grouped[eventId]) {
        grouped[eventId] = [];
      }
      grouped[eventId].push(item);
    }
    setReportsByEvent(grouped);
  };

  useEffect(() => {
    if (!userData?.isAdmin) {
      navigate("/");
      return;
    }

    fetchAndGroupReports();
  }, [userData, navigate]);

  const handleDeleteSingleEvent = async (
    eventId: string,
    eventTitle: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete only this event: "${eventTitle}"? This will also remove all related reports.`
      )
    ) {
      try {
        await deleteSingleEventFromAdmin(eventId);
        setReportsByEvent((prev) => {
          const updated = { ...prev };
          delete updated[eventId];
          return updated;
        });
        onReportAction();
        alert("Event and its reports deleted successfully!");
      } catch (error) {
        console.error("Failed to delete event and reports:", error);
        alert("An error occurred while deleting the event and its reports.");
      }
    }
  };

  const handleDeleteEventSeries = async (
    seriesId: string,
    eventTitle: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete the entire series: "${eventTitle}"? This will delete all occurrences and their reports.`
      )
    ) {
      try {
        await deleteEventSeriesFromAdmin(seriesId);
        await fetchAndGroupReports();
        onReportAction();
        alert(
          "Event series and all its occurrences/reports deleted successfully!"
        );
      } catch (error) {
        console.error("Failed to delete event series and reports:", error);
        alert(
          "An error occurred while deleting the event series and its reports."
        );
      }
    }
  };

  const handleReview = async (eventId: string, reportId: string) => {
    try {
      await markEventReportReviewed(eventId, reportId);
      setReportsByEvent((prev) => {
        const updated = { ...prev };
        if (updated[eventId]) {
          updated[eventId] = updated[eventId].filter(
            (r) => r.reportId !== reportId
          );
          if (updated[eventId].length === 0) {
            delete updated[eventId];
          }
        }
        return updated;
      });
      onReportAction();
    } catch (error) {
      console.error("Failed to mark report as reviewed:", error);
      alert("❌ Failed to mark report as reviewed. Please try again.");
    }
  };

  const eventIds = Object.keys(reportsByEvent);

  const {
    currentPage,
    totalPages,
    visibleItems: visibleReportedEvents,
    goToNextPage,
    goToPrevPage,
  } = usePagination(eventIds, 3);

  return (
    <div className="p-4">
      {eventIds.length === 0 ? (
        <p className="text-gray-600 mt-4 text-center">
          No event reports available.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {visibleReportedEvents.map((eventId) => {
            const reports = reportsByEvent[eventId];
            const event = reports[0].event;

            return (
              <div
                key={eventId}
                className="border border-gray-300 rounded-lg p-6 bg-gray-50 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                <div className="md:w-72 flex-none">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-700 text-sm font-light mb-2">
                    <strong>Author:</strong> {event.handle}
                  </p>

                  {event.isSeries && (
                    <p className="text-gray-700 text-sm font-light mb-2">
                      <strong>Series:</strong> {event.seriesName || "N/A"}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-4">
                    <Link
                      to={`/event/${eventId}`}
                      className="flex items-center gap-2 px-3 py-1 border rounded-full border-indigo-600 text-indigo-600 font-semibold text-xs hover:bg-indigo-600 hover:text-white transition-colors duration-300 shadow-sm">
                      <FiEye className="w-3 h-3" /> View
                    </Link>

                    {event.isSeries && event.seriesId ? (
                      <>
                        <button
                          onClick={() =>
                            handleDeleteSingleEvent(event.id, event.title)
                          }
                          className="flex items-center gap-2 px-3 py-1 border rounded-full border-red-500 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition duration-300 shadow-sm"
                          title="Delete only this event occurrence and its reports">
                          <FiTrash2 className="w-4 h-4" /> Delete
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteEventSeries(
                              event.seriesId!,
                              event.title
                            )
                          }
                          className="flex items-center gap-2 px-3 py-1 border rounded-full border-red-500 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition duration-300 shadow-sm"
                          title="Delete the entire series and all its reports">
                          <FiTrash2 className="w-4 h-4" /> Delete all from
                          series
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          handleDeleteSingleEvent(event.id, event.title)
                        }
                        className="flex items-center gap-2 px-3 py-1 border rounded-full border-red-500 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition duration-300 shadow-sm"
                        title="Delete event and its reports">
                        <FiTrash2 className="w-4 h-4" /> Delete Event
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-row flex-wrap gap-y-4 gap-x-4">
                  {reports.map(({ report, reportId }) => (
                    <div
                      key={reportId}
                      className="bg-white border border-gray-200 p-4 rounded-md shadow-sm w-full sm:w-[calc(33.3333%-0.6666rem)]">
                      <p className="text-gray-700 text-sm font-light mb-1">
                        <strong>Reported by:</strong> {report.reportedBy}
                      </p>
                      <p className="text-gray-700 text-sm font-light mb-2">
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Reported on:{" "}
                        {new Date(report.createdOn).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleReview(eventId, reportId)}
                        className="inline-flex items-center gap-2 mt-3 px-3 py-1 border rounded-full border-green-600 text-green-600 font-semibold text-xs hover:bg-green-600 hover:text-white transition-colors duration-300 shadow-sm">
                        <FiCheckCircle className="w-3 h-3" /> Mark as Reviewed
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
