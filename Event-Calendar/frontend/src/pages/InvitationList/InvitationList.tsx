import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../state/app.context";
import { listenForInvitations } from "../../services/invitations.service";
import {
  acceptInvitation,
  declineInvitation,
} from "../../services/response.service";

export default function InvitationsList() {
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
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Your Invitations</h2>
      {invitations.length === 0 && <p>No pending invitations.</p>}
      <ul className="space-y-2">
        {invitations.map((inv) => (
          <li key={inv.id} className="border rounded-md p-4 bg-white shadow-sm">
            <p>
              <strong>{inv.fromHandle}</strong> invited you to{" "}
              <strong>{inv.eventTitle}</strong>
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleAccept(inv)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => handleDecline(inv)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
