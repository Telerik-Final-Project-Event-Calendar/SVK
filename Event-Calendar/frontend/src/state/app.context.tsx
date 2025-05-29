import { createContext } from 'react';
import { IAppState, IAppContextType } from '../types/app.types';

const initialAppState: IAppState = {
  user: null,
  userData: null,
  isLoading: true, 
  error: null,
  selectedDate: new Date(),
  searchTerm: '',
  view: "monthly",
};

const initialAppContextType: IAppContextType = {
  ...initialAppState,
  setAppState: () => {}, 
};

export const AppContext = createContext<IAppContextType>(initialAppContextType);