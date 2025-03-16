"use client";

import classNames from "classnames";

import { Input } from "@/app/_components/Input";
import { Preview } from "./Preview";

import { Theme } from "@/entities/Theme";

import styles from "./index.module.css";

interface Props {
  theme: Theme;
  publishName: string;
  isAnonymous: boolean;
  isPublished?: boolean;
  updatePublishName: (publishName: string) => void;
  updateIsAnonymous: () => void;
}

export const ThemeDetail = ({
  theme,
  publishName,
  isAnonymous,
  isPublished,
  updatePublishName,
  updateIsAnonymous,
}: Props) => {
  return (
    <section className={styles.wrapper}>
      <div
        className={classNames(styles.info, { [styles.published]: isPublished })}
      >
        <span className={styles.title}>테마명</span>
        {isPublished ? (
          <span className={styles.title}>
            {theme.publishInfo?.publishName || theme.name}
          </span>
        ) : (
          <Input
            className={styles.titleInput}
            defaultValue={publishName}
            onChange={updatePublishName}
          />
        )}
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
