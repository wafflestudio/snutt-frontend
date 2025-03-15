"use client";

import { useModalStore } from "@/app/_providers/ModalProvider";

import styles from "./index.module.css";
import classNames from "classnames";

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
      <div className={styles.dimmed} />
      <div className={styles.modal}>
        <p className={styles.description}>{description}</p>
        {type === "CONFIRM" ? (
          <div className={styles.confirm} onClick={() => closeModal()}>
            <span
              className={classNames(styles.button, styles.cancleButton)}
              onClick={() => onCancel?.()}
            >
              취소
            </span>
            <span
              className={classNames(styles.button, styles.confirmButton)}
              onClick={() => onConfirm?.()}
            >
              확인
            </span>
          </div>
        ) : (
          <div className={styles.alert} onClick={() => closeModal()}>
            <span
              className={classNames(styles.button, styles.confirmButton)}
              onClick={() => onConfirm?.()}
            >
              확인
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
