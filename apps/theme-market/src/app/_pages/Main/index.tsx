"use client";

import { useState } from "react";

import { Input } from "@/app/_components/Input";
import { Tab } from "@/app/_components/Tab";
import { TabContent } from "@/app/_components/Tab/TabContent";
import { MENU } from "@/entities/menu";

import { ThemeDownload } from "./ThemeDownload";
import { MyTheme } from "./MyTheme";

import styles from "./index.module.css";

export const MainPage = () => {
  const [currentMenu, setCurrentMenu] = useState<MENU>("DOWNLOAD");

  return (
    <>
      <section className={styles.header}>
        <div className={styles.inputWrapper}>
          <Input
            className={styles.input}
            placeholder="테마를 검색해보세요"
            type="search"
          />
        </div>
        <Tab>
          <TabContent
            content="테마 다운로드"
            selected={currentMenu === "DOWNLOAD"}
            onClick={() => setCurrentMenu("DOWNLOAD")}
          />
          <TabContent
            content="내 테마 올리기"
            selected={currentMenu === "MY_THEME"}
            onClick={() => setCurrentMenu("MY_THEME")}
          />
        </Tab>
      </section>
      <section className={styles.main}>
        {currentMenu === "DOWNLOAD" ? <ThemeDownload /> : <MyTheme />}
      </section>
      {/* <BottomSheet>
        <Theme title="pastel" />
      </BottomSheet> */}
    </>
  );
};
