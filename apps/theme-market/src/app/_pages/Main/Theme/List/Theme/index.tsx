import Image from "next/image";
import styles from "./index.module.css";

import SvgDownload from "@/assets/icons/svgDownload.svg";

export const Theme = () => {
  return (
    <article className={styles.wrapper}>
      <div className={styles.metadata}>
        <div className={styles.info}>
          <h2 className={styles.title}>SNUTT</h2>
          <span className={styles.creator}>SNUTT</span>
        </div>
        <div className={styles.download}>
          <Image src={SvgDownload} alt="download" />
          <span>10</span>
        </div>
      </div>
      <div className={styles.colorList}>
        <div className={styles.color} style={{ backgroundColor: "#6F223D" }} />
        <div className={styles.color} style={{ backgroundColor: "#DE789D" }} />
        <div className={styles.color} style={{ backgroundColor: "#AA395D" }} />
        <div className={styles.color} style={{ backgroundColor: "#D44A7A" }} />
      </div>
    </article>
  );
};
