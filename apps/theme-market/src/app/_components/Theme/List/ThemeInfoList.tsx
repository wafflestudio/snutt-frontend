"use client";

import { ThemeInfo } from "@/app/_components/Theme/Info";
import { Theme } from "@/entities/Theme";

import styles from "./index.module.css";

interface Props {
  themes: Theme[];
}
export const ThemeInfoList = ({ themes }: Props) => {
  return (
    <div className={styles.wrapper}>
      {themes.map((theme) => {
        return <ThemeInfo key={theme.id} theme={theme} />;
      })}
    </div>
  );
};
