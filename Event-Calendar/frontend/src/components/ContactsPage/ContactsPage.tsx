import React, { useEffect, useState, useContext } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { AppContext } from "../../state/app.context";

interface Contact {
  name: string;
  email: string;
  photoURL?: string;
}

const ContactsPage: React.FC = () => {
  const { userData } = useContext(AppContext);
  const [contacts, setContacts] = useState<Record<string, Contact>>({});
  const [loading, setLoading] = useState(true);
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.uid) return;

    const db = getDatabase();
    const resolveHandle = async () => {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      const data = snapshot.val() || {};
      for (const [h, user] of Object.entries<any>(data)) {
        if (user.uid === userData.uid) {
          setHandle(h);
          break;
        }
      }
    };

    resolveHandle();
  }, [userData?.uid]);

  useEffect(() => {
    if (!handle) return;

    const db = getDatabase();
    const contactListRef = ref(db, `users/${handle}/contacts`);

    const unsubscribe = onValue(contactListRef, (snapshot) => {
      const data = snapshot.val() || {};
      setContacts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [handle]);

  const contactEntries = Object.entries(contacts);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">My Contacts</h2>
      {loading ? (
        <p className="text-gray-500">Loading contacts...</p>
      ) : contactEntries.length === 0 ? (
        <p className="text-gray-500">No contacts found.</p>
      ) : (
        <ul className="space-y-3">
          {contactEntries.map(([contactId, contact]) => (
            <li
              key={contactId}
              className="flex items-center bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
            >
              {contact.photoURL ? (
                <img
                  src={contact.photoURL}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-sm font-bold text-gray-700">
                  {contact.name?.charAt(0) || "?"}
                </div>
              )}
              <div>
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-500">{contact.email}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContactsPage;