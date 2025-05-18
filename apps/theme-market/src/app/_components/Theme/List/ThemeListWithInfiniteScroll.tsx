"use client";

import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { ThemeInfo } from "@/app/_components/Theme/Info";
import { Theme } from "@/entities/Theme";

import styles from "./index.module.css";

interface Props {
  defaultThemes: Theme[];
  getMoreThemes: (page: number) => Promise<Theme[]>;
}

const DEFAULT_PAGE = 2;

export const ThemeListWithInifiniteScorll = ({
  defaultThemes,
  getMoreThemes,
}: Props) => {
  const [themes, setThemes] = useState<Theme[]>(defaultThemes);
  const [page, setPage] = useState<number>(DEFAULT_PAGE);

  const { ref, inView } = useInView();

  const loadThemes = useCallback(async () => {
    const themes = await getMoreThemes(page);

    if (themes.length === 0) return;

    setThemes((prev) => [...prev, ...themes]);
    setPage((prev) => prev + 1);
  }, [page, getMoreThemes]);

  useEffect(() => {
    if (inView) loadThemes();
  }, [inView, loadThemes]);

  return (
    <>
      <div className={styles.wrapper}>
        {themes.map((theme) => {
          return <ThemeInfo key={theme.id} theme={theme} />;
        })}
      </div>
      <div ref={ref} />
    </>
  );
};
