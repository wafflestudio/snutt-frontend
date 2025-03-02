"use client";

import classNames from "classnames";

import { Theme } from "@/entities/Theme";

import { Preview } from "./Preview";

import styles from "./index.module.css";

interface Props {
  theme: Theme;
  isAnonymous: boolean;
  isPublished?: boolean;
  updateIsAnonymous: () => void;
}

export const ThemeDetail = ({
  theme,
  isAnonymous,
  isPublished,
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
      {!isPublished && (
        <div className={styles.anonymous}>
          <span>익명으로 올리기</span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={() => updateIsAnonymous()}
            />
            <span className={classNames(styles.slider, styles.round)} />
          </label>
        </div>
      )}
      <Preview colors={theme.colors} />
    </section>
  );
};
