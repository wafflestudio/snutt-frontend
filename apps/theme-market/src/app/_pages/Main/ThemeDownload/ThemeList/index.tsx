import Image from "next/image";
import Link from "next/link";

import { cookieService } from "@/services/CookieService";
import { themeService } from "@/services/ThemeService";
import SvgChevronLeft from "@/assets/icons/svgChevronLeft.svg";
import { DEFAULT_PAGE } from "@/repositories/ThemeRepository";

import { MainHeader } from "@/app/_pages/Main/Header/MainHeader";
import { ThemeListWithInifiniteScorll } from "@/app/_components/Theme/List/ThemeListWithInfiniteScroll";

import styles from "./index.module.css";

interface Props {
  type: "BEST" | "FRIENDS";
}

export const ThemeListPage = async ({ type }: Props) => {
  const accessToken = cookieService.getAccessToken();
  const { content: themes } =
    type === "BEST"
      ? await themeService.getBestThemes(DEFAULT_PAGE, accessToken)
      : await themeService.getFriendsThemes(DEFAULT_PAGE, accessToken);

  return (
    <>
      <MainHeader menu="DOWNLOAD" />
      <section className={styles.main}>
        <Link className={styles.prev} href="/download" replace>
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
