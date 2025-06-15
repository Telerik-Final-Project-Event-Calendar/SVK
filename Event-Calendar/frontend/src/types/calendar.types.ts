export interface CalendarContextType {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  view: string;
  setView: (view: string) => void;  
  eventRefreshTrigger: number;
  triggerEventRefresh: () => void;
}
