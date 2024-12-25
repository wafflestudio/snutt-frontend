"use client";

import { createContext, ReactNode, useContext, useRef } from "react";
import { createUserStore, UserStore } from "../_stores/UserStore";
import { useStore } from "zustand";
import { User } from "@/entities/User";

export type UserStoreApi = ReturnType<typeof createUserStore>;

export interface UserStoreProviderProps {
  children: ReactNode;
  user: User;
}

export const UserStoreContext = createContext<UserStoreApi | undefined>(
  undefined
);

export const UserStoreProvider = ({
  children,
  user,
}: UserStoreProviderProps) => {
  const ref = useRef<UserStoreApi>();
  if (!ref.current) {
    ref.current = createUserStore({ user });
  }

  return (
    <UserStoreContext.Provider value={ref.current}>
      {children}
    </UserStoreContext.Provider>
  );
};

export const useUserStore = <T,>(selector: (store: UserStore) => T): T => {
  const userStoreContext = useContext(UserStoreContext);

  if (!userStoreContext) {
    throw new Error(`useUserStore must be used within UserStoreProvider`);
  }

  return useStore(userStoreContext, selector);
};
