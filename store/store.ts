import { create } from 'zustand';

export interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

export const useStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));

// Store exports
export { useAIStore } from './aiStore';
export { useAuthStore } from './authStore';
export { useProfileStore } from './profileStore';
export { useMessagesStore } from './messagesStore';
export { useComplaintsStore } from './complaintsStore';
export { useMeasurementStore } from './measurementStore';
