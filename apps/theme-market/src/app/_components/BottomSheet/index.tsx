"use client";

import { useRouter } from "next/navigation";
import styles from "./index.module.css";

interface Props {
  children?: React.ReactNode;
  title: string;
}

export const BottomSheet = ({ children, title }: Props) => {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <section className={styles.bottomSheet}>
        <div className={styles.header}>
          <span onClick={() => router.back()}>취소</span>
          <span className={styles.title}>{title}</span>
          <span>담기</span>
        </div>
        <div>{children}</div>
      </section>
    </div>
  );
};
