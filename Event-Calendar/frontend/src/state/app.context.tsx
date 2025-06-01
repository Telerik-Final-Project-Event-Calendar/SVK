import { createContext } from 'react';
import { IAppState, IAppContextType } from '../types/app.types';

const initialAppState: IAppState = {
  user: null,
  userData: null,
  selectedDate: new Date(),
  searchTerm: '',
  view: 'monthly',
  isLoading: false,
  error: null,
};

const initialAppContextType: IAppContextType = {
  ...initialAppState,
  setAppState: () => {}, 
};

export const AppContext = createContext<IAppContextType>(initialAppContextType);