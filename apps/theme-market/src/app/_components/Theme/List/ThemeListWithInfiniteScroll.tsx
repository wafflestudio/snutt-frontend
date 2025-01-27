"use client";

import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { ThemeInfo } from "@/app/_components/Theme/Info";
import { useUserStore } from "@/app/_providers/UserProvider";
import { themeService } from "@/services/ThemeService";
import { Theme } from "@/entities/Theme";

import styles from "./index.module.css";

interface Props {
  defaultThemes: Theme[];
}

const DEFAULT_PAGE = 2;

export const ThemeListWithInifiniteScorll = ({ defaultThemes }: Props) => {
  const [themes, setThemes] = useState<Theme[]>(defaultThemes);
  const [page, setPage] = useState<number>(DEFAULT_PAGE);

  const { ref, inView } = useInView();

  const { accessToken } = useUserStore((state) => state);

  const loadThemes = useCallback(async () => {
    const { content: themes } = await themeService.getBestThemes(
      page,
      accessToken
    );

    setThemes((prev) => [...prev, ...themes]);
    setPage((prev) => prev + 1);
  }, [accessToken, page]);

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
