import { Theme } from "@/entities/Theme";

import styles from "./index.module.css";
import { ThemeInfo } from "./ThemeInfo";

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
