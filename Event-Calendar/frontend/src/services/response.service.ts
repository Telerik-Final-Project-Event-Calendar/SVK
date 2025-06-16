import { getDatabase, ref, update } from "firebase/database";

import { joinEvent } from "./events.service"; // adjust path as needed

export const acceptInvitation = async (
  invitationId: string,
  eventId: string,
  userId: string
) => {
  const db = getDatabase();

  // 1. Mark the invitation as accepted
  await update(ref(db, `invitations/${invitationId}`), {
    status: "accepted",
  });

  // 2. Add user to participants using your tested function
  await joinEvent(eventId, userId);
};

export const declineInvitation = async (invitationId: string) => {
  const db = getDatabase();
  await update(ref(db, `invitations/${invitationId}`), {
    status: "declined",
  });
};
