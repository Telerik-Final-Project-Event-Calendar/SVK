import { useEffect, useState, useContext } from "react";
import {
  getDatabase,
  ref,
  get,
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

  const db = getDatabase();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      const data = snapshot.val() || {};
      const users: User[] = [];

      Object.entries(data).forEach(([_, userData]: any) => {
        if (userData.uid && userData.email) {
          users.push({
            uid: userData.uid,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email,
          });
        }
      });

      setAllUsers(users);
    };

    fetchUsers();
  }, [user]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      const contactsRef = ref(db, `users/${user.handle}/contacts`);
      const snapshot = await get(contactsRef);
      const data = snapshot.val() || {};
      const map: { [uid: string]: boolean } = {};
      Object.keys(data).forEach((uid) => {
        map[uid] = true;
      });
      setContacts(map);
    };

    fetchContacts();
  }, [user]);

  const handleAdd = async (contact: User) => {
    if (!user) return;
    const contactRef = ref(db, `users/${user.handle}/contacts/${contact.uid}`);
    await set(contactRef, {
      uid: contact.uid,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
    });
    setContacts((prev) => ({ ...prev, [contact.uid]: true }));
  };

  const handleRemove = async (uid: string) => {
    if (!user) return;
    const contactRef = ref(db, `users/${user.handle}/contacts/${uid}`);
    await remove(contactRef);
    setContacts((prev) => {
      const copy = { ...prev };
      delete copy[uid];
      return copy;
    });
  };

  const filtered = allUsers.filter((u) => {
    if (contacts[u.uid]) return false;
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const showResults = search.trim().length > 0 ? filtered : [];

  return (
  <div className="w-full max-w-md p-4 bg-white shadow rounded-xl flex flex-col justify-between h-[1100px]">
    <div>
      <h2 className="text-lg font-semibold mb-2">Search People</h2>
      <input
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
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
                ❌
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

    <div className="my-4"></div>

    <div>
      <h2 className="text-lg font-semibold mb-4">Your Contacts</h2>

      {Object.keys(contacts).length > 0 ? (
        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {allUsers
            .filter((u) => contacts[u.uid])
            .map((u) => (
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
                <button
                  onClick={() => handleRemove(u.uid)}
                  className="text-red-500 text-sm"
                >
                  ❌
                </button>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">You have no contacts yet.</p>
      )}
    </div>
  </div>
);
}