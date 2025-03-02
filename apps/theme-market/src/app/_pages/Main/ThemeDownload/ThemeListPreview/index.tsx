import Image from "next/image";
import Link from "next/link";

import { NotFound } from "@/app/_components/Error/NotFound";
import { ThemeInfoList } from "@/app/_components/Theme/List/ThemeInfoList";
import { Theme } from "@/entities/Theme";

import SvgChevronRight from "@/assets/icons/svgChevronRight.svg";

import styles from "./index.module.css";

interface Props {
  title: string;
  type: "BEST" | "FRIENDS";
  themes: Theme[];
}

export const ThemeListPreview = ({ title, type, themes }: Props) => {
  const themeExists = themes.length > 0;

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>{title}</span>
      {themeExists ? (
        <>
          <div className={styles.themeList}>
            <ThemeInfoList themes={themes} />
          </div>
          <Link
            className={styles.more}
            href={`/download/${type.toLowerCase()}`}
          >
            <span>전체 보기</span>
            <Image src={SvgChevronRight} alt=">" />
          </Link>
        </>
      ) : (
        <div className={styles.notFound}>
          <NotFound message="친구가 올린 테마가 아직 없어요" />
        </div>
      )}
    </div>
  );
};
