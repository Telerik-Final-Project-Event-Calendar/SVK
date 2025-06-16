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
import { Link } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import InvitationList from "../../pages/InvitationList/InvitationList";
import ContactSidebar from "../ContactsSidebar/ContactsSidebar";

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
      {!user && (
        <div className="col-span-7 bg-white border border-yellow-300 shadow-md rounded-lg p-4 mb-4 flex items-center gap-3">
          <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
            <FiLock className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-800">
            <span className="font-semibold text-yellow-800">
              You are viewing public events only.
            </span>{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline hover:text-blue-800 ml-1"
            >
              Log in
            </Link>{" "}
            to see all events.
          </div>
        </div>
      )}

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

      {user && (
        <div>
          <InvitationList />
        </div>
      )}
    </>
  );
}
