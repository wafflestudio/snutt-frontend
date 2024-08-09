import styles from "./index.module.css";

interface Props {
  title: string;
}

export const Theme = ({ title }: Props) => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.info}>
        <span>테마명</span>
        <span>{title}</span>
      </div>
      <div className={styles.colors}>
        <div className={styles.info}>
          <span>색상1</span>
          <div className={styles.colorSet}>
            <div className={styles.color} />
            <div className={styles.color} style={{ background: "#E54459" }} />
          </div>
        </div>
        <div className={styles.info}>
          <span>색상2</span>
          <div className={styles.colorSet}>
            <div className={styles.color} />
            <div className={styles.color} style={{ background: "#F58D3D" }} />
          </div>
        </div>
        <div className={styles.info}>
          <span>색상3</span>
          <div className={styles.colorSet}>
            <div className={styles.color} />
            <div className={styles.color} style={{ background: "#FAC42D" }} />
          </div>
        </div>
        <div className={styles.info}>
          <span>색상4</span>
          <div className={styles.colorSet}>
            <div className={styles.color} />
            <div className={styles.color} style={{ background: "#1BD0C8" }} />
          </div>
        </div>
      </div>
    </section>
  );
};
