import Image from "next/image";

import { cookieService } from "@/services/CookieService";
import { MainHeader } from "@/app/_components/Header/MainHeader";
import { themeService } from "@/services/ThemeService";
import SvgChevronLeft from "@/assets/icons/svgChevronLeft.svg";

import styles from "./index.module.css";
import { DEFAULT_PAGE } from "@/repositories/ThemeRepository";
import { ThemeListWithInifiniteScorll } from "@/app/_components/Theme/List/ThemeListWithInfiniteScroll";
import Link from "next/link";

export const BestPage = async () => {
  const accessToken = cookieService.getAccessToken();
  const { content: themes } = await themeService.getBestThemes(
    DEFAULT_PAGE,
    accessToken
  );

  return (
    <>
      <MainHeader menu="DOWNLOAD" />
      <section className={styles.main}>
        <Link className={styles.prev} href="/download">
          <Image src={SvgChevronLeft} alt="<" width="16" height="16.6" />
          <span>돌아가기</span>
        </Link>
        <div className={styles.themes}>
          <ThemeListWithInifiniteScorll defaultThemes={themes} />
        </div>
      </section>
    </>
  );
};
