"use client";

import { BottomSheet } from "@/app/_components/BottomSheet";
import { ThemeDetail } from "@/app/_pages/Main/BottomSheet/ThemeDetail";
import { useThemeStore } from "@/app/_providers/ThemeProvider";
import { useUserStore } from "@/app/_providers/UserProvider";
import { themeService } from "@/services/ThemeService";
import { useState } from "react";

export default function MainBottomSheet() {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const { theme, setTheme } = useThemeStore((state) => state);

  const { accessToken } = useUserStore((state) => state);
  console.log(theme);

  const updateIsAnonymous = () => {
    setIsAnonymous((current) => !current);
  };

  const publishTheme = () => {
    if (!theme) return;

    const isConfirm = window.confirm(
      `'${theme.name}' 테마를 등록하시겠습니까?`
    );

    if (isConfirm)
      themeService.publishTheme(theme.id, theme.name, isAnonymous, accessToken);
  };

  return (
    <>
      <BottomSheet
        title="내 테마 올리기"
        confirmText="등록"
        isOpen={!!theme}
        onCancel={() => setTheme(null)}
        onConfirm={() => publishTheme()}
      >
        {theme && (
          <ThemeDetail
            theme={theme}
            isAnonymous={isAnonymous}
            updateIsAnonymous={updateIsAnonymous}
          />
        )}
      </BottomSheet>
    </>
  );
}
