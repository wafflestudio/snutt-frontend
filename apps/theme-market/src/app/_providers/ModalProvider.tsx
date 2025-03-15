"use client";

import { createContext, ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

import { createModalStore, ModalStore } from "../_stores/ModalStore";

export type ModalStoreApi = ReturnType<typeof createModalStore>;

export interface ModalStoreProviderProps {
  children: ReactNode;
}

export const ModalStoreContext = createContext<ModalStoreApi | undefined>(
  undefined
);

export const ModalStoreProvider = ({ children }: ModalStoreProviderProps) => {
  const ref = useRef<ModalStoreApi>();
  if (!ref.current) {
    ref.current = createModalStore();
  }

  return (
    <ModalStoreContext.Provider value={ref.current}>
      {children}
    </ModalStoreContext.Provider>
  );
};

export const useModalStore = <T,>(selector: (store: ModalStore) => T): T => {
  const modalStoreContext = useContext(ModalStoreContext);

  if (!modalStoreContext) {
    throw new Error(`useModalStore must be used within ModalStoreProvider`);
  }

  return useStore(modalStoreContext, selector);
};
