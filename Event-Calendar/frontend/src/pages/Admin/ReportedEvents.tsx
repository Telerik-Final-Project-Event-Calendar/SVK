import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../state/app.context";
import { useNavigate, Link } from "react-router-dom";
import {
  fetchReportedEvents,
  markEventReportReviewed,
  deleteReportedEvent,
} from "../../services/eventReports.service";
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
  event: {
    title: string;
    handle: string;
    id: string;
  };
}

interface GroupedReports {
  [eventId: string]: EventReportItem[];
}

interface ReportedEventsProps {
  onReportAction: () => void;
}

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

  const handleDelete = async (eventId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this event and all associated reports?"
      )
    ) {
      try {
        await deleteReportedEvent(eventId);
        setReportsByEvent((prev) => {
          const updated = { ...prev };
          delete updated[eventId];
          return updated;
        });
        onReportAction();
      } catch (error) {
        console.error("Failed to delete event and reports:", error);
        alert("An error occurred while deleting the event.");
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

                  <div className="flex items-center gap-3 mt-4">
                    <Link
                      to={`/event/${eventId}`}
                      className="flex items-center gap-2 px-3 py-1 border rounded-full border-indigo-600 text-indigo-600 font-semibold text-xs hover:bg-indigo-600 hover:text-white transition-colors duration-300 shadow-sm">
                      <FiEye className="w-3 h-3" /> View
                    </Link>

                    <button
                      onClick={() => handleDelete(eventId)}
                      className="flex items-center gap-2 px-3 py-1 border rounded-full border-red-600 text-red-600 font-semibold text-xs hover:bg-red-600 hover:text-white transition-colors duration-300 shadow-sm">
                      <FiTrash2 className="w-3 h-3" /> Delete Event
                    </button>
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
