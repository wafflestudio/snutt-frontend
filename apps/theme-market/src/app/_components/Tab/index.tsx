import { ReactNode } from "react";
import styles from "./index.module.css";

interface Props {
  children: ReactNode;
}

export const Tab = ({ children }: Props) => {
  return <div className={styles.wrapper}>{children}</div>;
};
