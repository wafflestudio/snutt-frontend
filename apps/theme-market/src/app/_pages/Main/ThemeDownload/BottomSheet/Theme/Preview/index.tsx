import styles from "./index.module.css";
import { Timetable } from "./Timetable";

export const Preview = () => {
  return (
    <section className={styles.wrapper}>
      <p className={styles.title}>미리보기</p>
      <div className={styles.timetable}>
        <Timetable timetableColors={["#1BD0C8", "#7367F0"]} />
      </div>
    </section>
  );
};
