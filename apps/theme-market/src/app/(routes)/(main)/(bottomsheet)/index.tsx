"use client";

import { BottomSheet } from "@/app/_components/BottomSheet";
import { ThemeDetail } from "@/app/_pages/Main/BottomSheet/ThemeDetail";
import { useThemeStore } from "@/app/_providers/ThemeProvider";

export default function MainBottomSheet() {
  const { theme, setTheme } = useThemeStore((state) => state);

  return (
    <>
      <BottomSheet
        title={"title"}
        isOpen={!!theme}
        onCancel={() => setTheme(null)}
      >
        {theme && <ThemeDetail theme={theme} />}
      </BottomSheet>
      {/* )} */}
    </>
  );
}
