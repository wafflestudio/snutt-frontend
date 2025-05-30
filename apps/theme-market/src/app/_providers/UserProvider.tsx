"use client";

import { createContext, ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

import { createUserStore, UserStore } from "@/app/_stores/UserStore";

import { User } from "@/entities/User";

export type UserStoreApi = ReturnType<typeof createUserStore>;

export interface UserStoreProviderProps {
  children: ReactNode;
  user: User;
  accessToken: string;
}

export const UserStoreContext = createContext<UserStoreApi | undefined>(
  undefined
);

export const UserStoreProvider = ({
  children,
  user,
  accessToken,
}: UserStoreProviderProps) => {
  const ref = useRef<UserStoreApi>();
  if (!ref.current) {
    ref.current = createUserStore({ user, accessToken });
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
