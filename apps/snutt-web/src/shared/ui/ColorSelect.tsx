'use client';

import { type ColorPair, type LectureColor } from '@/domain/color';
import { Select } from './Select';

/** 강의 색 견본: 글자색 · 배경색 두 칸 (Figma 색상 드롭다운, 각 20px) */
export function ColorSwatch({ color }: { color: ColorPair }) {
  return (
    <span className="flex shrink-0" aria-hidden>
      <span className="size-5 border-[0.5px] border-line-border" style={{ backgroundColor: color.fg }} />
      <span className="size-5 border-[0.5px] border-line-border" style={{ backgroundColor: color.bg }} />
    </span>
  );
}

export type ColorSelectProps = {
  /** 지금 시간표 테마의 색 목록 */
  palette: readonly ColorPair[];
  value: LectureColor;
  onValueChange: (color: LectureColor) => void;
  id?: string;
  'aria-label'?: string;
  className?: string;
};

/**
 * 강의 색 고르기 (강의 편집, 직접 추가). 팔레트의 색을 `색상1~9` 로 보여 준다. (표시 번호는 index + 1)
 * 앱에서 직접 고른 색(custom)은 목록에 없으므로 버튼에만 `직접 고른 색` 으로 보인다.
 */
export function ColorSelect({
  palette,
  value,
  onValueChange,
  id,
  'aria-label': ariaLabel,
  className,
}: ColorSelectProps) {
  return (
    <Select
      options={palette.map((color, index) => ({
        value: index,
        label: `색상${index + 1}`,
        trailing: <ColorSwatch color={color} />,
      }))}
      value={value.type === 'palette' ? value.index : null}
      onValueChange={(index) => onValueChange({ type: 'palette', index })}
      placeholder={
        value.type === 'custom' && (
          <span className="flex items-center gap-2 text-plain">
            직접 고른 색
            <ColorSwatch color={value.color} />
          </span>
        )
      }
      id={id}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
