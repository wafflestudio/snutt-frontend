"use client";

import { Theme } from "@/entities/Theme";
import styles from "./index.module.css";
import { Preview } from "./Preview";
import classNames from "classnames";

interface Props {
  theme: Theme;
  isAnonymous: boolean;
  updateIsAnonymous: () => void;
}

export const ThemeDetail = ({
  theme,
  isAnonymous,
  updateIsAnonymous,
}: Props) => {
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
      <div className={styles.anonymous}>
        <span>익명으로 올리기</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onClick={() => updateIsAnonymous()}
          />
          <span className={classNames(styles.slider, styles.round)} />
        </label>
      </div>
      <Preview colors={theme.colors} />
    </section>
  );
};
