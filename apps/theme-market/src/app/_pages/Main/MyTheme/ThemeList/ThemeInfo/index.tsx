"use client";

import { useThemeStore } from "@/app/_providers/ThemeProvider";
import { Theme } from "@/entities/Theme";

import { Preview } from "./Preview";
import styles from "./index.module.css";

interface Props {
  theme: Theme;
}

export const ThemeInfo = ({ theme }: Props) => {
  const { setTheme } = useThemeStore((state) => state);

  const colors = theme.colors.map((color) => color.bg);

  return (
    <article className={styles.wrapper} onClick={() => setTheme(theme)}>
      <Preview colors={colors} />
      <span className={styles.title}>제목이길어요오오오오오옹</span>
    </article>
  );
};
