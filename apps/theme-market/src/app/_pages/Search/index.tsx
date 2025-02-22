import Image from "next/image";

import { cookieService } from "@/services/CookieService";
import { themeService } from "@/services/ThemeService";

import { SearchHeader } from "./Header";
import { ThemeInfoList } from "@/app/_components/Theme/List/ThemeInfoList";

import SvgCat from "@/assets/icons/svgCat.svg";

import styles from "./index.module.css";

interface Props {
  query: string;
}

export const SearchPage = async ({ query }: Props) => {
  const accessToken = await cookieService.getAccessToken();
  const themes = await themeService.search(query, accessToken);

  return (
    <>
      <SearchHeader defaultValue={query} />
      <section className={styles.search}>
        {themes.length > 0 ? (
          <ThemeInfoList themes={themes} />
        ) : (
          <div className={styles.notFound}>
            <Image src={SvgCat} alt="not-found" />
            <span className={styles.text}>일치하는 테마가 없습니다.</span>
            <span className={styles.subText}>
              테마명이나 등록자 닉네임으로 검색해보세요.
            </span>
          </div>
        )}
      </section>
      ;
    </>
  );
};
