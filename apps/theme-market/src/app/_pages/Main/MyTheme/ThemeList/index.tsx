import { Theme } from "@/entities/Theme";

import styles from "./index.module.css";
import { ThemeInfo } from "./ThemeInfo";
import { themeService } from "@/services/ThemeService";

interface Props {
  themes: Theme[];
}

export const ThemeList = ({ themes }: Props) => {
  return (
    <div className={styles.wrapper}>
      {themes.map((theme) => {
        const colors = theme.colors.map((color) => color.bg);

        return (
          <ThemeInfo
            key={theme.id}
            id={theme.id}
            title={theme.name}
            colors={colors}
          />
        );
      })}
    </div>
  );
};
