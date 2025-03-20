import { ReactNode } from "react";

import MainBottomSheet from "./(bottomsheet)";
import MainModal from "./(modal)";

import styles from "./index.module.css";

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <>
      <div className={styles.layout}>{children}</div>
      <MainBottomSheet />
      <MainModal />
    </>
  );
}
