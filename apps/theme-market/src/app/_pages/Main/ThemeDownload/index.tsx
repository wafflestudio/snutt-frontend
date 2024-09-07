import { ThemeList } from "../Theme/List";

export const ThemeDownload = () => {
  return (
    <>
      <ThemeList title="Best" />
      <ThemeList title="친구가 쓰고있어요." noTheme={true} />
    </>
  );
};
