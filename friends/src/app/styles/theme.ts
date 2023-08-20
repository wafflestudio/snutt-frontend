import { Color, COLORS } from './colors';

export type ThemeValues = { color: { bg: { default: Color } } };
export const getThemeValues = (theme: 'dark' | 'light'): ThemeValues => {
  return { color: theme === 'dark' ? getDarkThemeColors() : getLightThemeColors() };
};

const getLightThemeColors = (): ThemeValues['color'] => {
  return { bg: { default: COLORS.white } };
};

const getDarkThemeColors = (): ThemeValues['color'] => {
  return { bg: { default: COLORS.gray20 } };
};
