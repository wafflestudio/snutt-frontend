type ThemeMode = 'dark' | 'light';

declare global {
  interface Window {
    changeTheme(theme: ThemeMode): void;
  }
}

export {};
