import type { SVGProps } from 'react';

export const IcDots = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="28" height="4" viewBox="0 0 28 4" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="2" cy="2" r="2" fill="#000" />
      <circle cx="14" cy="2" r="2" fill="#000" />
      <circle cx="26" cy="2" r="2" fill="#000" />
    </svg>
  );
};
