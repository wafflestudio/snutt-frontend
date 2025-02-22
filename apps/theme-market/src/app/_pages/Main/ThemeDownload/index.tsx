import { themeService } from "@/services/ThemeService";
import { cookieService } from "@/services/CookieService";

import { DEFAULT_PAGE } from "@/repositories/ThemeRepository";

import { ThemeList } from "./ThemeList";

export const ThemeDownload = async () => {
  const accessToken = cookieService.getAccessToken();

  const { content: bestThemes } = await themeService.getBestThemes(
    DEFAULT_PAGE,
    accessToken
  );
  const friendsThemes = await themeService.getFriendsThemes(accessToken);

  return (
    <>
      <ThemeList title="Best" themes={bestThemes} />
      <ThemeList title="친구가 쓰고있어요" themes={friendsThemes} />
    </>
  );
};
