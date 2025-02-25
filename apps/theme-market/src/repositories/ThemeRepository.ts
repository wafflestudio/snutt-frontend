import { httpClient } from "@/clients/HttpClient";

import { PageResponse } from "@/entities/Page";
import { Theme } from "@/entities/Theme";

type ThemeRepository = {
  search: ({
    query,
    accessToken,
  }: {
    query: string;
    accessToken?: string;
  }) => Promise<PageResponse<Theme>>;
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
  }) => Promise<PageResponse<Theme>>;
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
  downloadTheme: ({
    themeId,
    name,
    accessToken,
  }: {
    themeId: string;
    name: string;
    accessToken: string;
  }) => Promise<void>;
};

export const DEFAULT_PAGE = 1;

export const themeRepositry: ThemeRepository = {
  search: async ({ query, accessToken }) => {
    const params = new URLSearchParams({
      query,
    });

    try {
      const res = await httpClient.get<PageResponse<Theme>>(
        `/v1/themes/search?${params}`,
        accessToken
      );

      return res;
    } catch {
      return {
        content: [],
        totalCount: 0,
      };
    }
  },
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

    return res;
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
    try {
      await httpClient.post(
        `/v1/themes/${themeId}/publish`,
        { publishName, isAnonymous },
        accessToken
      );
    } catch (err) {
      throw err;
    }
  },
  downloadTheme: async ({ themeId, name, accessToken }) => {
    try {
      await httpClient.post(
        `/v1/themes/${themeId}/download`,
        { name },
        accessToken
      );
    } catch (err) {
      throw err;
    }
  },
};
