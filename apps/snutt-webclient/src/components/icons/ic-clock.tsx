import type { SVGProps } from 'react';

export const IcClock = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="15" cy="15" r="13" stroke="black" strokeWidth="2" />
      <rect x="14" y="6" width="2" height="9" fill="black" />
      <rect x="13.818" y="14.7324" width="2" height="7" transform="rotate(-45 13.818 14.7324)" fill="black" />
    </svg>
  );
};
