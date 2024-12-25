"use client";

import { createContext, ReactNode, useContext, useRef } from "react";
import { createThemeStore, ThemeStore } from "../_stores/ThemeStore";
import { useStore } from "zustand";

export type ThemeStoreApi = ReturnType<typeof createThemeStore>;

export interface ThemeStoreProviderProps {
  children: ReactNode;
}

export const ThemeStoreContext = createContext<ThemeStoreApi | undefined>(
  undefined
);

export const ThemeStoreProvider = ({ children }: ThemeStoreProviderProps) => {
  const ref = useRef<ThemeStoreApi>();
  if (!ref.current) {
    ref.current = createThemeStore();
  }

  return (
    <ThemeStoreContext.Provider value={ref.current}>
      {children}
    </ThemeStoreContext.Provider>
  );
};

export const useThemeStore = <T,>(selector: (store: ThemeStore) => T): T => {
  const themeStoreContext = useContext(ThemeStoreContext);

  if (!themeStoreContext) {
    throw new Error(`useThemeStore must be used within ThemeStoreProvider`);
  }

  return useStore(themeStoreContext, selector);
};
