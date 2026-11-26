'use client';

import { type ReactNode, useId, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';

type InlineFieldFormProps = {
  /** 입력칸 위의 안내. 입력칸 이름으로도 쓴다 */
  label: string;
  defaultValue?: string;
  placeholder?: string;
  submitLabel: string;
  /** 지금 입력이 잘못됐으면 그 까닭. 비어 있을 때는 부르지 않는다 */
  validate?: (value: string) => string | null;
  /** 서버가 거절한 까닭 등 바깥에서 정한 오류. 입력을 고치면 부르는 쪽이 지운다 */
  error?: ReactNode;
  /** 앞뒤 공백을 지운 값 */
  onSubmit: (value: string) => void;
  onCancel: () => void;
  /** 입력이 바뀔 때 (바깥 오류를 지울 때) */
  onChange?: () => void;
  pending?: boolean;
};

/**
 * 목록 안에서 한 줄을 입력받는 상자 (Figma `Nickname Row`: 친구 이름 설정 · 닉네임으로 친구 요청).
 * 배경 Background/light, 둥글기 10, 여백 14 · 20, 간격 10. 아래 줄 왼쪽에 오류(special/warning), 오른쪽에 취소 · 확인.
 * Enter 로 확인, Esc 로 취소.
 */
export function InlineFieldForm({
  label,
  defaultValue = '',
  placeholder,
  submitLabel,
  validate,
  error,
  onSubmit,
  onCancel,
  onChange,
  pending = false,
}: InlineFieldFormProps) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const trimmed = value.trim();
  const invalid = trimmed ? (validate?.(value) ?? null) : null;
  const message = error ?? invalid;

  return (
    <form
      className="flex flex-col gap-2.5 rounded-[10px] bg-light px-5 py-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!trimmed || invalid || pending) return;
        onSubmit(trimmed);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel();
      }}
    >
      <label htmlFor={id} className="text-14-regular text-alternative">
        {label}
      </label>
      <TextField
        id={id}
        value={value}
        placeholder={placeholder}
        // 목록 안에서 열리므로 바로 입력할 수 있게 한다
        autoFocus
        aria-invalid={message ? true : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          onChange?.();
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <p role={message ? 'alert' : undefined} className="min-w-0 text-13-regular text-warning">
          {message}
        </p>
        <div className="flex shrink-0 gap-1.5">
          <Button variant="outline" size="sm" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" size="sm" disabled={!trimmed || invalid !== null || pending}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
