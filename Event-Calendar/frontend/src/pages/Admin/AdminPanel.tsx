import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../state/app.context";
import { useNavigate, Link } from "react-router-dom";
import {
  fetchAllUsers,
  toggleUserBlockStatus,
  toggleUserAdminStatus,
  getReportStats,
  fetchAllEvents,
  deleteEvent,
  deleteEventSeries,
  sortUsersByStatusAndAdmin,
} from "../../services/admin.service";

import {
  FaFlag,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaUnlock,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";
import { IUserData } from "../../types/app.types";
import { EventData } from "../../types/event.types";
import SearchBar from "../../components/SearchBar/SearchBar";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiFlag as FiFlagIcon,
} from "react-icons/fi";
import PaginationControls from "../../components/PaginationControls/PaginationControls";
import { usePagination } from "../../hooks/usePagination";
import ReportedEvents from "./ReportedEvents";

interface EventWithId extends EventData {
  id: string;
}

export default function AdminPanel() {
  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState<IUserData[]>([]);
  const [events, setEvents] = useState<EventWithId[]>([]);
  const [reportStats, setReportStats] = useState({
    total: 0,
    distinctEvents: 0,
  });
  const navigate = useNavigate();

  const [isUsersSectionOpen, setIsUsersSectionOpen] = useState(false);
  const [isEventsSectionOpen, setIsEventsSectionOpen] = useState(false);
  const [isReportedEventsSectionOpen, setIsReportedEventsSectionOpen] =
    useState(false);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [eventSearchTerm, setEventSearchTerm] = useState("");

  const updateReportStats = async () => {
    const stats = await getReportStats();
    setReportStats(stats);
  };

  useEffect(() => {
    if (!userData?.isAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      const [userList, eventList, stats] = await Promise.all([
        fetchAllUsers(),
        fetchAllEvents(),
        getReportStats(),
      ]);

      const sortedUsers = sortUsersByStatusAndAdmin(userList);

      setUsers(sortedUsers);
      setEvents(eventList);
      setReportStats(stats);
    };

    fetchData();
  }, [userData, navigate]);

  const handleToggleBlock = async (handle: string, currentState: boolean) => {
    await toggleUserBlockStatus(handle, currentState);
    setUsers((prev) => {
      const updatedUsers = prev.map((user) =>
        user.handle === handle ? { ...user, isBlocked: !currentState } : user
      );
      return sortUsersByStatusAndAdmin(updatedUsers);
    });
  };

  const handleToggleAdmin = async (handle: string, currentState: boolean) => {
    await toggleUserAdminStatus(handle, currentState);
    setUsers((prev) => {
      const updatedUsers = prev.map((user) =>
        user.handle === handle ? { ...user, isAdmin: !currentState } : user
      );
      return sortUsersByStatusAndAdmin(updatedUsers);
    });
  };

  const handleDeleteSingleEvent = async (
    eventId: string,
    eventTitle: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete only this event: "${eventTitle}"?`
      )
    ) {
      try {
        await deleteEvent(eventId);
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        alert("Event deleted successfully!");
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const handleDeleteEventSeries = async (
    seriesId: string,
    seriesName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete the entire event series "${seriesName}" (all past and future occurrences)?`
      )
    ) {
      try {
        await deleteEventSeries(seriesId);
        const updatedEvents = await fetchAllEvents();
        setEvents(updatedEvents);
        alert("Event series deleted successfully!");
      } catch (error) {
        console.error("Error deleting event series:", error);
        alert("Failed to delete event series. Please try again.");
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearchTerm.toLowerCase();
    return (
      u.handle?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const filteredEvents = events.filter((e) =>
    e.title?.toLowerCase().includes(eventSearchTerm.toLowerCase())
  );

  const {
    currentPage: userPage,
    totalPages: totalUserPages,
    visibleItems: visibleUsers,
    goToNextPage: nextUserPage,
    goToPrevPage: prevUserPage,
  } = usePagination(filteredUsers, 6);

  const {
    currentPage: eventPage,
    totalPages: totalEventPages,
    visibleItems: visibleEventsPaged,
    goToNextPage: nextEventPage,
    goToPrevPage: prevEventPage,
  } = usePagination(filteredEvents, 6);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Admin Panel Overview
      </h2>

      <div className="bg-white rounded-lg shadow-lg mb-8 border border-red-200">
        <button
          onClick={() =>
            setIsReportedEventsSectionOpen(!isReportedEventsSectionOpen)
          }
          className="w-full flex justify-between items-center px-6 py-4 bg-red-50 hover:bg-red-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          <h3 className="text-xl font-semibold text-red-800 flex items-center gap-2">
            <FiFlagIcon className="text-red-600" /> Reported Events (
            {reportStats.total} reports / {reportStats.distinctEvents} events)
          </h3>
          {isReportedEventsSectionOpen ? (
            <FiChevronUp className="w-6 h-6 text-red-600" />
          ) : (
            <FiChevronDown className="w-6 h-6 text-red-600" />
          )}
        </button>

        {isReportedEventsSectionOpen && (
          <div className="p-6 pt-4 border-t border-red-200 animate-slide-down">
            <ReportedEvents onReportAction={updateReportStats} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg mb-8 border border-gray-200">
        <button
          onClick={() => setIsUsersSectionOpen(!isUsersSectionOpen)}
          className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          <h3 className="text-xl font-semibold text-gray-800">
            Users ({filteredUsers.length})
          </h3>
          {isUsersSectionOpen ? (
            <FiChevronUp className="w-6 h-6 text-gray-600" />
          ) : (
            <FiChevronDown className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {isUsersSectionOpen && (
          <div className="p-6 pt-4 border-t border-gray-200 animate-slide-down">
            <SearchBar
              value={userSearchTerm}
              onSearch={setUserSearchTerm}
              placeholder="Search users by username, name, or email..."
            />

            {visibleUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No users found matching your search.
              </p>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Username
                      </th>
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Email
                      </th>
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Full Name
                      </th>
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Status
                      </th>
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Role
                      </th>
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Events
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm font-light">
                    {visibleUsers.map((user) => (
                      <tr
                        key={user.handle}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          {user.handle}
                        </td>
                        <td className="py-3 px-6 text-left">{user.email}</td>
                        <td className="py-3 px-6 text-left">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 px-6 text-left">
                          <div className="flex items-center gap-2">
                            {user.isBlocked ? (
                              <FaTimesCircle className="text-red-500 text-lg" />
                            ) : (
                              <FaCheckCircle className="text-green-500 text-lg" />
                            )}
                            <button
                              onClick={() =>
                                handleToggleBlock(user.handle, !!user.isBlocked)
                              }
                              className={`flex items-center gap-2 px-3 py-1 border rounded-full transition duration-300 shadow-sm text-xs font-semibold ${
                                user.isBlocked
                                  ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                  : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              }`}
                            >
                              {user.isBlocked ? (
                                <>
                                  <FaUnlock className="w-3 h-3" /> Unblock
                                </>
                              ) : (
                                <>
                                  <FaBan className="w-3 h-3" />{" "}
                                  Block&nbsp;&nbsp;&nbsp;&nbsp;
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-left">
                          <div className="flex items-center gap-2">
                            {user.isAdmin ? (
                              <FaCheckCircle className="text-green-500 text-lg" />
                            ) : (
                              <FaTimesCircle className="text-red-500 text-lg" />
                            )}
                            <button
                              onClick={() =>
                                handleToggleAdmin(user.handle, !!user.isAdmin)
                              }
                              className={`flex items-center gap-2 px-3 py-1 border rounded-full transition duration-300 shadow-sm text-xs font-semibold ${
                                user.isAdmin
                                  ? "border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white"
                                  : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                              }`}
                            >
                              {user.isAdmin ? (
                                <>
                                  <FaUserMinus className="w-3 h-3" /> Make
                                  User&nbsp;&nbsp;&nbsp;&nbsp;
                                </>
                              ) : (
                                <>
                                  <FaUserPlus className="w-3 h-3" /> Make Admin
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-left">
                          <Link
                            to={`/events?creator=${user.handle}`}
                            className="flex items-center gap-2 px-3 py-1 border rounded-full border-indigo-600 text-indigo-600 font-semibold text-xs hover:bg-indigo-600 hover:text-white transition-colors duration-300 shadow-sm"
                          >
                            <FiEye className="w-3 h-3" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationControls
                  currentPage={userPage}
                  totalPages={totalUserPages}
                  onPrev={prevUserPage}
                  onNext={nextUserPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg mb-8 border border-gray-200">
        <button
          onClick={() => setIsEventsSectionOpen(!isEventsSectionOpen)}
          className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          <h3 className="text-xl font-semibold text-gray-800">
            Events ({filteredEvents.length})
          </h3>
          {isEventsSectionOpen ? (
            <FiChevronUp className="w-6 h-6 text-gray-600" />
          ) : (
            <FiChevronDown className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {isEventsSectionOpen && (
          <div className="p-6 pt-4 border-t border-gray-200 animate-slide-down">
            <SearchBar
              value={eventSearchTerm}
              onSearch={setEventSearchTerm}
              placeholder="Search events by title..."
            />

            {visibleEventsPaged.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No events found matching your search.
              </p>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Title
                      </th>
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Date
                      </th>
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Created by
                      </th>
                      <th className="py-3 px-6 text-left border-b border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm font-light">
                    {visibleEventsPaged.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          {event.title}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {new Date(event.start).toLocaleString()}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {event.handle}
                          {event.isSeries && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              Series
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-left">
                          <div className="flex gap-3">
                            <Link
                              to={`/event/${event.id}`}
                              className="flex items-center gap-2 px-3 py-1 border rounded-full border-indigo-600 text-indigo-600 font-semibold text-xs hover:bg-indigo-600 hover:text-white transition-colors duration-300 shadow-sm"
                              title="View event details"
                            >
                              <FiEye className="w-4 h-4" /> View
                            </Link>

                            <Link
                              to={`/event/edit/${event.id}`}
                              className="flex items-center gap-2 px-3 py-1 border rounded-full border-green-500 text-green-500 text-xs font-semibold hover:bg-green-500 hover:text-white transition duration-300 shadow-sm"
                            >
                              <FiEdit2 className="w-4 h-4" />
                              Edit
                            </Link>

                            {event.isSeries && event.seriesId ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleDeleteSingleEvent(
                                      event.id,
                                      event.title
                                    )
                                  }
                                  className="flex items-center gap-2 px-3 py-1 border rounded-full border-red-500 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition duration-300 shadow-sm"
                                  title="Delete only this event occurrence"
                                >
                                  <FiTrash2 className="w-4 h-4" /> Delete
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteEventSeries(
                                      event.seriesId!,
                                      event.title
                                    )
                                  }
                                  className="flex items-center gap-2 px-3 py-1 border rounded-full border-red-500 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition duration-300 shadow-sm"
                                  title="Delete the entire series"
                                >
                                  <FiTrash2 className="w-4 h-4" /> Delete all
                                  from series
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDeleteSingleEvent(event.id, event.title)
                                }
                                className="flex items-center gap-2 px-3 py-1 border rounded-full border-red-500 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition duration-300 shadow-sm"
                                title="Delete event"
                              >
                                <FiTrash2 className="w-4 h-4" /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationControls
                  currentPage={eventPage}
                  totalPages={totalEventPages}
                  onPrev={prevEventPage}
                  onNext={nextEventPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
