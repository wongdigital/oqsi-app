import { create } from 'zustand';
import { InnieSelections } from './api-types';

interface UserStore {
  firstName: string;
  lastName: string;
  selections: InnieSelections | null;
  completeQuestionnaire: (firstName: string, lastName: string, selections: InnieSelections) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  firstName: '',
  lastName: '',
  selections: null,
  completeQuestionnaire: (firstName, lastName, selections) => set({ firstName, lastName, selections }),
  reset: () => set({ firstName: '', lastName: '', selections: null })
})); 