import { createContext, useContext } from 'react';

type TextContext = { allowFontScaling: boolean };
export const textContext = createContext<TextContext | null>(null);
export const useTextContext = () => {
  const context = useContext(textContext);
  if (!context) throw new Error('useTextContext must be used within a ThemeContext');
  return context;
};
