"use client";

import { Modal } from "@/app/_components/Modal";
import { useModalStore } from "@/app/_providers/ModalProvider";

export default function MainModal() {
  const modalStore = useModalStore((state) => state);

  if (!modalStore.isOpen) return null;

  return <Modal {...modalStore} />;
}
