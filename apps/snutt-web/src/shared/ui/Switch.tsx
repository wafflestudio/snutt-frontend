'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { clsx } from 'clsx';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** 스크린 리더가 읽는 이름. 옆 글자와 <label> 로 잇지 않을 때 준다 */
  label?: string;
  /** 옆 글자의 id (aria-labelledby) */
  labelledBy?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Figma `switch` (11-24): iOS 모양 토글 44.42 × 27. 켜면 바탕 `SNUTT/mint`, 끄면 `Fill/Light/Secondary`.
 * `Fill/Light/Secondary` 는 Semantic 밖이라 같은 밝기의 `Line/light` 를 쓴다 (디자인 문의 4-29).
 * 손잡이는 두 테마 모두 흰색이라 두 테마에서 흰색인 `Text/onBG` 를 바탕(bg-current)으로 쓴다.
 * className 은 배치에만 쓴다.
 */
export function Switch({ checked, onCheckedChange, label, labelledBy, disabled, className }: SwitchProps) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={(next) => onCheckedChange(next)}
      disabled={disabled}
      aria-label={label}
      aria-labelledby={labelledBy}
      className={clsx(
        'relative inline-flex h-6.75 w-11 shrink-0 items-center rounded-full bg-line-light transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
        'data-checked:bg-snutt-mint data-disabled:cursor-not-allowed data-disabled:opacity-40',
        className,
      )}
    >
      <BaseSwitch.Thumb
        className={clsx(
          // Figma: 손잡이 23.5px, 그림자 0 2.61 0.87 #000 6% · 0 2.61 6.97 #000 15%
          'block size-[23.5px] rounded-full bg-current text-on-bg transition-transform',
          'shadow-[0_2.61px_0.87px_rgb(0_0_0/6%),0_2.61px_6.97px_rgb(0_0_0/15%)]',
          'translate-x-[1.75px] data-checked:translate-x-[18.75px]',
        )}
      />
    </BaseSwitch.Root>
  );
}
