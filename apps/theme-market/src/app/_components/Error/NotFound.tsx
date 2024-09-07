import Image from "next/image";
import styles from "./index.module.css";

import SvgCat from "@/assets/icons/svgCat.svg";
import { ReactNode } from "react";

interface Props {
  message?: string;
  hasOuterBox?: boolean;
}

export const NotFound = ({ message }: Props) => {
  return (
    <section className={styles.wrapper}>
      <Image src={SvgCat} alt="not-found" />
      <span className={styles.text}>{message || ""}</span>
    </section>
  );
};
