import type { SVGProps } from 'react';

export const IcMap = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="15" cy="11.8889" rx="3.66667" ry="3.62963" fill="black" />
      <path
        d="M7.18771 18.0688L7.18755 18.0686C5.81872 16.3745 5 14.2301 5 11.8952C5 6.43944 9.46831 2 15 2C20.532 2 25 6.43942 25 11.8952C25 14.2316 24.1807 16.3764 22.8109 18.0738C21.3574 19.872 19.5968 22.0499 18.049 23.9646C16.8054 25.5029 15.6992 26.8714 14.9999 27.7364C13.4299 25.7944 9.80828 21.3137 7.18771 18.0688Z"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
};
