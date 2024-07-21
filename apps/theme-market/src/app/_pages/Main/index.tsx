import { Input } from "@/app/_components/Input";
import { Tab } from "@/app/_components/Tab";
import { TabContent } from "@/app/_components/Tab/TabContent";

import styles from "./index.module.css";

export const MainPage = () => {
  return (
    <div className={styles.wrapper}>
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
    </div>
  );
};
