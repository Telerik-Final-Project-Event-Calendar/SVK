import React, { useContext, useState } from 'react';
import Calendar from '../../components/Calendar/Calendar';
import WeeklyCalendar from '../CalendarViews/WeeklyCalendarView';
import MonthlyCalendar from '../CalendarViews/MonthlyView';
import DailyCalendar from '../CalendarViews/DailyView';
import CalendarYear from '../CalendarViews/CalendarYear/CalendarYear';
import { CalendarContext } from '../../state/calendar.context';
import ContactList from '../../components/ContactList/ContactList';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import EventLegend from '../../components/EventLegend/EventLegend';

export default function HomePage() {
  const { view } = useContext(CalendarContext);
  const [showContacts, setShowContacts] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
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

      <button
        onClick={() => setShowContacts((prev) => !prev)}
        className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-blue-600 text-white px-2 py-1 rounded-l shadow z-40 hover:bg-blue-700"
      >
        {showContacts ? '>' : '<'}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transition-transform duration-300 z-30 ${
          showContacts ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-l h-full overflow-y-auto">
          <ContactList />
        </div>
      </div>
    </div>
  );
}