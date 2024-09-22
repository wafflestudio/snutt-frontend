import { cookies } from "next/headers";

import { ACCESS_TOKEN_KEY } from "@/clients/HttpClient";
import { themeService } from "@/services/ThemeService";

import { ThemeList } from "./ThemeList";

export const ThemeDownload = async () => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

  const bestThemes = await themeService.getBestThemes(accessToken);
  const friendsThemes = await themeService.getFriendsThemes(accessToken);

  return (
    <>
      <ThemeList title="Best" themes={bestThemes} />
      <ThemeList title="친구가 쓰고있어요" themes={friendsThemes} />
    </>
  );
};
