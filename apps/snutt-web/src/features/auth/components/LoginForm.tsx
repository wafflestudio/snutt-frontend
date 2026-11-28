'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { useLocalLogin } from '@/api/auth';
import { getFailureMessage } from '@/api/errors';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';
import { AuthPage, FormError } from './AuthPage';
import { SocialLoginButtons } from './SocialLoginButtons';

type LoginFormProps = {
  /**
   * 가입 · 로그인 뒤 돌아갈 경로. 지정하면 ?next 쿼리보다 우선한다.
   * InlineLogin 이 현재 picker URL 을 넘기면 회원가입 뒤 picker 로 돌아온다.
   */
  next?: string;
  /**
   * 소셜 로그인 버튼을 보여 줄지 (기본 true). timetable-picker 는 RN WebView 에서도 열려 SDK 팝업이 뜨지 않고,
   * 카카오는 화면을 떠났다 돌아와 팝업 창 연결(opener)이 끊기므로 끈다
   */
  socialLogin?: boolean;
};

/** 아이디 · 소셜 로그인. 로그인하면 RedirectIfSignedIn 이 돌아갈 곳으로 보낸다. 비밀번호 찾기는 3-3 */
export function LoginForm({ next: nextProp, socialLogin = true }: LoginFormProps = {}) {
  const [localId, setLocalId] = useState('');
  const [password, setPassword] = useState('');
  const login = useLocalLogin();
  const searchParams = useSearchParams();
  // prop 으로 받은 next 가 우선. 없으면 ?next 쿼리에서 읽는다
  const next = nextProp ?? searchParams.get('next');
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : '/register';

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
      {socialLogin && <SocialLoginButtons next={next ?? '/'} />}
      <p className="text-center text-13-regular text-alternative">
        계정이 없나요?{' '}
        <Link href={registerHref} className="text-plain underline">
          회원가입
        </Link>
      </p>
    </AuthPage>
  );
}
