"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { cookieService } from "@/services/CookieService";
import { themeService } from "@/services/ThemeService";
import { DEFAULT_PAGE } from "@/repositories/ThemeRepository";

import { useUserStore } from "@/app/_providers/UserProvider";

import { MainHeader } from "@/app/_pages/Main/Header/MainHeader";
import { ThemeListWithInifiniteScorll } from "@/app/_components/Theme/List/ThemeListWithInfiniteScroll";
import SvgChevronLeft from "@/assets/icons/svgChevronLeft.svg";

import styles from "./index.module.css";

interface Props {
  type: "BEST" | "FRIENDS";
}

export const ThemeListPage = async ({ type }: Props) => {
  const router = useRouter();

  const { accessToken } = useUserStore((state) => state);
  const { content: themes } =
    type === "BEST"
      ? await themeService.getBestThemes(DEFAULT_PAGE, accessToken)
      : await themeService.getFriendsThemes(DEFAULT_PAGE, accessToken);

  return (
    <>
      <MainHeader menu="DOWNLOAD" />
      <section className={styles.main}>
        <div className={styles.prev} onClick={() => router.back()}>
          <Image src={SvgChevronLeft} alt="<" width="16" height="16.6" />
          <span>돌아가기</span>
        </div>
        <div className={styles.themes}>
          <ThemeListWithInifiniteScorll defaultThemes={themes} />
        </div>
      </section>
    </>
  );
};
