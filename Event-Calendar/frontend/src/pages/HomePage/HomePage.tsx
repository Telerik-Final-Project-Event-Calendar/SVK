import React, { useContext } from 'react';
import Header from '../../components/Header/Header';
import Calendar from '../../components/Calendar/Calendar';
import WeeklyCalendar from '../CalendarViews/WeeklyCalendarView';
import MonthlyCalendar from '../CalendarViews/MonthlyView';
import DailyCalendar from '../CalendarViews/DailyView';
import { CalendarContext } from '../../state/calendar.context';

export default function HomePage() {
  const { view } = useContext(CalendarContext);

  const renderCalendar = () => {
    switch (view) {
      case 'daily':
        return <DailyCalendar />;
      case 'monthly':
        return <MonthlyCalendar />;
      case 'weekly':
      default:
        return <WeeklyCalendar />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      <div className="flex flex-1">
        <div className="w-72 bg-white shadow-md border-r">
          <Calendar />
        </div>

        {/* Main Calendar View */}
        <div className="flex-1 p-4">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
}