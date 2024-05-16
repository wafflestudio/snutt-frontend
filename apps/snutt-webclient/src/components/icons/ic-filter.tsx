import type { SVGProps } from 'react';

export const IcFilter = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_2969_13152)">
        <rect x="10" y="13" width="23" height="2" fill="black" />
        <rect x="41" y="13" width="9" height="2" fill="black" />
        <rect x="10" y="28" width="10" height="2" fill="black" />
        <rect x="28" y="28" width="22" height="2" fill="black" />
        <rect x="10" y="44" width="21" height="2" fill="black" />
        <rect x="39" y="44" width="11" height="2" fill="black" />
        <circle cx="24" cy="29" r="5" stroke="black" strokeWidth="2" />
        <circle cx="37" cy="14" r="5" stroke="black" strokeWidth="2" />
        <circle cx="35" cy="45" r="5" stroke="black" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id="clip0_2969_13152">
          <rect width="60" height="60" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
