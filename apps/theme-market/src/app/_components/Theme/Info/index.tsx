"use client";

import Image from "next/image";

import { useThemeStore } from "@/app/_providers/ThemeProvider";
import { Theme } from "@/entities/Theme";

import SvgDownload from "@/assets/icons/svgDownload.svg";

import styles from "./index.module.css";

interface Props {
  theme: Theme;
}

export const ThemeInfo = ({ theme }: Props) => {
  const { setTheme } = useThemeStore((state) => state);

  return (
    <article className={styles.wrapper} onClick={() => setTheme(theme)}>
      <div className={styles.metadata}>
        <div className={styles.info}>
          <h2 className={styles.title}>{theme.publishInfo?.publishName}</h2>
          <span className={styles.creator}>
            {theme.publishInfo?.authorName}
          </span>
        </div>
        <div className={styles.download}>
          <Image src={SvgDownload} alt="download" />
          <span>{theme.publishInfo?.downloads || 0}</span>
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
