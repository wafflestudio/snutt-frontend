"use client";

import { useRouter } from "next/navigation";

import styles from "./index.module.css";

interface Props {
  title: string;
  colors: string[];
}

export const Theme = ({ title }: Props) => {
  const router = useRouter();

  return (
    <article
      className={styles.wrapper}
      onClick={() => router.push("/theme/123")}
    >
      <div className={styles.preview} />
      <span className={styles.title}>{title}</span>
    </article>
  );
};
