import { useEffect, useRef, useState, useContext } from "react";
import { AppContext } from "../../state/app.context";
import { Link } from "react-router-dom";

export default function ProfileDropdown() {
  const { userData } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!userData) return null;

  // return (
  //   <div
  //     className="relative"
  //     ref={dropdownRef}>
  //     <button
  //       onClick={toggleDropdown}
  //       className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center text-sm font-bold hover:bg-gray-300"
  //       title="Profile">
  //       {userData.photoURL ? (
  //         <img
  //           src={userData.photoURL}
  //           alt="avatar"
  //           className="w-full h-full object-cover rounded-full"
  //         />
  //       ) : (
  //         <>
  //           {userData.firstName?.charAt(0)}
  //           {userData.lastName?.charAt(0) || "?"}
  //         </>
  //       )}
  //     </button>

  //     {isOpen && (
  //       <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
  //         <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
  //           {userData.handle}
  //         </div>
  //         <Link
  //           to="/profile"
  //           className="block px-4 py-2 text-sm hover:bg-gray-100"
  //           onClick={() => setIsOpen(false)}>
  //           Profile Settings
  //         </Link>
  //         <Link
  //           to={`/events?creator=${userData.handle}`}
  //           className="block px-4 py-2 text-sm hover:bg-gray-100"
  //           onClick={() => setIsOpen(false)}>
  //           My Events
  //         </Link>
  //         {userData.isAdmin && (
  //           <Link
  //             to="/admin"
  //             className="block px-4 py-2 text-sm hover:bg-gray-100"
  //             onClick={() => setIsOpen(false)}>
  //             Admin Panel
  //           </Link>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );
  return (
    <div
      className="dropdown"
      ref={dropdownRef}>
      <button
        className="dropdown-toggle"
        onClick={toggleDropdown}>
        {userData.photoURL ? (
          <img
            src={userData.photoURL}
            alt="avatar"
            className="avatar"
          />
        ) : (
          <span className="avatar-placeholder">
            {userData.firstName?.charAt(0)}
            {userData.lastName?.charAt(0) || "?"}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item disabled">{userData.handle}</div>
          <Link
            to="/profile"
            className="dropdown-item"
            onClick={() => setIsOpen(false)}>
            Profile Settings
          </Link>
          <Link
            to={`/events?creator=${userData.handle}`}
            className="dropdown-item"
            onClick={() => setIsOpen(false)}>
            My Events
          </Link>
          {userData.isAdmin && (
            <Link
              to="/admin"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}>
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
