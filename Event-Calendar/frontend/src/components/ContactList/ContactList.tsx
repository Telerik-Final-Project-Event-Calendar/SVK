import { useEffect, useState, useContext } from "react";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
} from "firebase/database";
import { AppContext } from "../../state/app.context";

type User = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function ContactList() {
  const { user } = useContext(AppContext);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<{ [uid: string]: boolean }>({});
  const [search, setSearch] = useState("");
  const [handle, setHandle] = useState<string | null>(null);

  const db = getDatabase();

  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const users: User[] = [];
      let foundHandle: string | null = null;

      Object.entries(data).forEach(([h, userData]: any) => {
        if (userData.uid && userData.email) {
          users.push({
            uid: userData.uid,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email,
          });
        }
        if (userData.uid === user?.uid) {
          foundHandle = h;
        }
      });

      setAllUsers(users);
      setHandle(foundHandle);
    });
  }, [user]);

  useEffect(() => {
    if (!user?.uid || !handle) return;

    const contactsRef = ref(db, `users/${handle}/contacts`);
    onValue(contactsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const map: { [uid: string]: boolean } = {};
      Object.keys(data).forEach((uid) => {
        map[uid] = true;
      });
      setContacts(map);
    });
  }, [user, handle]);

  const handleAdd = async (contact: User) => {
    if (!handle) return;
    const contactRef = ref(db, `users/${handle}/contacts/${contact.uid}`);
    await set(contactRef, {
      uid: contact.uid,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
    });
  };

  const handleRemove = async (uid: string) => {
    if (!handle) return;
    const contactRef = ref(db, `users/${handle}/contacts/${uid}`);
    await remove(contactRef);
  };

  const filtered = allUsers.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Only show filtered users if search is not empty
  const showResults = search.trim().length > 0 ? filtered : [];

  return (
    <div className="w-full max-w-md p-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-semibold mb-4">Search People</h2>
      <input
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {search.trim().length > 0 && showResults.length === 0 && (
          <p className="text-sm text-gray-500">No users found.</p>
        )}
        {showResults.map((u) => (
          <div
            key={u.uid}
            className="flex items-center justify-between border-b pb-2"
          >
            <div>
              <div className="font-medium">
                {u.firstName} {u.lastName}
              </div>
              <div className="text-sm text-gray-500">{u.email}</div>
            </div>
            {contacts[u.uid] ? (
              <button
                onClick={() => handleRemove(u.uid)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={() => handleAdd(u)}
                className="text-blue-500 text-sm"
              >
                Add
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}