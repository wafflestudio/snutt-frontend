'use client';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import type { Theme } from '@/shared/lib/theme';
import { useTheme } from '@/shared/lib/use-theme';
import { IconCheckCircleFill } from '@/shared/ui/icons';
import { MoreCard, MoreSubPage } from './MoreLayout';

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: '라이트 모드' },
  { value: 'dark', label: '다크 모드' },
];

type ColorModePageProps = { onBack: () => void; onClose: () => void };

/**
 * 색상 모드 (Figma `더보기_색상 모드`): 라이트 · 다크 중 하나. 좌측 바 아래 테마 버튼과 같은 설정이다 (useTheme).
 * 고른 것은 민트 체크 원, 아닌 것은 회색 테두리 원 (필터의 `체크박스 버튼` 모양).
 * 앱의 `시스템 설정` 은 Figma 에 없다. 고른 적이 없으면 OS 설정을 따른다 (디자인 문의 4-32)
 */
export function ColorModePage({ onBack, onClose }: ColorModePageProps) {
  const { theme, setTheme } = useTheme();

  return (
    <MoreSubPage title="색상 모드" onBack={onBack} onClose={onClose}>
      <MoreCard>
        <RadioGroup
          aria-label="색상 모드"
          // 서버 렌더링 중에는 테마를 몰라 아무것도 고르지 않는다
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
          className="flex flex-col"
        >
          {OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex min-h-12 cursor-pointer items-center justify-between border-b border-line-light py-2.5 text-14-regular text-plain last:border-b-0"
            >
              {label}
              <Radio.Root
                value={value}
                className="flex size-3.75 shrink-0 items-center justify-center rounded-full border border-line-divider text-snutt-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint data-checked:border-0"
              >
                <Radio.Indicator render={<IconCheckCircleFill className="size-4.5 shrink-0" />} />
              </Radio.Root>
            </label>
          ))}
        </RadioGroup>
      </MoreCard>
    </MoreSubPage>
  );
}
