"use client";

import { useModalStore } from "@/app/_providers/ModalProvider";
import styles from "./index.module.css";

interface Props {
  type: "ALERT" | "CONFIRM";
  description: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export const Modal = ({ type, description, onCancel, onConfirm }: Props) => {
  const { closeModal } = useModalStore((state) => state);

  return (
    <div className={styles.wrapper}>
      <p className={styles.description}>{description}</p>
      {type === "ALERT" ? (
        <div onClick={() => closeModal()}>
          <span className={styles.text} onClick={() => onCancel?.()}>
            취소
          </span>
          <span className={styles.text} onClick={() => onConfirm?.()}>
            확인
          </span>
        </div>
      ) : (
        <div onClick={() => closeModal()}>
          <span className={styles.text} onClick={() => onConfirm?.()}>
            확인
          </span>
        </div>
      )}
    </div>
  );
};
