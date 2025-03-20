export type Theme = {
  id: string;
  name: string;
  userId: string;
  colors: ThemeColorInfo[];
  publishInfo?: ThemePublishInfo;
  isCustom: Boolean;
  isMyTheme?: Boolean;
  status: string;
};

export type ThemeColorInfo = {
  bg: string;
  fg: string;
};

export type ThemePublishInfo = {
  publishName: string;
  authorName: string;
  downloads: number;
};
