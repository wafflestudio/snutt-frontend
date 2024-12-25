"use client";

import { useRouter } from "next/navigation";
import styles from "./index.module.css";
import classNames from "classnames";

interface Props {
  children?: React.ReactNode;
  isOpen: boolean;
  title: string;
  onCancel?: () => void;
}

export const BottomSheet = ({ children, title, isOpen, onCancel }: Props) => {
  const router = useRouter();

  return (
    <div className={classNames(styles.wrapper, { [styles.hide]: !isOpen })}>
      <section
        className={classNames(styles.bottomSheet, { [styles.hide]: !isOpen })}
      >
        <div className={styles.header}>
          <span onClick={() => onCancel?.()}>취소</span>
          <span className={styles.title}>{title}</span>
          <span>담기</span>
        </div>
        <div>{children}</div>
      </section>
    </div>
  );
};
