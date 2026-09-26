'use client';

import { type Theme, THEME_STORAGE_KEY } from '@/shared/lib/theme';
import { useTheme } from '@/shared/lib/use-theme';

const THEME_LABELS: Record<Theme, string> = { light: '라이트', dark: '다크' };

/** 개발 전용 페이지의 제목 + 테마 전환 */
export function DevHeader({ title }: { title: string }) {
  const { theme, setTheme } = useTheme();

  const resetTheme = () => {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // 저장소를 쓸 수 없으면 지울 것도 없다
    }
    location.reload();
  };

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-title2 font-bold">{title}</h1>
      <div className="flex gap-2">
        {(['light', 'dark'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className={`rounded-md border border-line-border px-3 py-1.5 text-body ${theme === t ? 'bg-snutt-dark-mint1 text-on-bg' : 'text-plain'}`}
          >
            {THEME_LABELS[t]}
          </button>
        ))}
        <button
          type="button"
          onClick={resetTheme}
          className="rounded-md border border-line-border px-3 py-1.5 text-body text-plain"
        >
          OS 설정 따르기
        </button>
      </div>
    </header>
  );
}
