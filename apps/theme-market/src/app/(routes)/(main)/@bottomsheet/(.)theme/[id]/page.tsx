import { BottomSheet } from "@/app/_components/BottomSheet";
import { ThemeDetail } from "@/app/_pages/Main/BottomSheet/ThemeDetail";
import { useUserStore } from "@/app/_providers/UserProvider";
import { authService } from "@/services/AuthService";
import { cookieService } from "@/services/CookieService";
import { themeService } from "@/services/ThemeService";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const id = (await params).id;
  const accessToken = cookieService.getAccessToken();

  const user = await authService.me(accessToken);
  const theme = await themeService.getTheme(id, accessToken);

  const title =
    theme.publishInfo?.authorName == user.nickname.nickname
      ? "내 테마 올리기"
      : "테마 다운로드";
  return (
    <BottomSheet title={title}>
      <ThemeDetail theme={theme} />
    </BottomSheet>
  );
}
