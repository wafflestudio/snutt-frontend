import { Tab } from "@/app/_components/Tab";
import { TabContent } from "@/app/_components/Tab/TabContent";

export const MainPage = () => {
  return (
    <div>
      <Tab>
        <TabContent content="테마 다운로드" selected={true} />
        <TabContent content="내 테마 올리기" selected={false} />
      </Tab>
    </div>
  );
};
