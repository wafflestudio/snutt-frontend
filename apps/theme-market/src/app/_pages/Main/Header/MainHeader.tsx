"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { MENU } from "@/entities/Menu";

import { TabContent } from "@/app/_components/Tab/TabContent";
import { Tab } from "@/app/_components/Tab";
import { Input } from "@/app/_components/Input";

import styles from "./index.module.css";

interface Props {
  menu: MENU;
}

export const MainHeader = ({ menu }: Props) => {
  const router = useRouter();

  return (
    <section className={styles.header}>
      <div className={styles.inputWrapper}>
        <Input
          className={styles.input}
          placeholder="테마를 검색해보세요"
          type="search"
          onComplete={(value: string) => {
            const params = new URLSearchParams({
              query: value,
            });

            router.push(`/search?${params}`);
          }}
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
  );
};
