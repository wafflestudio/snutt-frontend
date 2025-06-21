"use client";
import classNames from "classnames";

import styles from "./index.module.css";

interface Props {
  type?: string;
  children?: React.ReactNode;
  isOpen: boolean;
  title: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export const BottomSheet = ({
  type,
  children,
  title,
  confirmText,
  isOpen,
  onCancel,
  onConfirm,
}: Props) => {
  return (
    <>
      <div
        className={classNames(styles.dimmed, { [styles.hide]: !isOpen })}
        onClick={() => onCancel?.()}
      />
      <section
        className={classNames(styles.bottomSheet, { [styles.hide]: !isOpen })}
      >
        <div className={styles.header}>
          <span onClick={() => onCancel?.()}>취소</span>
          <span className={styles.title}>{title}</span>
          <span
            className={classNames({ [styles.warn]: type === "WARN" })}
            onClick={() => onConfirm?.()}
          >
            {confirmText || ""}
          </span>
        </div>
        <div>{children}</div>
      </section>
    </>
  );
};
