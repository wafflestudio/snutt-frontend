import Image from "next/image";
import styles from "./index.module.css";
import { Theme } from "./Theme";

import SvgChevronLeft from "@/assets/icons/svgChevronLeft.svg";
import { NotFound } from "@/app/_components/Error/NotFound";

interface Props {
  title: string;
  noTheme?: boolean;
}

export const ThemeList = ({ title, noTheme }: Props) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>{title}</span>
      {noTheme ? (
        <div className={styles.notFound}>
          <NotFound message="친구가 올린 테마가 아직 없어요" />
        </div>
      ) : (
        <>
          <div className={styles.themeList}>
            <Theme />
            <Theme />
            <Theme />
          </div>
          <div className={styles.more}>
            <span>전체 보기</span>
            <Image src={SvgChevronLeft} alt=">" />
          </div>
        </>
      )}
    </div>
  );
};
