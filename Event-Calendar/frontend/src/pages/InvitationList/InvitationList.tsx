import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../state/app.context";
import { listenForInvitations } from "../../services/invitations.service";
import {
  acceptInvitation,
  declineInvitation,
} from "../../services/response.service";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Link } from "react-router-dom";
import PaginationControls from "../../components/PaginationControls/PaginationControls";
import { usePagination } from "../../hooks/usePagination";

export default function InvitationList() {
  const { user } = useContext(AppContext);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (!user) return;
    listenForInvitations(user.uid, setInvitations);
  }, [user]);

  const handleAccept = async (inv: any) => {
    console.log("Accepting invitation for event:", inv.eventId);
    await acceptInvitation(inv.id, inv.eventId, user.uid);
  };

  const handleDecline = async (inv: any) => {
    await declineInvitation(inv.id);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const ITEMS_PER_PAGE = 3;
  const {
    currentPage,
    totalPages,
    visibleItems: visibleInvitations,
    goToNextPage,
    goToPrevPage,
  } = usePagination(invitations, ITEMS_PER_PAGE);

  return (
    <div className="max-w-md mx-auto my-4 bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={toggleCollapse}
        className={`w-full flex justify-between items-center p-4 cursor-pointer focus:outline-none transition-colors duration-200 
          ${isCollapsed 
            ? 'bg-gray-100 hover:bg-gray-200' 
            : 'bg-indigo-50 hover:bg-indigo-100'
          }`}
        aria-expanded={!isCollapsed}
        aria-controls="invitation-list-content"
      >
        <h2 className="text-xl font-semibold text-gray-800">
          Invitations ({invitations.length}) 
        </h2>
        {isCollapsed ? (
          <FiChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <FiChevronUp className="w-5 h-5 text-gray-500" />
        )}
      </button>

      <div
        id="invitation-list-content"
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100 p-4 pt-0" 
        } overflow-hidden`}
      >
        {invitations.length === 0 ? ( 
          <p className="text-center text-gray-500 italic py-4 select-none">
            No pending invitations.
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {visibleInvitations.map((inv) => (
                <li
                  key={inv.id}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                >
                  <p className="text-gray-600 mb-1 text-sm font-semibold">
                    <span className="text-indigo-600">{inv.fromHandle}</span>{" "}
                    invited you to
                  </p>

                  <Link
                    to={`/event/${inv.eventId}`}
                    className="block text-lg font-bold text-gray-900 mb-3 truncate hover:underline hover:text-blue-600"
                  >
                    {inv.eventTitle}
                  </Link>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(inv)}
                      className="flex items-center gap-1 px-3 py-1 border rounded-full border-green-600 text-green-600 font-semibold text-xs hover:bg-green-600 hover:text-white transition-colors duration-300 shadow-sm"
                      aria-label={`Accept invitation to ${inv.eventTitle}`}
                    >
                      <FaCheck className="w-3 h-3" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => handleDecline(inv)}
                      className="flex items-center gap-1 px-3 py-1 border rounded-full border-red-500 text-red-500 font-semibold text-xs hover:bg-red-500 hover:text-white transition-colors duration-300 shadow-sm"
                      aria-label={`Decline invitation to ${inv.eventTitle}`}
                    >
                      <FaTimes className="w-3 h-3" />
                      <span>Decline</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            
            {totalPages > 1 && ( 
                <div className="mt-4">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPrev={goToPrevPage}
                        onNext={goToNextPage}
                    />
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}