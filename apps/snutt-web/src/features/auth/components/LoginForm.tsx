'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { useLocalLogin } from '@/api/auth';
import { getFailureMessage } from '@/api/errors';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { AuthPage, FormError } from './AuthPage';

/** 아이디 로그인. 로그인하면 RedirectIfSignedIn 이 돌아갈 곳으로 보낸다. 소셜 로그인은 3-2, 비밀번호 찾기는 3-3 */
export function LoginForm() {
  const [localId, setLocalId] = useState('');
  const [password, setPassword] = useState('');
  const login = useLocalLogin();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ localId: localId.trim(), password });
  };

  return (
    <AuthPage title="시작하기">
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
          placeholder="비밀번호"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-10.5"
        />
        {login.error && <FormError>{getFailureMessage(login.error)}</FormError>}
        <Button type="submit" disabled={!localId.trim() || !password || login.isPending} className="mt-2 w-full">
          로그인
        </Button>
      </form>
      <p className="text-center text-13-regular text-alternative">
        계정이 없나요?{' '}
        <Link href="/register" className="text-plain underline">
          회원가입
        </Link>
      </p>
    </AuthPage>
  );
}
