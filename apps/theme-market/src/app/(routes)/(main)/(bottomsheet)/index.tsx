"use client";

import { useState } from "react";

import { BottomSheet } from "@/app/_components/BottomSheet";
import { ThemeDetail } from "@/app/_pages/BottomSheet/ThemeDetail";

import { useThemeStore } from "@/app/_providers/ThemeProvider";
import { useUserStore } from "@/app/_providers/UserProvider";

import { themeService } from "@/services/ThemeService";

import { ApiError } from "@/entities/Error";

export default function MainBottomSheet() {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const { theme, setTheme } = useThemeStore((state) => state);
  const { accessToken, user } = useUserStore((state) => state);

  const isPublished = theme?.status !== "PRIVATE";

  const updateIsAnonymous = () => {
    setIsAnonymous((current) => !current);
  };

  const publishTheme = async () => {
    if (!theme) return;

    const isConfirm = window.confirm(
      `'${theme.name}' 테마를 등록하시겠습니까?`
    );

    if (isConfirm)
      try {
        await themeService.publishTheme(
          theme.id,
          theme.name,
          isAnonymous,
          accessToken
        );
      } catch (e) {
        if ((e as Error).name === "API_ERROR") {
          alert((e as ApiError).displayMessage);
        }
      }
  };

  const downloadTheme = async () => {
    if (!theme) return;

    const isConfirm = window.confirm(`해당 테마를 다운로드 하시겠습니까?`);

    if (isConfirm)
      try {
        await themeService.downloadTheme(theme.id, theme.name, accessToken);
      } catch (e) {
        if ((e as ApiError).name === "API_ERROR") {
          alert((e as ApiError).displayMessage);
        }
      }
  };

  const getBottomSheetProps = () => {
    const isMyTheme =
      theme?.publishInfo?.authorName === user.nickname.nickname ||
      theme?.isMyTheme;

    if (isPublished) {
      if (isMyTheme) {
        return {
          title: "테마 다운로드",
        };
      }

      return {
        title: "테마 다운로드",
        confirmText: "담기",
        onConfirm: () => downloadTheme(),
      };
    }

    return {
      title: "내 테마 올리기",
      confirmText: "등록",
      onConfirm: () => publishTheme(),
    };
  };

  return (
    <>
      <BottomSheet
        isOpen={!!theme}
        onCancel={() => setTheme(null)}
        {...getBottomSheetProps()}
      >
        {theme && (
          <ThemeDetail
            theme={theme}
            isAnonymous={isAnonymous}
            isPublished={isPublished}
            updateIsAnonymous={updateIsAnonymous}
          />
        )}
      </BottomSheet>
    </>
  );
}
