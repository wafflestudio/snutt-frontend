"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useModalStore } from "@/app/_providers/ModalProvider";

import { Modal } from "@/app/_components/Modal";

export default function MainModal() {
  const pathname = usePathname();

  const modalStore = useModalStore((state) => state);

  const { closeModal } = modalStore;

  useEffect(() => {
    closeModal();
  }, [pathname, closeModal]);

  if (!modalStore.isOpen) return null;

  return <Modal {...modalStore} />;
}
