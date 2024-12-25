import styles from "./index.module.css";
import { ThemeList } from "./ThemeList";
import { themeService } from "@/services/ThemeService";
import { NotFound } from "@/app/_components/Error/NotFound";
import { cookieService } from "@/services/CookieService";

export const MyTheme = async () => {
  const accessToken = cookieService.getAccessToken();

  const myThemes = await themeService.getMyThemes(accessToken);

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>나의 커스텀 테마</span>
      <div className={styles.box}>
        {myThemes.length > 0 ? (
          <ThemeList themes={myThemes} />
        ) : (
          <NotFound message="만든 커스템 테마가 아직 없어요." />
        )}
      </div>
      <p className={styles.description}>
        <strong>{"더보기 > 커스텀 테마"}</strong>
        에서 새로운 테마를 만들고, 개별 시간표에서 적용할 수 있어요.
      </p>
    </div>
  );
};
