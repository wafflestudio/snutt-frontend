"use client";

import { Theme } from "@/entities/Theme";
import styles from "./index.module.css";
import { Preview } from "./Preview";

interface Props {
  theme: Theme;
}

export const ThemeDetail = ({ theme }: Props) => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.info}>
        <span>테마명</span>
        <span>{theme.name}</span>
      </div>
      <div className={styles.colors}>
        {theme.colors.map((color, index) => (
          <div key={`${color.bg}_${index}`} className={styles.info}>
            <span>색상{index + 1}</span>
            <div className={styles.colorSet}>
              <div className={styles.color} style={{ background: color.fg }} />
              <div className={styles.color} style={{ background: color.bg }} />
            </div>
          </div>
        ))}
      </div>
      <Preview colors={theme.colors} />
    </section>
  );
};
