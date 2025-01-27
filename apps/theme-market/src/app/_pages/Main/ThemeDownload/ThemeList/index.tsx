import Image from "next/image";
import styles from "./index.module.css";
import { ThemeInfo } from "./ThemeInfo";

import SvgChevronRight from "@/assets/icons/svgChevronRight.svg";
import { NotFound } from "@/app/_components/Error/NotFound";
import { Theme } from "@/entities/Theme";
import Link from "next/link";

interface Props {
  title: string;
  themes: Theme[];
}

export const ThemeList = ({ title, themes }: Props) => {
  const themeExists = themes.length > 0;

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>{title}</span>
      {themeExists ? (
        <>
          <div className={styles.themeList}>
            {themes.map((theme) => {
              return <ThemeInfo key={theme.id} theme={theme} />;
            })}
          </div>
          <Link className={styles.more} href="/download/best">
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
