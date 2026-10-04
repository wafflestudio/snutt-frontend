import type { SVGProps } from 'react';

/**
 * SNUTT 로고 (snutt-webclient `ic-logo` 와 같은 모양, 색은 SNUTT 토큰)
 * 임시: Figma 의 로고는 내보낼 수 없어 기존 벡터를 썼다. 받으면 바꾼다. (개발 플랜 미결 사항 "아이콘 교체")
 */
export function SnuttLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 27 27" aria-hidden {...props}>
      <path className="fill-snutt-red" d="M0 0h12.226v17.066H0z" />
      <path className="fill-snutt-mint" d="M14.774 9.934H27V27H14.774z" />
      <path className="fill-snutt-yellow" d="M14.774 0H27v7.387H14.774z" />
      <path className="fill-snutt-lime" d="M0 19.613h12.226V27H0z" />
    </svg>
  );
}
