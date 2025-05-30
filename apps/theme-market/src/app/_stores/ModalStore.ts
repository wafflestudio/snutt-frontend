import { createStore } from "zustand";

import { ModalStatus } from "@/entities/Modal";

export type ModalStoreState = ModalStatus;

export type ModalStoreAction = {
  setModal: (modalStatus: ModalStatus) => void;
  closeModal: () => void;
};

export type ModalStore = ModalStoreState & ModalStoreAction;

export const createModalStore = () => {
  return createStore<ModalStore>((set) => ({
    isOpen: false,
    setModal: (modalStatus: ModalStatus) =>
      set(
        (state) => ({
          setModal: state.setModal,
          closeModal: state.closeModal,
          ...modalStatus,
        }),
        true
      ),
    closeModal: () => set(() => ({ isOpen: false })),
  }));
};
