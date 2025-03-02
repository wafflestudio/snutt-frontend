import { Theme } from "@/entities/Theme";

import { ThemeInfo } from "./ThemeInfo";

import styles from "./index.module.css";

interface Props {
  themes: Theme[];
}

export const ThemeList = ({ themes }: Props) => {
  return (
    <div className={styles.wrapper}>
      {themes.map((theme) => {
        return <ThemeInfo key={theme.id} theme={theme} />;
      })}
    </div>
  );
};
