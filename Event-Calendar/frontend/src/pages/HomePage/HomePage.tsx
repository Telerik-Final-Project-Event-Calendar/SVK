import React, { useContext, useState } from 'react';
import Calendar from '../../components/Calendar/Calendar';
import WeeklyCalendar from '../CalendarViews/WeeklyCalendarView';
import MonthlyCalendar from '../CalendarViews/MonthlyView';
import DailyCalendar from '../CalendarViews/DailyView';
import CalendarYear from '../CalendarViews/CalendarYear/CalendarYear';
import { CalendarContext } from '../../state/calendar.context';
// import ContactList from '../../components/ContactList/ContactList';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import EventLegend from '../../components/EventLegend/EventLegend';

export default function HomePage() {
  const { view } = useContext(CalendarContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // const [showContacts, setShowContacts] = useState(false);

  const renderCalendar = () => {
    switch (view) {
      case 'yearly':
        return <CalendarYear />;
      case 'daily':
        return <DailyCalendar />;
      case 'monthly':
        return <MonthlyCalendar />;
      case 'weekly':
      default:
        return <WeeklyCalendar />;
    }
  };

  const handleCategoryClick = (category: string) => {
    const newSearchParams = new URLSearchParams(window.location.search);
    
    if (newSearchParams.get('category') === category) {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
    
    navigate(`/all-events?${newSearchParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="flex flex-1">
        <div className="w-72 bg-white shadow-md border-r">
          <Calendar />
          <EventLegend onCategoryClick={handleCategoryClick} />          
        </div>

        <div className="flex-1 p-4">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
}