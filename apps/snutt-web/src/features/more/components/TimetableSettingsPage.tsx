'use client';

import { useId } from 'react';
import type { LectureBlockDisplay } from '@/domain/timetable-settings';
import { timetableSettings, useTimetableSettings } from '@/shared/lib/timetable-settings';
import { Switch } from '@/shared/ui/Switch';
import { MoreCard, MoreCardRow, MoreGroup, MoreSubPage } from './MoreLayout';

const DISPLAY_OPTIONS: { key: keyof LectureBlockDisplay; label: string }[] = [
  { key: 'title', label: '강의명' },
  { key: 'place', label: '장소' },
  { key: 'lectureNumber', label: '분반 정보' },
  { key: 'instructor', label: '교수' },
];

type TimetableSettingsPageProps = { onBack: () => void; onClose: () => void };

/**
 * 시간표 설정 (Figma `더보기_시간표 설정`): 자동 맞춤 · 꽉찬 시간표, 강의 정보 표시(강의명 · 장소 · 분반 정보 · 교수).
 * 서버에 없는 설정이라 이 브라우저에 저장한다 (shared/lib/timetable-settings). 메인 시간표에 바로 적용된다.
 * `꽉찬 시간표` 는 무엇이 바뀌는지 정해지지 않아 꺼 둔 채로 누를 수 없게 했다 (디자인 문의 4-32)
 */
export function TimetableSettingsPage({ onBack, onClose }: TimetableSettingsPageProps) {
  const id = useId();
  const settings = useTimetableSettings();

  return (
    <MoreSubPage title="시간표 설정" onBack={onBack} onClose={onClose}>
      <MoreCard>
        <MoreCardRow label="자동 맞춤" labelId={`${id}-auto-fit`}>
          <Switch
            labelledBy={`${id}-auto-fit`}
            checked={settings.autoFit}
            onCheckedChange={(autoFit) => timetableSettings.set({ ...settings, autoFit })}
          />
        </MoreCardRow>
        <MoreCardRow label="꽉찬 시간표" labelId={`${id}-full`}>
          <Switch labelledBy={`${id}-full`} checked={false} onCheckedChange={() => {}} disabled />
        </MoreCardRow>
      </MoreCard>

      <MoreGroup label="강의 정보 표시" note="정보가 많을 경우 일부 텍스트가 표시되지 않을 수 있습니다.">
        {DISPLAY_OPTIONS.map(({ key, label }) => (
          <MoreCardRow key={key} label={label} labelId={`${id}-${key}`}>
            <Switch
              labelledBy={`${id}-${key}`}
              checked={settings.display[key]}
              onCheckedChange={(checked) =>
                timetableSettings.set({ ...settings, display: { ...settings.display, [key]: checked } })
              }
            />
          </MoreCardRow>
        ))}
      </MoreGroup>
    </MoreSubPage>
  );
}
