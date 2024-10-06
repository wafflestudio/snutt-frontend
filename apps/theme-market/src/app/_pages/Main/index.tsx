import { Input } from "@/app/_components/Input";
import { Tab } from "@/app/_components/Tab";
import { TabContent } from "@/app/_components/Tab/TabContent";
import { MENU } from "@/entities/Menu";

import { ThemeDownload } from "./ThemeDownload";
import { MyTheme } from "./MyTheme";

import styles from "./index.module.css";
import Link from "next/link";

interface Props {
  menu: MENU;
}

export const MainPage = ({ menu }: Props) => {
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
          <TabContent selected={menu === "DOWNLOAD"}>
            <Link href="/download" replace>
              테마 다운로드
            </Link>
          </TabContent>
          <TabContent selected={menu === "MY_THEME"}>
            <Link href="/my" replace>
              내 테마 올리기
            </Link>
          </TabContent>
        </Tab>
      </section>
      <section className={styles.main}>
        {menu === "DOWNLOAD" ? <ThemeDownload /> : <MyTheme />}
      </section>
    </>
  );
};
