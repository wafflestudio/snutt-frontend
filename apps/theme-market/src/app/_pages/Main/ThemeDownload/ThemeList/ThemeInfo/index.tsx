"use client";

import Image from "next/image";
import styles from "./index.module.css";

import SvgDownload from "@/assets/icons/svgDownload.svg";
import { useRouter } from "next/navigation";
import { Theme } from "@/entities/Theme";

interface Props {
  theme: Theme;
}

export const ThemeInfo = ({ theme }: Props) => {
  const router = useRouter();

  return (
    <article
      className={styles.wrapper}
      onClick={() => router.push(`/theme/${theme.id}`)}
    >
      <div className={styles.metadata}>
        <div className={styles.info}>
          <h2 className={styles.title}>{theme.publishInfo.publishName}</h2>
          <span className={styles.creator}>{theme.publishInfo.authorName}</span>
        </div>
        <div className={styles.download}>
          <Image src={SvgDownload} alt="download" />
          <span>10</span>
        </div>
      </div>
      <div className={styles.colorList}>
        {theme.colors.map((color, index) => {
          return (
            <div
              key={index}
              className={styles.color}
              style={{ backgroundColor: color.bg }}
            />
          );
        })}
      </div>
    </article>
  );
};
