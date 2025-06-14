import { ref, get, remove, update, push, set } from "firebase/database";
import { db } from "../config/firebase-config"; // Уверете се, че db е правилно импортиран от Firebase Realtime Database
import { deleteEvent as deleteEventFromService } from "./events.service"; // Преименуваме import, за да избегнем конфликт

// Интерфейси за по-добра типизация
interface ReportData {
  reportedBy: string;
  reason: string;
  createdOn: number;
}

interface EventReport {
  eventId: string;
  reportId: string;
  report: ReportData;
  event: any; // Можете да използвате EventData, ако имате пълния тип тук
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
  const reportRef = push(ref(db, `eventReports/${eventId}`)); // Използваме 'eventReports' вместо 'reports'
  const reportData: ReportData = {
    reportedBy,
    reason,
    createdOn: Date.now(),
  };

  // Записва информацията за репорта под конкретното събитие
  await set(reportRef, reportData);
};

/**
 * Fetches all reported events, grouping reports by event.
 * @returns An array of event reports with associated event data.
 */
export const fetchReportedEvents = async (): Promise<EventReport[]> => {
  const reportsSnap = await get(ref(db, "eventReports")); // От 'eventReports'
  const eventsSnap = await get(ref(db, "events")); // От 'events' колекцията

  if (!reportsSnap.exists() || !eventsSnap.exists()) return [];

  const reportsData = reportsSnap.val() as Record<string, any>;
  const eventsData = eventsSnap.val() as Record<string, any>; // Assumes events are stored by ID

  return Object.entries(reportsData).flatMap(([eventId, reports]) => {
    const event = eventsData[eventId]; // Взима събитието по eventId
    if (!event) return []; // Ако събитието вече не съществува, игнорирайте репорта

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
  // Изтрива събитието от основната колекция
  await deleteEventFromService(eventId); // Използваме функцията deleteEvent от events.service
  // Изтрива всички репорти за това събитие
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
  const snap = await get(ref(db, "eventReports")); // От 'eventReports'
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
