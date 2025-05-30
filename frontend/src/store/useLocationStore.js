import { create } from "zustand";

export const useLocationStore = create((set) => ({
  location: "",
  setLocation: (newLocation) => set({ location: newLocation }),
}));
