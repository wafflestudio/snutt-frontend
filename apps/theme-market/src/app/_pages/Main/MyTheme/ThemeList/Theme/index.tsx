"use client";

import { useRouter } from "next/navigation";

import styles from "./index.module.css";
import { Preview } from "./Preview";

interface Props {
  title: string;
  colors: string[];
}

export const Theme = ({ title, colors }: Props) => {
  const router = useRouter();

  return (
    <article
      className={styles.wrapper}
      onClick={() => router.push("/theme/123")}
    >
      <Preview colors={colors} />
      <span className={styles.title}>{title}</span>
    </article>
  );
};
