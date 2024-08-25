import { Input } from "@/app/_components/Input";
import { Tab } from "@/app/_components/Tab";
import { TabContent } from "@/app/_components/Tab/TabContent";

import styles from "./index.module.css";
import { ThemeList } from "@/app/_pages/Main/Theme/List";

export const MainPage = () => {
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
          <TabContent content="테마 다운로드" selected={true} />
          <TabContent content="내 테마 올리기" selected={false} />
        </Tab>
      </section>
      <section className={styles.main}>
        <ThemeList title="Best" />
      </section>
      {/* <BottomSheet>
        <Theme title="pastel" />
      </BottomSheet> */}
    </>
  );
};
