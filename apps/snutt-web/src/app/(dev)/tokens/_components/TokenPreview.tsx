'use client';

import { DevHeader } from '@/app/(dev)/_components/DevHeader';
import { DESIGN_TOKENS } from '@/shared/lib/design-tokens';

type DesignToken = (typeof DESIGN_TOKENS)[number];

/** --text-color-normal → text-normal, --color-line-divider → bg-line-divider */
const toClassName = (cssVariable: string) =>
  cssVariable.replace('--text-color-', 'text-').replace('--background-color-', 'bg-').replace('--color-', 'bg-');

const groupTokens = () => {
  const groups = new Map<string, DesignToken[]>();
  for (const token of DESIGN_TOKENS) {
    const group = token.name.split('/')[0];
    groups.set(group, [...(groups.get(group) ?? []), token]);
  }
  return [...groups];
};

export function TokenPreview() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-10">
      <DevHeader title="디자인 토큰" />

      {groupTokens().map(([group, tokens]) => (
        <section key={group} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{group}</h2>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {tokens.map((token) => (
              <li key={token.cssVariable} className="flex items-center gap-3">
                <span
                  className="size-10 shrink-0 rounded-md border border-line-border"
                  style={{ background: `var(${token.cssVariable})` }}
                />
                <div className="flex min-w-0 flex-col text-xs">
                  <span className="text-sm font-medium">{token.name}</span>
                  <code className="text-alternative">{toClassName(token.cssVariable)}</code>
                  <span className="text-alternative">
                    {token.light} / {token.dark}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">글꼴 (Pretendard)</h2>
        <div className="flex flex-col gap-2 text-base">
          <p className="font-normal">400 · 서울대학교 시간표 SNUTT 0123456789</p>
          <p className="font-medium">500 · 서울대학교 시간표 SNUTT 0123456789</p>
          <p className="font-semibold">600 · 서울대학교 시간표 SNUTT 0123456789</p>
          <p className="font-bold">700 · 서울대학교 시간표 SNUTT 0123456789</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">조합 예시</h2>
        <div className="flex gap-4">
          <div className="flex w-64 flex-col gap-1 rounded-lg border border-line-border bg-normal p-4">
            <span className="font-bold">미국학개론</span>
            <span className="text-sm text-plain">정상준 / 3학점</span>
            <span className="text-sm text-assistive">(없음)</span>
          </div>
          <div className="flex w-64 flex-col gap-2 rounded-lg bg-light p-4">
            <div className="rounded-md bg-light-field px-3 py-2 text-sm text-med">강의명, 교수명을 검색하세요</div>
            <div className="border-t border-line-divider" />
            <span className="text-sm text-warning">삭제</span>
          </div>
          <div className="flex h-24 w-32 flex-col items-center justify-center rounded-sm bg-snutt-red text-sm text-on-bg">
            <span>경영전략</span>
            <span className="font-bold">058-331</span>
          </div>
        </div>
      </section>
    </main>
  );
}
