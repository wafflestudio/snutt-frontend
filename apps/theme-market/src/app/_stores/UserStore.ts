import { User } from "@/entities/User";
import { createStore } from "zustand";

export type UserStoreState = {
  user: User;
};

export type UserStoreAction = {};

export type UserStore = UserStoreState & UserStoreAction;

export const createUserStore = (initalSate: UserStoreState) => {
  return createStore<UserStore>(() => ({
    ...initalSate,
  }));
};
