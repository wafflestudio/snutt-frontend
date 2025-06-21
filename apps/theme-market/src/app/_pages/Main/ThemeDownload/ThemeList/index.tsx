import { themeService } from "@/services/ThemeService";
import { cookieService } from "@/services/CookieService";
import { DEFAULT_PAGE } from "@/repositories/ThemeRepository";

import { MainHeader } from "@/app/_pages/Main/Header/MainHeader";
import { ThemeListWithInifiniteScorll } from "@/app/_components/Theme/List/ThemeListWithInfiniteScroll";
import { Back } from "@/app/_components/Common/Back";

import styles from "./index.module.css";

interface Props {
  type: "BEST" | "FRIENDS";
}

export const ThemeListPage = async ({ type }: Props) => {
  const accessToken = cookieService.getAccessToken();

  const { content: themes } = await themeService.getThemes(
    type,
    DEFAULT_PAGE,
    accessToken
  );

  return (
    <>
      <MainHeader menu="DOWNLOAD" />
      <section className={styles.main}>
        <Back className={styles.prev} />
        <div className={styles.themes}>
          <ThemeListWithInifiniteScorll
            defaultThemes={themes}
            getMoreThemes={async (page: number) => {
              "use server";

              const { content: themes } = await themeService.getThemes(
                type,
                page,
                accessToken
              );

              return themes;
            }}
          />
        </div>
      </section>
    </>
  );
};
