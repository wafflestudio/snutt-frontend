import { BottomSheet } from "@/app/_components/BottomSheet";
import { ThemeDetail } from "@/app/_pages/Main/BottomSheet/ThemeDetail";
import { cookieService } from "@/services/CookieService";
import { themeService } from "@/services/ThemeService";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const id = (await params).id;
  const accessToken = cookieService.getAccessToken();

  const theme = await themeService.getTheme(id, accessToken);
  return (
    <BottomSheet>
      <ThemeDetail theme={theme} />
    </BottomSheet>
  );
}
