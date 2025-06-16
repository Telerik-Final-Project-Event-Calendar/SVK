import { IUserData } from "./app.types";

export interface IContactMinimal {
  uid: string;
  handle: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
}

export interface IContactEntry {
  [uid: string]: IContactMinimal;
}

export interface IContactList {
  id: string;
  ownerId: string;
  name: string;
  contacts: IContactEntry;
  createdOn: number;
}