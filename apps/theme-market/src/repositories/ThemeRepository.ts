import { httpClient } from "@/clients/HttpClient";

import { PageResponse } from "@/entities/Page";
import { Theme } from "@/entities/Theme";

type ThemeRepository = {
  getBestThemes: () => Promise<Theme[]>;
  getFriendsThemes: () => Promise<Theme[]>;
};

export const themeRepositry: ThemeRepository = {
  getBestThemes: async () => {
    const res = await httpClient.get<PageResponse<Theme>>("/v1/themes/best");

    return res.content;
  },
  getFriendsThemes: async () => {
    const res = await httpClient.get<PageResponse<Theme>>("/v1/themes/friends");

    return res.content;
  },
};
