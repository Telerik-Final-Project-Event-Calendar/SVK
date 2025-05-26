import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../state/app.context";
import { logoutUser } from "../../services/auth.service";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";

export default function Header() {
  const { user, userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAppState({ user: null, userData: null });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out.");
    }
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <NavLink
        to="/"
        className="flex items-center space-x-2">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-8 w-8"
        />
        <span className="font-bold text-lg text-gray-800">Event Calendar</span>
      </NavLink>

      {/* Navigation */}
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
              Welcome, <strong>{userData?.handle}</strong>
            </span>
            <ProfileDropdown />
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline">
              Log out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
