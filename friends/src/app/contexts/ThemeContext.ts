import { createContext, useContext } from 'react';

import { ThemeValues } from '../styles/theme';

type ThemeContext = ThemeValues;
export const themeContext = createContext<ThemeContext | null>(null);
export function useThemeContext(): ThemeContext;
export function useThemeContext<R>(selector: (data: ThemeContext) => R): R;
export function useThemeContext(selector?: (data: ThemeContext) => unknown) {
  const context = useContext(themeContext);
  if (!context) throw new Error('useThemeContext must be used within a ThemeContext');
  return selector ? selector(context) : context;
}
