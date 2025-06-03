import { useState, useContext, useEffect } from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import { CalendarContext } from "../../state/calendar.context";
import { createDate } from "../../services/calendar.service";
import { ref, get, update, set } from "firebase/database";
import { db } from "../../config/firebase-config";
import { getUserByUID } from "../../services/users.service";
import { AppContext } from "../../state/app.context";
import CreateEventModal from "../../pages/CreateEventModal/CreateEventModal";
import EventLegend from "../EventLegend/EventLegend";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { selectedDate, setSelectedDate } = useContext(CalendarContext)!;
  const { user } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);

    if (!user) return;
    const uniqueUser = await getUserByUID(user.uid);
    if (!uniqueUser?.handle) return;

    await createDate(uniqueUser.handle, date);
  };

  return (
    <>
      <button
        className="mb-4 ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        + Create Event
      </button>
      <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-md">
        <CalendarHeader
          currentDate={currentDate}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
        {showModal && (
          <CreateEventModal
            selectedDate={selectedDate}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
      <EventLegend />
    </>
  );
}
