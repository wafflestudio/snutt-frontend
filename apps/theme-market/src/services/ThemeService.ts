import { Theme } from "@/entities/Theme";

import { themeRepositry } from "@/repositories/ThemeRepository";

type ThemeService = {
  getBestThemes: () => Promise<Theme[]>;
  getFriendsThemes: () => Promise<Theme[]>;
};

export const themeService: ThemeService = {
  getBestThemes: async () => {
    return await themeRepositry.getBestThemes();
  },
  getFriendsThemes: async () => {
    return await themeRepositry.getFriendsThemes();
  },
};
