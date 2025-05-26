import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../state/app.context";
import { logoutUser } from "../../services/auth.service";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Header() {
  const { user, userData, setAppState, selectedDate, searchTerm, view } =
    useContext(AppContext);
  const navigate = useNavigate();

  const today: any = new Date()

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAppState({
        user: null,
        userData: null,
        selectedDate: new Date(),
        searchTerm: "",
        view: 'monthly'
      });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out.");
    }
  };

  const goToday = () => {
    setAppState((prev) => ({ ...prev, selectedDate: new Date() }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppState((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

const goPrevious = () => {
  setAppState((prev) => {
    const currentDate = prev.selectedDate ?? new Date(); 
    return {
      ...prev,
      selectedDate: new Date(currentDate.getTime() - 24 * 60 * 60 * 1000),
    };
  });
};

const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setAppState(prev => ({...prev, view: e.target.value}))
}


const goNext = () => {
  setAppState((prev) => {
    const currentDate = prev.selectedDate ?? new Date(); 
    return {
      ...prev,
      selectedDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
    };
  });
};

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <NavLink to="/" className="flex items-center space-x-2">
        {/* <img
          src="/images/logo.png"
          alt="Logo"
          className="h-8 w-8"
        /> */}
        <h1 className="text-3xl">🗓️</h1>
        <span className="font-bold text-lg text-gray-800">Event Calendar</span>
      </NavLink>

      <button onClick={goToday} className="border rounded py-2 px-4 mr-5">
        Today
      </button>

      <div className="ml-4 font-mono text-gray-700">
      {selectedDate ? selectedDate.toDateString() : today.toDateString()}
      </div>

      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-grow outline-none bg-transparent text-gray-700 placeholder-gray-400"
        />
        <button className="text-gray-500 hover:text-black">🔍</button>
      </div>

      <button onClick={goPrevious}>
        <ChevronLeft className="w-5 h-5 cursor-pointer text-gray-600 mx-2" />
      </button>

      <button onClick={goNext}>
        <ChevronRight className="w-5 h-5 cursor-pointer text-gray-600 mx-2" />
      </button>

        <select
        value={view}
        onChange={handleViewChange}
        className="border rounded px-3 py-2 ml-4"
      >
        <option value="monthly">Monthly</option>
        <option value="weekly">Weekly</option>
        <option value="daily">Daily</option>
      </select>

      {/* Navigation */}
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
              Welcome, <strong>{userData?.handle}</strong>
            </span>
            <ProfileDropdown />
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Log out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
