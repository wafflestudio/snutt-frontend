import styles from './index.module.css';

export const AppBarTitle = ({ title }: { title: string }) => {
  return <div className={styles.title}>{title}</div>;
};
