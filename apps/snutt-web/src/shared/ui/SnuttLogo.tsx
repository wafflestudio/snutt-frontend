import type { SVGProps } from 'react';

/**
 * SNUTT 로고 (design-icons/snutt-logo.svg, Figma `Logo` 24 × 24)
 * Figma 는 테마와 상관없는 `SNUTT/light/*` 색을 써서 다크 테마에서도 색이 같다.
 */
export function SnuttLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <rect width="10.8235" height="15.2308" fill="#E54459" />
      <rect x="13.1758" y="8.76923" width="10.8235" height="15.2308" fill="#1BD0C8" />
      <rect x="13.1758" width="10.8235" height="6.46154" fill="#FAC42D" />
      <rect y="17.5385" width="10.8235" height="6.46154" fill="#A6D930" />
    </svg>
  );
}
