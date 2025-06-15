export interface EventData {
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
  isPublic: boolean;
  participants: string[];
  creatorId: string;
  selectedDate: string;
  handle: string;
  category: string;
  imageUrl?: string | null;
  id: string;
  isSeries?: boolean | null;
  seriesId?: string | null;
  recurrence?: {
    type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    interval?: number | null;
    daysOfWeek?: number[] | null;
    daysOfMonth?: number[] | null;
    endType: "never" | "onDate" | "afterOccurrences";
    endDate?: string | null;
    occurrencesCount?: number | null;
  } | null;
}

export interface EventSeriesData {
  id?: string;
  name: string;
  creatorId: string;
  creatorHandle: string;
  createdAt: string;
  recurrence: {
    type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    interval?: number | null;
    daysOfWeek?: number[] | null;
    daysOfMonth?: number[] | null;
    endType: "never" | "onDate" | "afterOccurrences";
    endDate?: string | null;
    occurrencesCount?: number | null;
  };
  baseEventData: Omit<
    EventData,
    | "id"
    | "start"
    | "end"
    | "selectedDate"
    | "isSeries"
    | "seriesId"
    | "recurrence"
  >;
}
