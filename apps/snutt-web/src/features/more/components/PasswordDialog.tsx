'use client';

import { type FormEvent, type ReactNode, useId, useState } from 'react';
import { ApiError } from '@/api/client';
import { getFailureMessage } from '@/api/errors';
import { useChangePassword } from '@/api/users';
import { isValidPassword } from '@/domain/user';
import { Button } from '@/shared/ui/Button';
import { Dialog, DialogCloseButton, DialogTitle } from '@/shared/ui/Dialog';
import { TextField } from '@/shared/ui/TextField';

type Errors = { current?: string; next?: string; confirm?: string; form?: string };

// Figma `모달` (비밀번호 변경)의 안내 문구
const MESSAGES = {
  current: '비밀번호를 확인해 주세요.',
  next: '영문과 숫자 포함 6~20자 내외여야 합니다.',
  confirm: '비밀번호가 일치하지 않습니다.',
};

type PasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
};

/**
 * 비밀번호 변경 모달 (Figma `더보기_내 계정` 위의 `모달`): 현재 · 새로운 · 확인 비밀번호, 칸 아래 빨간 안내(12px, special/warning).
 * 바꾸면 서버가 새 토큰을 주고 이전 토큰은 버려진다 (api/users.ts).
 */
export function PasswordDialog({ open, onOpenChange, onChanged }: PasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="flex w-97.5 flex-col px-10 pt-8 pb-8">
      {/* 닫았다 열면 입력을 처음부터 받는다 */}
      {open && (
        <PasswordForm
          onCancel={() => onOpenChange(false)}
          onChanged={() => {
            onOpenChange(false);
            onChanged();
          }}
        />
      )}
    </Dialog>
  );
}

function PasswordForm({ onCancel, onChanged }: { onCancel: () => void; onChanged: () => void }) {
  const id = useId();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const change = useChangePassword();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {};
    if (!current) found.current = MESSAGES.current;
    if (!isValidPassword(next)) found.next = MESSAGES.next;
    if (next !== confirm) found.confirm = MESSAGES.confirm;
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: onChanged,
        // 현재 비밀번호가 틀리면 그 칸에, 서버가 새 비밀번호를 거절하면 그 칸에, 나머지는 버튼 위에 쓴다
        onError: (error) => {
          const type = error instanceof ApiError ? error.type : null;
          if (type === '/problems/password-mismatch') setErrors({ current: MESSAGES.current });
          else if (type === '/problems/invalid-password') setErrors({ next: getFailureMessage(error) });
          else setErrors({ form: getFailureMessage(error) });
        },
      },
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-20-bold">비밀번호 변경</DialogTitle>
        <DialogCloseButton className="-mr-2" />
      </div>

      <div className="mt-7.5 flex flex-col gap-5">
        <PasswordField
          id={`${id}-current`}
          label="현재 비밀번호"
          placeholder="비밀번호를 입력하세요."
          autoComplete="current-password"
          value={current}
          onChange={setCurrent}
          error={errors.current}
        />
        <PasswordField
          id={`${id}-next`}
          label="새로운 비밀번호"
          placeholder="영문과 숫자 모두 포함 6~20자 내외"
          autoComplete="new-password"
          value={next}
          onChange={setNext}
          error={errors.next}
        />
        <PasswordField
          id={`${id}-confirm`}
          label="비밀번호 확인"
          placeholder="비밀번호를 한번 더 입력하세요."
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
        />
      </div>

      {errors.form && <p className="mt-5 text-12-regular text-warning">{errors.form}</p>}

      {/* Figma: 버튼 116 × 38, 사이 8, 오른쪽 정렬. 확인 버튼 글자는 Figma 의 `추가` 대신 `변경` (디자인 문의 4-32) */}
      <div className="mt-7.5 flex justify-end gap-2">
        <Button variant="secondary" className="w-29" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" className="w-29" disabled={change.isPending}>
          변경
        </Button>
      </div>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  label: ReactNode;
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function PasswordField({ id, label, placeholder, autoComplete, value, onChange, error }: PasswordFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-13-regular text-plain">
        {label}
      </label>
      <TextField
        id={id}
        type="password"
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-12-regular text-warning">
          {error}
        </p>
      )}
    </div>
  );
}
