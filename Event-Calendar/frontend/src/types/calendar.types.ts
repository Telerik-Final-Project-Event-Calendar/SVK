export interface CalendarContextType {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
  eventRefreshTrigger: number;
  triggerEventRefresh: () => void;
}
