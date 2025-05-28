import React from 'react';
import Header from '../../components/Header/Header';
import Calendar from '../../components/Calendar/Calendar';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <div className="w-72 bg-white shadow-md border-r">
          <Calendar />
        </div>
        <div className="flex-1 p-4">

        </div>
      </div>
    </div>
  );
}