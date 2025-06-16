import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AppContext } from "../../state/app.context";
import { logoutUser } from "../../services/auth.service";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchBar from "../SearchBar/SearchBar";
import { CalendarContext } from "../../state/calendar.context";
import { getUserByUID } from "../../services/users.service";
import {
  createDate,
  getUserSelectedDate,
  getUserView,
  setUserView,
} from "../../services/calendar.service";

export default function Header() {
  const { user, userData, setAppState, searchTerm } = useContext(AppContext);
  const { selectedDate, setSelectedDate, view, setView } =
    useContext(CalendarContext);

  const navigate = useNavigate();

  async function createDateDB(date: Date) {
    if (!user) return;
    try {
      const uniqueUser = await getUserByUID(user.uid);
      if (!uniqueUser?.handle) return;
      await createDate(uniqueUser.handle, date);
    } catch (error) {
      console.error("Failed to update selected date in DB:", error);
    }
  }

  useEffect(() => {
    async function fetchDate() {
      if (!userData?.handle) return;
      try {
        const fetchedDate = await getUserSelectedDate(userData.handle);
        if (!fetchedDate) {
          const today = new Date();
          await createDate(userData.handle, today);
          setSelectedDate(today);
        } else {
          const validDate =
            fetchedDate instanceof Date ? fetchedDate : new Date(fetchedDate);
          setSelectedDate(validDate);
        }
      } catch (error) {
        console.error("Error fetching date:", error);
      }
    }

    fetchDate();
  }, [userData]);

  useEffect(() => {
    async function fetchView() {
      if (!userData?.handle) return;
      try {
        const view = await getUserView(userData.handle);
        if (view) {
          setView(view);
        }
      } catch (error) {
        console.error("Error fetching calendar view:", error);
      }
    }

    fetchView();
  }, [userData]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAppState((prev) => ({
        ...prev,
        user: null,
        userData: null,
        searchTerm: "",
      }));
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out.");
    }
  };

  const goToday = async () => {
    const newDate = new Date();
    setSelectedDate(newDate);
    await createDateDB(newDate);
  };

  const goPrevious = async () => {
    const currentDate = selectedDate;
    const newDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    setSelectedDate(newDate);
    await createDateDB(newDate);
  };

  const goNext = async () => {
    const currentDate = selectedDate;
    const newDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    setSelectedDate(newDate);
    await createDateDB(newDate);
  };

  const handleViewChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newView = e.target.value;
    setView(newView);
    if (!user) return;
    try {
      const uniqueUser = await getUserByUID(user.uid);
      if (!uniqueUser?.handle) return;
      await setUserView(uniqueUser.handle, newView);
    } catch (error) {
      console.error("Failed to update view in DB:", error);
    }
  };

  const handleSearch = (term: string) => {
    setAppState((prev) => ({ ...prev, searchTerm: term }));
    navigate(`/all-events?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <NavLink
        to="/"
        className="flex items-center space-x-2">
        <h1 className="text-3xl">🗓️</h1>
        <span className="font-bold text-lg text-gray-800">Event Calendar</span>
      </NavLink>

      <button
        onClick={goToday}
        className="border rounded py-2 px-4 mr-5">
        Today
      </button>

      <div className="ml-4 font-mono text-gray-700">
        {selectedDate ? selectedDate.toDateString() : "Loading..."}
      </div>

      <button onClick={goPrevious}>
        <ChevronLeft className="w-5 h-5 cursor-pointer text-gray-600 mx-2" />
      </button>

      <button onClick={goNext}>
        <ChevronRight className="w-5 h-5 cursor-pointer text-gray-600 mx-2" />
      </button>

      <SearchBar
        value={searchTerm ?? ""}
        onSearch={handleSearch}
        placeholder="Search events..."
      />

      <select
        value={view ?? "monthly"}
        onChange={handleViewChange}
        className="border rounded px-3 py-2 ml-4">
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="daily">Daily</option>
        <option value="yearly">Yearly</option>
      </select>

      <nav className="flex items-center space-x-4">
        <NavLink
          to="/"
          className="text-gray-700 hover:text-blue-600">
          Home
        </NavLink>

        {!user && (
          <>
            <NavLink
              to="/login"
              className="text-gray-700 hover:text-blue-600">
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="text-gray-700 hover:text-blue-600">
              Register
            </NavLink>
          </>
        )}

        {user && (
          <>
            <span className="text-sm text-gray-600 hidden sm:inline">
              Welcome, <strong>{userData?.handle ?? "User"}</strong>
            </span>
            <ProfileDropdown />
            <button
              onClick={handleLogout}
              className="btn-danger">
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
