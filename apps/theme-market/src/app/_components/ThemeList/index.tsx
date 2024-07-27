import Image from "next/image";
import styles from "./index.module.css";
import { Theme } from "./Theme";

import SvgChevronLeft from "@/assets/icons/svgChevronLeft.svg";

interface Props {
  title: string;
}

export const ThemeList = ({ title }: Props) => {
  return (
    <section className={styles.wrapper}>
      <span className={styles.title}>{title}</span>
      <div className={styles.themeList}>
        <Theme />
        <Theme />
        <Theme />
      </div>
      <div className={styles.more}>
        <span>전체 보기</span>
        <Image src={SvgChevronLeft} alt=">" />
      </div>
    </section>
  );
};
