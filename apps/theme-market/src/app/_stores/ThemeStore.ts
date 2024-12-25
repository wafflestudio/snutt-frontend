import { Theme } from "@/entities/Theme";
import { createStore } from "zustand";

export type ThemeStoreState = {
  theme: Theme | null;
};

export type ThemeStoreAction = {
  setTheme: (theme: Theme | null) => void;
};

export type ThemeStore = ThemeStoreState & ThemeStoreAction;

export const createThemeStore = () => {
  return createStore<ThemeStore>((set) => ({
    theme: null,
    setTheme: (theme) => set((state) => ({ ...state, theme })),
  }));
};
