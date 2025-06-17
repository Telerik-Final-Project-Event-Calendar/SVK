import React, { useEffect, useState, useContext, useCallback } from "react";
import { AppContext } from "../../state/app.context";
import { IContactList, IContactMinimal } from "../../types/contacts.types";
import { IUserData } from "../../types/app.types";
import {
  getAllContactLists,
  createContactList,
  addContactToContactList,
  removeContactFromContactList,
  deleteContactList,
  updateContactListName,
} from "../../services/contacts.service";
import { fetchAllUsers } from "../../services/users.service";
import SearchBar from "../../components/SearchBar/SearchBar";
import PaginationControls from "../../components/PaginationControls/PaginationControls";
import { usePagination } from "../../hooks/usePagination";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiTrash2,
  FiEdit3,
} from "react-icons/fi";

const ContactsPageNew: React.FC = () => {
  const { userData } = useContext(AppContext);
  const [contactLists, setContactLists] = useState<IContactList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");

  const [isSearchSectionOpen, setIsSearchSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<IUserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUserData[]>([]);

  const [openLists, setOpenLists] = useState<Record<string, boolean>>({});

  const {
    currentPage: currentSearchPage,
    totalPages: totalSearchPages,
    visibleItems: paginatedSearchResults,
    goToNextPage: nextSearchPage,
    goToPrevPage: prevSearchPage,
    setPage: setSearchPage,
  } = usePagination(filteredUsers, 5);

  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [userToAdd, setUserToAdd] = useState<IUserData | null>(null);
  const [selectedContactListId, setSelectedContactListId] = useState<
    string | null
  >(null);
  const [newModalListName, setNewModalListName] = useState("");
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalMessageType, setModalMessageType] = useState<
    "success" | "error" | null
  >(null);

  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const fetchedUsers = await fetchAllUsers();
        setAllUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to load all users for search:", error);
      }
    };
    loadAllUsers();
  }, []);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = allUsers.filter(
      (user) =>
        user.handle.toLowerCase().includes(lowercasedTerm) ||
        user.email.toLowerCase().includes(lowercasedTerm) ||
        (user.firstName &&
          user.firstName.toLowerCase().includes(lowercasedTerm)) ||
        (user.lastName && user.lastName.toLowerCase().includes(lowercasedTerm))
    );
    setFilteredUsers(results);
    setSearchPage(1);
  }, [searchTerm, allUsers, setSearchPage]);

  const fetchContactLists = useCallback(async () => {
    if (userData?.uid) {
      try {
        const lists = await getAllContactLists(userData.uid);
        setContactLists(lists);
        if (lists.length > 0 && !selectedContactListId) {
          setSelectedContactListId(lists[0].id);
        }

        const initialOpenState: Record<string, boolean> = {};
        lists.forEach((list) => {
          initialOpenState[list.id] = false;
        });
        setOpenLists(initialOpenState);
      } catch (error) {
        console.error("Error fetching contact lists:", error);
      }
    }
  }, [userData?.uid, selectedContactListId]);

  useEffect(() => {
    fetchContactLists();
  }, [fetchContactLists]);

  const handleCreateList = async () => {
    if (userData?.uid && newListName.trim()) {
      try {
        await createContactList(userData.uid, newListName.trim());
        setNewListName("");
        fetchContactLists();
      } catch (error) {
        console.error("Error creating contact list:", error);
      }
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm("Are you sure you want to delete this contact list?")) {
      try {
        await deleteContactList(listId);
        fetchContactLists();
        setOpenLists((prev) => {
          const newState = { ...prev };
          delete newState[listId];
          return newState;
        });
      } catch (error) {
        console.error("Error deleting contact list:", error);
      }
    }
  };

  const handleStartEditList = (listId: string, currentName: string) => {
    setEditingListId(listId);
    setEditingListName(currentName);
  };

  const handleSaveEditList = async () => {
    if (editingListId && editingListName.trim()) {
      try {
        await updateContactListName(editingListId, editingListName.trim());
        setEditingListId(null);
        setEditingListName("");
        fetchContactLists();
      } catch (error) {
        console.error("Error updating contact list name:", error);
      }
    }
  };

  const handleCancelEditList = () => {
    setEditingListId(null);
    setEditingListName("");
  };

  const openAddToListModal = (user: IUserData) => {
    setUserToAdd(user);
    setShowAddToListModal(true);
    setModalMessage(null);
    setModalMessageType(null);
    if (contactLists.length > 0 && !selectedContactListId) {
      setSelectedContactListId(contactLists[0].id);
    } else if (contactLists.length === 0) {
      setSelectedContactListId(null);
    }
  };

  const closeAddToListModal = () => {
    setShowAddToListModal(false);
    setUserToAdd(null);
    setSelectedContactListId(null);
    setNewModalListName("");
    setModalMessage(null);
    setModalMessageType(null);
  };

  const handleAddUserFromModal = async () => {
    if (!userData?.uid || !userToAdd) {
      setModalMessage("User data or UID missing. Please log in.");
      setModalMessageType("error");
      return;
    }

    let targetListId = selectedContactListId;
    let listNameForMessage = "";

    if (newModalListName.trim() && !selectedContactListId) {
      if (!newModalListName.trim()) {
        setModalMessage("Please enter a name for the new contact list.");
        setModalMessageType("error");
        return;
      }
      try {
        targetListId = await createContactList(
          userData.uid,
          newModalListName.trim()
        );
        listNameForMessage = newModalListName.trim();
        await fetchContactLists();
      } catch (error) {
        console.error("Failed to create new contact list:", error);
        setModalMessage("Failed to create new contact list.");
        setModalMessageType("error");
        return;
      }
    } else if (!targetListId) {
      setModalMessage("Please select an existing list or create a new one.");
      setModalMessageType("error");
      return;
    } else {
      const chosenList = contactLists.find((list) => list.id === targetListId);
      listNameForMessage = chosenList ? chosenList.name : "selected list";
    }

    if (targetListId) {
      try {
        const currentList = contactLists.find(
          (list) => list.id === targetListId
        );
        const contactExists =
          currentList?.contacts &&
          Object.values(currentList.contacts).some(
            (c) => c.uid === userToAdd.uid
          );

        if (contactExists) {
          setModalMessage(
            `${userToAdd.handle} is already in the list "${listNameForMessage}"!`
          );
          setModalMessageType("error");
          return;
        }

        const minimalContact: IContactMinimal = {
          uid: userToAdd.uid,
          email: userToAdd.email,
          firstName: userToAdd.firstName || "",
          lastName: userToAdd.lastName || "",
          handle: userToAdd.handle,
          photoURL: userToAdd.photoURL || "",
        };
        await addContactToContactList(
          targetListId,
          userToAdd.uid,
          minimalContact
        );
        setModalMessage(
          `${userToAdd.handle} added to contact list "${listNameForMessage}" successfully!`
        );
        setModalMessageType("success");
        fetchContactLists();
        setTimeout(() => {
          closeAddToListModal();
        }, 1500);
      } catch (error) {
        console.error("Error adding contact to list:", error);
        setModalMessage("Failed to add contact to list.");
        setModalMessageType("error");
      }
    }
  };

  const handleRemoveContact = async (listId: string, contactUid: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this contact from the list?"
      )
    ) {
      try {
        await removeContactFromContactList(listId, contactUid);
        fetchContactLists();
      } catch (error) {
        console.error("Error removing contact:", error);
      }
    }
  };

  const toggleListOpen = (listId: string) => {
    setOpenLists((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Manage Contacts
      </h2>

      <div className="bg-white rounded-lg shadow-lg mb-8 border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Create New Contact List
        </h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New list name"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleCreateList}
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
            <FiPlus className="inline-block mr-1" /> Create List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg mb-8 border border-gray-200">
        <button
          onClick={() => setIsSearchSectionOpen(!isSearchSectionOpen)}
          className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Search and Add Users
          </h3>
          {isSearchSectionOpen ? (
            <FiChevronUp className="w-6 h-6 text-gray-600" />
          ) : (
            <FiChevronDown className="w-6 h-6 text-gray-600" />
          )}
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSearchSectionOpen
              ? "max-h-[1000px] opacity-100 p-6 pt-4 border-t border-gray-200"
              : "max-h-0 opacity-0"
          }`}>
          <div className="mb-4">
            <SearchBar
              value={searchTerm}
              onSearch={setSearchTerm}
              placeholder="Search by username, email, first name, last name..."
            />
          </div>

          {paginatedSearchResults.length > 0 ? (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th
                      scope="col"
                      className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSearchResults.map((user) => (
                    <tr key={user.uid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.photoURL && user.photoURL !== "" ? (
                            <img
                              src={user.photoURL}
                              alt={user.handle}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold mr-3">
                              {user.firstName?.charAt(0)}
                              {user.lastName?.charAt(0) ||
                                user.handle.charAt(0) ||
                                "?"}
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {user.handle}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openAddToListModal(user)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out">
                          <FiPlus className="inline-block mr-1" /> Add to
                          Contacts
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationControls
                currentPage={currentSearchPage}
                totalPages={totalSearchPages}
                onPrev={prevSearchPage}
                onNext={nextSearchPage}
              />
            </div>
          ) : (
            <p className="text-gray-500 mt-4 text-center py-4">
              {searchTerm
                ? "No users found matching your search."
                : "Start typing to search for users."}
            </p>
          )}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 text-center mb-4 mt-6">
        My Contact Lists
      </h3>
      {contactLists.length > 0 ? (
        <div className="space-y-6">
          {contactLists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-lg shadow-lg border border-gray-200">
              <button
                onClick={() => toggleListOpen(list.id)}
                className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-200">
                {editingListId === list.id ? (
                  <div className="flex-grow flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingListName}
                      onChange={(e) => setEditingListName(e.target.value)}
                      className="flex-grow p-2 border border-gray-300 rounded-md"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveEditList();
                      }}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">
                      Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEditList();
                      }}
                      className="bg-gray-400 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-500">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h3 className="text-xl font-semibold text-gray-800">
                    {list.name}
                  </h3>
                )}
                <div className="flex items-center space-x-2">
                  {editingListId !== list.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditList(list.id, list.name);
                      }}
                      className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition"
                      title="Edit List Name">
                      <FiEdit3 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition"
                    title="Delete List">
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                  {openLists[list.id] ? (
                    <FiChevronUp className="w-6 h-6 text-gray-600" />
                  ) : (
                    <FiChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openLists[list.id]
                    ? "max-h-[1000px] opacity-100 p-6 pt-4 border-t border-gray-200"
                    : "max-h-0 opacity-0"
                }`}>
                {list.contacts && Object.keys(list.contacts).length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {Object.values(list.contacts).map((contact) => (
                      <li
                        key={contact.uid}
                        className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                          {contact.photoURL && contact.photoURL !== "" ? (
                            <img
                              src={contact.photoURL}
                              alt={contact.handle}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-bold mr-3">
                              {contact.firstName?.charAt(0)}
                              {contact.lastName?.charAt(0) ||
                                contact.handle.charAt(0) ||
                                "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {contact.handle}
                            </p>
                            <p className="text-sm text-gray-500">
                              {contact.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveContact(list.id, contact.uid)
                          }
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100 transition"
                          title="Remove Contact">
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No contacts in this list. Use the search above to add some!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8 bg-white rounded-lg shadow-md border border-gray-200">
          You don't have any contact lists yet. Create one above!
        </p>
      )}

      {showAddToListModal && userToAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Add "{userToAdd.handle}" to Contact List
            </h3>

            {contactLists.length > 0 ? (
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Select an existing list:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {contactLists.map((list) => (
                    <label
                      key={list.id}
                      className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="contactListSelection"
                        value={list.id}
                        checked={selectedContactListId === list.id}
                        onChange={() => {
                          setSelectedContactListId(list.id);
                          setNewModalListName("");
                          setModalMessage(null);
                        }}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-gray-800">{list.name}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-gray-200 my-4 pt-4">
                  <p className="text-gray-700 mb-2">Or create a new list:</p>
                  <input
                    type="text"
                    value={newModalListName}
                    onChange={(e) => {
                      setNewModalListName(e.target.value);
                      setSelectedContactListId(null);
                      setModalMessage(null);
                    }}
                    placeholder="New list name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  You don't have any contact lists. Please create one:
                </p>
                <input
                  type="text"
                  value={newModalListName}
                  onChange={(e) => {
                    setNewModalListName(e.target.value);
                    setModalMessage(null);
                  }}
                  placeholder="New list name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {modalMessage && (
              <p
                className={`mt-2 text-sm ${
                  modalMessageType === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                {modalMessage}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeAddToListModal}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button
                onClick={handleAddUserFromModal}
                disabled={!selectedContactListId && !newModalListName.trim()}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPageNew;
