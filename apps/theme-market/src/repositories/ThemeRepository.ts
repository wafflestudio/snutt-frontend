import { httpClient } from "@/clients/HttpClient";

import { PageResponse } from "@/entities/Page";
import { Theme } from "@/entities/Theme";

type ThemeRepository = {
  getBestThemes: ({
    page,
    accessToken,
  }: {
    page?: number;
    accessToken?: string;
  }) => Promise<Theme[]>;
  getFriendsThemes: ({
    page,
    accessToken,
  }: {
    page?: number;
    accessToken?: string;
  }) => Promise<Theme[]>;
};

const DEFAULT_PAGE = 1;

export const themeRepositry: ThemeRepository = {
  getBestThemes: async ({ page, accessToken }) => {
    const params = new URLSearchParams({
      page: (page || DEFAULT_PAGE).toString(),
    });

    const res = await httpClient.get<PageResponse<Theme>>(
      `/v1/themes/best?${params}`,
      accessToken
    );

    return res.content;
  },
  getFriendsThemes: async ({ page, accessToken }) => {
    const params = new URLSearchParams({
      page: (page || DEFAULT_PAGE).toString(),
    });

    const res = await httpClient.get<PageResponse<Theme>>(
      `/v1/themes/friends?${params}`,
      accessToken
    );

    return res.content;
  },
};
