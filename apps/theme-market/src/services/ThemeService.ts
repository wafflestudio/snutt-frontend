import { Theme } from "@/entities/Theme";

import { themeRepositry } from "@/repositories/ThemeRepository";

type ThemeService = {
  getBestThemes: (accessToken?: string) => Promise<Theme[]>;
  getFriendsThemes: (accessToken?: string) => Promise<Theme[]>;
};

export const themeService: ThemeService = {
  getBestThemes: async (accessToken?: string) => {
    return await themeRepositry.getBestThemes({ accessToken });
  },
  getFriendsThemes: async (accessToken?: string) => {
    return await themeRepositry.getFriendsThemes({ accessToken });
  },
};
