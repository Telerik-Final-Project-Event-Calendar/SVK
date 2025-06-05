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

interface EventWithId extends EventData {
  id: string;
}

export default function AdminPanel() {
  const { userData, searchTerm, setAppState } = useContext(AppContext);
  const [users, setUsers] = useState<IUserData[]>([]);
  const [events, setEvents] = useState<EventWithId[]>([]);
  const [reportStats, setReportStats] = useState({ total: 0, distinctPosts: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData?.isAdmin) {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      const list = await fetchAllUsers();
      setUsers(list);
    };

    const fetchStats = async () => {
      const stats = await getReportStats();
      setReportStats(stats);
    };

    const fetchEventsList = async () => {
      const list = await fetchAllEvents();
      setEvents(list);
    };

    fetchUsers();
    fetchStats();
    fetchEventsList();
  }, [userData, navigate]);

  const handleToggleBlock = async (handle: string, currentState: boolean) => {
    await toggleUserBlockStatus(handle, currentState);
    setUsers((prev) =>
      prev.map((user) =>
        user.handle === handle ? { ...user, isBlocked: !currentState } : user
      )
    );
  };

  const handleToggleAdmin = async (handle: string, currentState: boolean) => {
    await toggleUserAdminStatus(handle, currentState);
    setUsers((prev) =>
      prev.map((user) =>
        user.handle === handle ? { ...user, isAdmin: !currentState } : user
      )
    );
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm?.toLowerCase() || "";
    return (
      u.handle?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const filteredEvents = events.filter((e) =>
    e.title?.toLowerCase().includes((searchTerm ?? "").toLowerCase())
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      <div className="mb-2">
        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
        >
          <FaFlag />
          See Reported Posts
          <span>
            ({reportStats.total} reports / {reportStats.distinctPosts} posts)
          </span>
        </Link>
      </div>

      <div className="mb-4">
        <SearchBar />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Username</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Full Name</th>
                <th className="border px-4 py-2 text-left">Blocked</th>
                <th className="border px-4 py-2 text-left">Admin</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.handle} className="even:bg-gray-50">
                  <td className="border px-4 py-2">{user.handle}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.firstName} {user.lastName}</td>
                  <td className="border px-4 py-2">
                    <div className="flex items-center gap-2">
                      {user.isBlocked ? (
                        <FaTimesCircle className="text-red-500 text-lg" />
                      ) : (
                        <FaCheckCircle className="text-green-500 text-lg" />
                      )}
                      <button
                        onClick={() => handleToggleBlock(user.handle, !!user.isBlocked)}
                        className={`px-2 py-1 rounded text-xs font-medium ${user.isBlocked ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {user.isBlocked ? <><FaUnlock /> Unblock</> : <><FaBan /> Block</>}
                      </button>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex items-center gap-2">
                      {user.isAdmin ? (
                        <FaCheckCircle className="text-green-500 text-lg" />
                      ) : (
                        <FaTimesCircle className="text-red-500 text-lg" />
                      )}
                      <button
                        onClick={() => handleToggleAdmin(user.handle, !!user.isAdmin)}
                        className={`px-2 py-1 rounded text-xs font-medium ${user.isAdmin ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {user.isAdmin ? <><FaUserMinus /> Make user</> : <><FaUserPlus /> Make Admin</>}
                      </button>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <Link
                      to={`/posts?author=${user.handle}&admin=true`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      See Posts
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-xl font-semibold mt-10 mb-2">Events</h3>
      {filteredEvents.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Title</th>
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Created by</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="even:bg-gray-50">
                  <td className="border px-4 py-2">{event.title}</td>
                  <td className="border px-4 py-2">{event.start}</td>
                  <td className="border px-4 py-2">{event.handle}</td>
                  <td className="border px-4 py-2">
                    <Link
                      to={`/events/${event.id}/edit`}
                      className="text-sm text-green-600 hover:underline mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
