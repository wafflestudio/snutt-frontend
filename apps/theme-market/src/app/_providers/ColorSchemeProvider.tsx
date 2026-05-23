'use client';

import { useCallback, useEffect } from 'react';

type ThemeMode = 'dark' | 'light';

interface Props {
  children: React.ReactNode;
}

export function ColorSchemeProvider({ children }: Props) {
  const changeTheme = useCallback((theme: ThemeMode) => {
    document.documentElement.dataset.theme = theme;
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, []);

  useEffect(() => {
    window.changeTheme = changeTheme;
  }, [changeTheme]);

  return <>{children}</>;
}
