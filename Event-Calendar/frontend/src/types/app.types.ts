import { User as FirebaseUser } from "firebase/auth";
import { EventData } from "./event.types";

export interface IUserData {
  email: string;
  firstName: string;
  lastName: string;
  handle: string;
  phone: string;
  uid: string;
  createdOn: string;
  address?: string;
  photoURL?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
  events?: Record<string, EventData>;
  view?: string;
}

export interface IAppState {
  user: any;
  userData: IUserData | null;
  selectedDate: Date;
  searchTerm: string;
  view: string;
  isLoading: boolean;
  error: string | null;
}

// AppContext
export interface IAppContextType extends IAppState {
  setAppState: React.Dispatch<React.SetStateAction<IAppState>>;
}

// Authenticated
export interface IAuthenticatedProps {
  children: React.ReactNode;
}

// Header
export interface IHeaderProps {}

//ProfileDropdown
export interface IProfileDropdownProps {
  handle: string;
  email: string;
  avatarUrl?: string;
  onLogout: () => void;
}

//Login
export interface ILoginFormInputs {
  email: string;
  password: string;
}

//Register
export interface IRegisterFormInputs {
  handle: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
}

//ProfilePage
export interface IProfileUpdateInputs {
  firstName: string;
  lastName: string;
  email: string;
  newPassword?: string;
}

export interface RegistrationResult {
  user: FirebaseUser;
  userData: IUserData;
}