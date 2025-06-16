import { db } from "../config/firebase-config";
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { IContactList, IContactMinimal } from "../types/contacts.types";
import { IUserData } from "../types/app.types";
import { getUserByUID, fetchAllUsers } from "./users.service";

const CONTACTS_LISTS_PATH = "contactsLists";

export const createContactList = async (
  ownerId: string,
  name: string
): Promise<string> => {
  try {
    const newContactListRef = push(ref(db, CONTACTS_LISTS_PATH));
    const newContactListId = newContactListRef.key;

    if (!newContactListId) {
      throw new Error("Failed to generate new contact list ID.");
    }

    const newContactList: IContactList = {
      id: newContactListId,
      ownerId: ownerId,
      name: name,
      createdOn: Date.now(),
      contacts: {},
    };

    await set(
      ref(db, `${CONTACTS_LISTS_PATH}/${newContactListId}`),
      newContactList
    );
    return newContactListId;
  } catch (error) {
    console.error("Error creating contact list:", error);
    throw error;
  }
};

export const getAllContactLists = async (
  ownerId: string
): Promise<IContactList[]> => {
  try {
    const contactsListsRef = query(
      ref(db, CONTACTS_LISTS_PATH),
      orderByChild("ownerId"),
      equalTo(ownerId)
    );
    const snapshot = await get(contactsListsRef);

    if (snapshot.exists()) {
      const lists: IContactList[] = [];
      snapshot.forEach((childSnapshot) => {
        lists.push(childSnapshot.val());
      });
      return lists;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting all contact lists:", error);
    throw error;
  }
};

export const addContactToContactList = async (
  contactListId: string,
  contactUid: string,
  contactData: IContactMinimal
): Promise<void> => {
  try {
    const contactRef = ref(
      db,
      `${CONTACTS_LISTS_PATH}/${contactListId}/contacts/${contactUid}`
    );
    await set(contactRef, contactData);
  } catch (error) {
    console.error("Error adding contact to list:", error);
    throw error;
  }
};

export const removeContactFromContactList = async (
  contactListId: string,
  contactUid: string
): Promise<void> => {
  try {
    const contactRef = ref(
      db,
      `${CONTACTS_LISTS_PATH}/${contactListId}/contacts/${contactUid}`
    );
    await remove(contactRef);
  } catch (error) {
    console.error("Error removing contact from list:", error);
    throw error;
  }
};

export const deleteContactList = async (
  contactListId: string
): Promise<void> => {
  try {
    const contactListRef = ref(db, `${CONTACTS_LISTS_PATH}/${contactListId}`);
    await remove(contactListRef);
  } catch (error) {
    console.error("Error deleting contact list:", error);
    throw error;
  }
};

export const updateContactListName = async (
  contactListId: string,
  newName: string
): Promise<void> => {
  try {
    const listRef = ref(db, `${CONTACTS_LISTS_PATH}/${contactListId}`);
    await update(listRef, { name: newName });
  } catch (error) {
    console.error("Error updating contact list name:", error);
    throw error;
  }
};
