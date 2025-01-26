import { httpClient } from "@/clients/HttpClient";

import { PageResponse } from "@/entities/Page";
import { Theme } from "@/entities/Theme";

type ThemeRepository = {
  getTheme: ({
    id,
    accessToken,
  }: {
    id: string;
    accessToken?: string;
  }) => Promise<Theme>;
  getMyThemes: ({ accessToken }: { accessToken?: string }) => Promise<Theme[]>;
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
  publishTheme: ({
    themeId,
    publishName,
    isAnonymous,
    accessToken,
  }: {
    themeId: string;
    publishName: string;
    isAnonymous: boolean;
    accessToken?: string;
  }) => Promise<void>;
};

const DEFAULT_PAGE = 1;

export const themeRepositry: ThemeRepository = {
  getTheme: async ({ id, accessToken }) => {
    const res = await httpClient.get<Theme>(`/v1/themes/${id}`, accessToken);

    return res;
  },
  getMyThemes: async ({ accessToken }) => {
    const res = await httpClient.get<Theme[]>("/v1/themes", accessToken);
    return res;
  },
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
  publishTheme: async ({ themeId, publishName, isAnonymous, accessToken }) => {
    await httpClient.post(
      `/v1/themes/${themeId}/publish`,
      { publishName, isAnonymous },
      accessToken
    );
  },
};
