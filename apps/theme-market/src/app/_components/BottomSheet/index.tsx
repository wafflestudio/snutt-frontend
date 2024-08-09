import styles from "./index.module.css";

interface Props {
  children?: React.ReactNode;
}

export const BottomSheet = ({ children }: Props) => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.bottomSheet}>
        <div className={styles.header}>
          <span>취소</span>
          <span className={styles.title}>테마 다운로드</span>
          <span>담기</span>
        </div>
        <div>{children}</div>
      </section>
    </div>
  );
};
