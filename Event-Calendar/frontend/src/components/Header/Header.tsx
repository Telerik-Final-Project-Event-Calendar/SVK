import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AppContext } from "../../state/app.context";
import { logoutUser } from "../../services/auth.service";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchBar from "../SearchBar/SearchBar";
import { CalendarContext } from "../../state/calendar.context";
import { getUserByUID } from "../../services/users.service";
import { createDate } from "../../services/calendar.service";
import { db } from "../../config/firebase-config";
import { ref, get } from "firebase/database";

export default function Header() {
  const { user, userData, setAppState } = useContext(AppContext);
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
    if (!user) {
      // console.error("No user yet.");
      return;
    }

    const uniqueUser = await getUserByUID(user.uid);
    if (!uniqueUser) {
      // console.error("No uniqueUser found for uid:", user.uid);
      return;
    }

    const dateRef = ref(db, `users/${uniqueUser.handle}/selectedDate`);
    try {
      const data = await get(dateRef);
      if (!data.exists()) {
        // console.error("No date exists in DB, saving today's date...");
        const today = new Date();
        await createDate(uniqueUser.handle, today);
        setSelectedDate(today);
        return;
      }

      const val = data.val();

      const fetchedDate = new Date(val.year, val.month - 1, val.day);

      setSelectedDate(fetchedDate);
    } catch (error) {
      console.error("Error fetching date:", error);
    }
  }

  fetchDate();
}, [user]); 

  useEffect(() => {
    async function fetchView() {
      if (!user) return;
      const uniqueUser = await getUserByUID(user.uid);
      if (!uniqueUser) return;

      const dateView = ref(db, `${uniqueUser.handle}/view`);
      try {
        const data = await get(dateView);
        if (!data.exists()) return;
        setView(data.val());
      } catch (error) {
        console.error("Failed to load view from Firebase:", error);
      }
    }
    fetchView();
  }, [user]);

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

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setView(e.target.value);
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <NavLink to="/" className="flex items-center space-x-2">
        <h1 className="text-3xl">🗓️</h1>
        <span className="font-bold text-lg text-gray-800">Event Calendar</span>
      </NavLink>

      <button onClick={goToday} className="border rounded py-2 px-4 mr-5">
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

      <SearchBar />

      <select
        value={view ?? "monthly"}
        onChange={handleViewChange}
        className="border rounded px-3 py-2 ml-4"
      >
        <option value="monthly">Monthly</option>
        <option value="weekly">Weekly</option>
        <option value="daily">Daily</option>
      </select>

      <nav className="flex items-center space-x-4">
        <NavLink to="/" className="text-gray-700 hover:text-blue-600">
          Home
        </NavLink>

        {!user && (
          <>
            <NavLink to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="text-gray-700 hover:text-blue-600"
            >
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
              className="btn-danger"
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}