import styles from "./index.module.css";
import { Theme } from "./Theme";

export const ThemeList = () => {
  return (
    <div className={styles.wrapper}>
      <Theme title="새 테마" colors={[]} />
      <Theme title="새 테마" colors={[]} />
      <Theme title="새 테마" colors={[]} />
      <Theme title="새 테마" colors={[]} />
    </div>
  );
};
