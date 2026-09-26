export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'snutt-theme';

/**
 * 첫 화면을 그리기 전에 <html data-theme> 를 정하는 스크립트. layout 의 <head> 에 넣는다.
 * React 가 뜬 뒤에 정하면 새로고침할 때 라이트 → 다크로 깜빡인다.
 *
 * 사용자가 고른 테마가 없으면 OS 설정을 따르고, OS 설정이 바뀌면 따라간다.
 */
export const THEME_INIT_SCRIPT = `(() => {
  const root = document.documentElement;
  const media = matchMedia('(prefers-color-scheme: dark)');
  const stored = () => {
    try {
      const value = localStorage.getItem('${THEME_STORAGE_KEY}');
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  };
  const apply = () => {
    root.dataset.theme = stored() ?? (media.matches ? 'dark' : 'light');
  };
  apply();
  media.addEventListener('change', apply);
})();`;
