'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { useRegister } from '@/api/auth';
import { getFailureMessage } from '@/api/errors';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { AuthPage, FormError } from './AuthPage';

/**
 * 아이디 회원가입. 가입하면 바로 로그인되어 RedirectIfSignedIn 이 메인으로 보낸다.
 * 아이디 · 비밀번호 규칙은 서버가 확인하고 거절 이유(`비밀번호는 영문과 숫자 모두를 포함하는 6~20자여야 합니다`)를 보여 준다.
 * 비밀번호 확인만 여기서 맞춰 본다.
 */
export function RegisterForm() {
  const [localId, setLocalId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const register = useRegister();

  const mismatch = passwordConfirm !== '' && password !== passwordConfirm;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    register.mutate({ localId: localId.trim(), password, email: email.trim() || null });
  };

  return (
    <AuthPage title="회원가입">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <TextField
          aria-label="아이디"
          placeholder="아이디"
          autoComplete="username"
          value={localId}
          onChange={(event) => setLocalId(event.target.value)}
          className="h-10.5"
        />
        <TextField
          type="password"
          aria-label="비밀번호"
          aria-describedby="password-rule"
          placeholder="비밀번호"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-10.5"
        />
        <p id="password-rule" className="text-12-medium text-alternative">
          영문과 숫자를 모두 포함한 6~20자
        </p>
        <TextField
          type="password"
          aria-label="비밀번호 확인"
          aria-invalid={mismatch}
          placeholder="비밀번호 확인"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          className="h-10.5"
        />
        <TextField
          type="email"
          aria-label="이메일 (선택)"
          placeholder="이메일 (선택)"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10.5"
        />
        {mismatch && <FormError>비밀번호가 서로 다릅니다</FormError>}
        {register.error && !mismatch && <FormError>{getFailureMessage(register.error)}</FormError>}
        <Button
          type="submit"
          disabled={!localId.trim() || !password || password !== passwordConfirm || register.isPending}
          className="mt-2 w-full"
        >
          가입하기
        </Button>
      </form>
      <p className="text-center text-13-regular text-alternative">
        이미 계정이 있나요?{' '}
        <Link href="/login" className="text-plain underline">
          로그인
        </Link>
      </p>
    </AuthPage>
  );
}
