import { getDatabase, ref, push, set, onValue } from "firebase/database";

export const createInvitation = async (invitationData: {
  eventId: string;
  eventTitle: string;
  fromUserId: string;
  fromHandle: string;
  toUserId: string;
  toHandle: string;
}) => {
  const db = getDatabase();
  const newInvitationRef = push(ref(db, "invitations"));

  await set(newInvitationRef, {
    ...invitationData,
    status: "pending",
    createdAt: Date.now(),
  });
};

export const listenForInvitations = (
  userId: string,
  callback: (invites: any[]) => void
) => {
  const db = getDatabase();
  const refInv = ref(db, "invitations");

  onValue(refInv, (snapshot) => {
    const data = snapshot.val();
    const invites = Object.entries(data || {}).map(
      ([id, val]: [string, any]) => ({
        id,
        ...val,
      })
    );
    const filtered = invites.filter(
      (inv) => inv.toUserId === userId && inv.status === "pending"
    );
    callback(filtered);
  });
};
