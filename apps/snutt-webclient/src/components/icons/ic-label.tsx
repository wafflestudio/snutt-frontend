import type { SVGProps } from 'react';

export const IcLabel = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M26.4994 12.9199L12.9281 26.5029C12.2651 27.1664 11.194 27.1656 10.5321 26.501L1.49868 17.4304C0.832765 16.7618 0.833929 15.6756 1.50125 15.0084L15.0155 1.49645C15.334 1.17803 15.7643 1 16.2119 1H25.3024C26.2361 1 27 1.76115 27 2.70873V11.7083C27 12.1637 26.8194 12.5996 26.4994 12.9199L27.2068 13.6267L26.4994 12.9199Z"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
};
