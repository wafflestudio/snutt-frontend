import { ThemeColorInfo } from "@/entities/Theme";
import styles from "./index.module.css";
import { Timetable } from "./Timetable";

interface Props {
  colors: ThemeColorInfo[];
}

export const Preview = ({ colors }: Props) => {
  return (
    <section className={styles.wrapper}>
      <p className={styles.title}>미리보기</p>
      <div className={styles.timetable}>
        <Timetable timetableColors={colors} />
      </div>
    </section>
  );
};
