"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomSheet } from "@/app/_components/BottomSheet";
import { ThemeDetail } from "@/app/_pages/BottomSheet/ThemeDetail";

import { useModalStore } from "@/app/_providers/ModalProvider";
import { useThemeStore } from "@/app/_providers/ThemeProvider";
import { useUserStore } from "@/app/_providers/UserProvider";

import { themeService } from "@/services/ThemeService";

import { ApiError } from "@/entities/Error";

export default function MainBottomSheet() {
  const router = useRouter();

  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [publishName, setPublishName] = useState<string>("");

  const { theme, setTheme } = useThemeStore((state) => state);
  const { accessToken, user } = useUserStore((state) => state);
  const { setModal, closeModal } = useModalStore((state) => state);

  const isPublished = theme?.status !== "PRIVATE";

  useEffect(() => {
    setPublishName(theme?.name || "");
    document.body.style["overflow"] = !!theme ? "hidden" : "scroll";
  }, [theme]);

  const updatePublishName = (publishName: string) => {
    setPublishName(publishName);
  };

  const updateIsAnonymous = () => {
    setIsAnonymous((current) => !current);
  };

  const publishTheme = async () => {
    if (!theme) return;

    setModal({
      isOpen: true,
      type: "CONFIRM",
      description: `'${publishName}' 테마를\n등록하시겠습니까?`,
      onConfirm: async () => {
        try {
          await themeService.publishTheme(
            theme.id,
            publishName,
            isAnonymous,
            accessToken
          );
          setModal({
            isOpen: true,
            type: "ALERT",
            description: "테마 등록이 완료되었습니다",
            onConfirm: () => {
              router.refresh();
              setTheme(null);
            },
          });
        } catch (e) {
          if ((e as Error).name === "API_ERROR") {
            setModal({
              isOpen: true,
              type: "ALERT",
              description: (e as ApiError).displayMessage,
            });
          }
        }
      },
    });
  };

  const downloadTheme = async () => {
    if (!theme) return;

    setModal({
      isOpen: true,
      type: "CONFIRM",
      description: `해당 테마를 다운로드 하시겠습니까?`,
      onConfirm: async () => {
        try {
          await themeService.publishTheme(
            theme.id,
            publishName,
            isAnonymous,
            accessToken
          );
          setModal({
            isOpen: true,
            type: "ALERT",
            description: "테마 다운로드가 완료되었습니다",
            onConfirm: () => {
              router.refresh();
              setTheme(null);
            },
          });
        } catch (e) {
          if ((e as Error).name === "API_ERROR") {
            setModal({
              isOpen: true,
              type: "ALERT",
              description: (e as ApiError).displayMessage,
            });
          }
        }
      },
    });
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
            publishName={publishName || theme.name}
            isAnonymous={isAnonymous}
            isPublished={isPublished}
            updatePublishName={updatePublishName}
            updateIsAnonymous={updateIsAnonymous}
          />
        )}
      </BottomSheet>
    </>
  );
}
