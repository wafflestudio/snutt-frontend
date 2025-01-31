import { MENU } from "@/entities/Menu";

import { ThemeDownload } from "./ThemeDownload";
import { MyTheme } from "./MyTheme";

import styles from "./index.module.css";
import { MainHeader } from "@/app/_pages/Main/Header/MainHeader";

interface Props {
  menu: MENU;
}

export const MainPage = ({ menu }: Props) => {
  return (
    <>
      <MainHeader menu={menu} />
      <section className={styles.main}>
        {menu === "DOWNLOAD" ? <ThemeDownload /> : <MyTheme />}
      </section>
    </>
  );
};
