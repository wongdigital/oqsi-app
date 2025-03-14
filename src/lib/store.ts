import { create } from 'zustand';
import { InnieSelections } from './api-types';

interface UserStore {
  firstName: string;
  lastName: string;
  selections: InnieSelections | null;
  setUserInfo: (firstName: string, lastName: string) => void;
  setSelections: (selections: InnieSelections) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  firstName: '',
  lastName: '',
  selections: null,
  setUserInfo: (firstName: string, lastName: string) => set({ firstName, lastName }),
  setSelections: (selections: InnieSelections) => set({ selections }),
  reset: () => set({ firstName: '', lastName: '', selections: null })
})); 