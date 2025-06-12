import React, { useContext } from 'react';
import Header from '../../components/Header/Header';
import Calendar from '../../components/Calendar/Calendar';
import WeeklyCalendar from '../CalendarViews/WeeklyCalendarView';
import MonthlyCalendar from '../CalendarViews/MonthlyView';
import DailyCalendar from '../CalendarViews/DailyView';
import CalendarYear from '../CalendarViews/CalendarYear/CalendarYear';
import { CalendarContext } from '../../state/calendar.context';
import ContactList from '../../components/ContactList/ContactList';

export default function HomePage() {
  const { view } = useContext(CalendarContext);

  const renderCalendar = () => {
    switch (view) {
      case 'yearly':
        return <CalendarYear/>
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

        <div className="flex-1 p-4">
          {renderCalendar()}
        </div>

        <aside className="w-80 border-l p-4 bg-gray-50">
          <ContactList />
        </aside>
      </div>
    </div>
  );
}