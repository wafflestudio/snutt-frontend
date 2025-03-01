import { PageResponse } from "@/entities/Page";
import { Theme } from "@/entities/Theme";

import { themeRepositry } from "@/repositories/ThemeRepository";

type ThemeService = {
  search: (query: string, accessToken?: string) => Promise<Theme[]>;
  getTheme: (id: string, accessToken?: string) => Promise<Theme>;
  getMyThemes: (accessToken?: string) => Promise<Theme[]>;
  getBestThemes: (
    page?: number,
    accessToken?: string
  ) => Promise<PageResponse<Theme>>;
  getFriendsThemes: (accessToken?: string) => Promise<Theme[]>;
  publishTheme: (
    themeId: string,
    publishName: string,
    isAnonymous: boolean,
    accessToken?: string
  ) => Promise<void>;
  downloadTheme: (
    themeId: string,
    name: string,
    accessToken: string
  ) => Promise<void>;
};

export const themeService: ThemeService = {
  search: async (query: string, accessToken?: string) => {
    return (await themeRepositry.search({ query, accessToken })).content;
  },
  getTheme: async (id: string, accessToken?: string) => {
    return await themeRepositry.getTheme({ id, accessToken });
  },
  getMyThemes: async (accessToken?: string) => {
    return (await themeRepositry.getMyThemes({ accessToken }))
      .filter((theme) => theme.isCustom)
      .map((theme) => ({ ...theme, isMyTheme: true }));
  },
  getBestThemes: async (page?: number, accessToken?: string) => {
    return await themeRepositry.getBestThemes({ page, accessToken });
  },
  getFriendsThemes: async (accessToken?: string) => {
    return await themeRepositry.getFriendsThemes({ accessToken });
  },
  publishTheme: async (
    themeId: string,
    publishName: string,
    isAnonymous: boolean,
    accessToken?: string
  ) => {
    try {
      await themeRepositry.publishTheme({
        themeId,
        publishName,
        isAnonymous,
        accessToken,
      });
    } catch (err) {
      throw err;
    }
  },
  downloadTheme: async (themeId: string, name: string, accessToken: string) => {
    try {
      await themeRepositry.downloadTheme({ themeId, name, accessToken });
    } catch (err) {
      throw err;
    }
  },
};
