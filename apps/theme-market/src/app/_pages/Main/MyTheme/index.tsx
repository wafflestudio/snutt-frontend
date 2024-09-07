import styles from "./index.module.css";
import { ThemeList } from "./ThemeList";

export const MyTheme = () => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>나의 커스텀 테마</span>
      <div className={styles.box}>
        <ThemeList />
        {/* <NotFound message="만든 커스텀 테마가 아직 없어요." /> */}
      </div>
      <p className={styles.description}>
        <strong>{"더보기 > 커스텀 테마"}</strong>
        에서 새로운 테마를 만들고, 개별 시간표에서 적용할 수 있어요.
      </p>
    </div>
  );
};
