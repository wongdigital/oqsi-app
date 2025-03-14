import { create } from 'zustand';

interface LightSwitchStore {
  isOn: boolean;
  toggle: () => void;
}

export const useLightSwitchStore = create<LightSwitchStore>((set) => ({
  isOn: false,
  toggle: () => set((state) => ({ isOn: !state.isOn })),
})); 