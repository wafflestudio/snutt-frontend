import type { ReactNode } from 'react';
import { SnuttLogo } from '@/shared/ui/SnuttLogo';

/**
 * 로그인 · 회원가입 화면의 틀: 가운데에 로고와 제목, 그 아래 폼.
 * Figma 완료 영역에 웹 로그인 화면이 없어 예전 웹 디자인(`소셜로그인(구)` 의 `05_login`) 구성을 따른다 (디자인 문의 4-12)
 */
export function AuthPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-normal px-4 py-10">
      <div className="flex w-80 flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <SnuttLogo className="size-10" />
          <h1 className="text-22-bold text-normal">{title}</h1>
        </div>
        {children}
      </div>
    </main>
  );
}

/** 서버가 거절한 이유 (`잘못된 비밀번호입니다. 다시 입력해 주세요`) */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-13-regular text-warning">
      {children}
    </p>
  );
}
