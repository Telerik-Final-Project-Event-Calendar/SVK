import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../state/app.context";
import { listenForInvitations } from "../../services/invitations.service";
import {
  acceptInvitation,
  declineInvitation,
} from "../../services/response.service";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function InvitationList() {
  const { user } = useContext(AppContext);
  const [invitations, setInvitations] = useState<any[]>([]);

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

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-extrabold mb-6 border-b pb-3 text-gray-900 tracking-tight">
        Invitations
      </h2>

      {invitations.length === 0 ? (
        <p className="text-center text-gray-400 italic select-none">
          No pending invitations.
        </p>
      ) : (
        <ul className="space-y-5">
          {invitations.map((inv) => (
            <li
              key={inv.id}
              className="bg-gray-50 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <p className="text-gray-600 mb-1 text-sm uppercase tracking-wider font-semibold">
                <span className="text-indigo-600">{inv.fromHandle}</span>{" "}
                invited you to
              </p>
              <h3 className="text-lg font-bold text-gray-900 mb-4 truncate">
                {inv.eventTitle}
              </h3>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleAccept(inv)}
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
                  aria-label={`Accept invitation to ${inv.eventTitle}`}
                >
                  <FaCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Accept</span>
                </button>

                <button
                  onClick={() => handleDecline(inv)}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm transition"
                  aria-label={`Decline invitation to ${inv.eventTitle}`}
                >
                  <FaTimes className="w-4 h-4" />
                  <span className="text-sm font-medium">Decline</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
