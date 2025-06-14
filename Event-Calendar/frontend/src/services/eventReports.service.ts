import { ref, get, remove, update, push, set } from "firebase/database";
import { db } from "../config/firebase-config";
import { deleteEvent as deleteEventFromService } from "./events.service";

interface ReportData {
  reportedBy: string;
  reason: string;
  createdOn: number;
}

interface EventReport {
  eventId: string;
  reportId: string;
  report: ReportData;
  event: any;
}

/**
 * Reports an event.
 * @param eventId The ID of the event being reported.
 * @param reportedBy The handle/username of the user reporting the event.
 * @param reason The reason for reporting.
 */
export const reportEvent = async (
  eventId: string,
  reportedBy: string,
  reason: string
): Promise<void> => {
  const reportRef = push(ref(db, `eventReports/${eventId}`));
  const reportData: ReportData = {
    reportedBy,
    reason,
    createdOn: Date.now(),
  };

  await set(reportRef, reportData);
};

/**
 * Fetches all reported events, grouping reports by event.
 * @returns An array of event reports with associated event data.
 */
export const fetchReportedEvents = async (): Promise<EventReport[]> => {
  const reportsSnap = await get(ref(db, "eventReports"));
  const eventsSnap = await get(ref(db, "events"));

  if (!reportsSnap.exists() || !eventsSnap.exists()) return [];

  const reportsData = reportsSnap.val() as Record<string, any>;
  const eventsData = eventsSnap.val() as Record<string, any>;

  return Object.entries(reportsData).flatMap(([eventId, reports]) => {
    const event = eventsData[eventId]; 
    if (!event) return [];

    return Object.entries(reports).map(([reportId, report]) => ({
      eventId,
      reportId,
      report: report as ReportData,
      event,
    }));
  });
};

/**
 * Deletes a reported event and all its associated reports.
 * @param eventId The ID of the event to delete.
 */
export const deleteReportedEvent = async (eventId: string): Promise<void> => {
  await deleteEventFromService(eventId);
  await remove(ref(db, `eventReports/${eventId}`));
};

/**
 * Marks a specific report as reviewed by deleting it.
 * @param eventId The ID of the event to which the report belongs.
 * @param reportId The ID of the specific report to mark as reviewed.
 */
export const markEventReportReviewed = async (
  eventId: string,
  reportId: string
): Promise<void> => {
  await remove(ref(db, `eventReports/${eventId}/${reportId}`));
};

/**
 * Gets statistics about reported events.
 * @returns An object with total reports and count of distinct reported events.
 */
export const getEventReportStats = async () => {
  const snap = await get(ref(db, "eventReports"));
  if (!snap.exists()) return { total: 0, distinctEvents: 0 };

  const reportsData = snap.val() as Record<string, any>;
  let totalReports = 0;
  const distinctEventIds = new Set();

  for (const eventId in reportsData) {
    distinctEventIds.add(eventId);
    const reportsForEvent = reportsData[eventId];
    for (const reportId in reportsForEvent) {
      totalReports++;
    }
  }

  return {
    total: totalReports,
    distinctEvents: distinctEventIds.size,
  };
};
