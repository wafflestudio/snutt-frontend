import { themeService } from "@/services/ThemeService";
import { cookieService } from "@/services/CookieService";

import { DEFAULT_PAGE } from "@/repositories/ThemeRepository";

import { ThemeListPreview } from "./ThemeListPreview";

export const ThemeDownload = async () => {
  const accessToken = cookieService.getAccessToken();

  const { content: bestThemes } = await themeService.getBestThemes(
    DEFAULT_PAGE,
    accessToken
  );
  const { content: friendsThemes } = await themeService.getFriendsThemes(
    DEFAULT_PAGE,
    accessToken
  );

  return (
    <>
      <ThemeListPreview title="Best" type="BEST" themes={bestThemes} />
      <ThemeListPreview
        title="친구가 쓰고있어요"
        type="FRIENDS"
        themes={friendsThemes}
      />
    </>
  );
};
