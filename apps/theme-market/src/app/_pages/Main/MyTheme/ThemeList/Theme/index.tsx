import styles from "./index.module.css";

interface Props {
  title: string;
  colors: string[];
}

export const Theme = ({ title }: Props) => {
  return (
    <article className={styles.wrapper}>
      <div className={styles.preview} />
      <span className={styles.title}>{title}</span>
    </article>
  );
};
