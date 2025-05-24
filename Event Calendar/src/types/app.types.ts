import { User as FirebaseUser } from 'firebase/auth'; 

export interface IUserData {
  email: string;
  firstName: string;
  lastName: string;
  handle: string; 
  createdOn: string; 
  posts?: Record<string, any>; 
  comments?: Record<string, any>; 
  // more?
  photoURL?: string;
}

// 
export interface IAppState {
  user: FirebaseUser | null;
  userData: IUserData | null; 
  isLoading: boolean;
  error: Error | null;
}

// AppContext
export interface IAppContextType extends IAppState {
  setAppState: React.Dispatch<React.SetStateAction<IAppState>>;
  //more?
  // setUser: (user: FirebaseUser | null) => void;
  // setUserData: (userData: IUserData | null) => void;
}

// Authenticated
export interface IAuthenticatedProps {
  children: React.ReactNode;
}

// Header
export interface IHeaderProps {

}

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
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword?: string;
}

//ProfilePage
export interface IProfileUpdateInputs {
  firstName: string;
  lastName: string;
  email: string;
  newPassword?: string;
}