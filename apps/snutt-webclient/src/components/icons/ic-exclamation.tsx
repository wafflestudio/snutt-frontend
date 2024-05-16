import type { SVGProps } from 'react';

export const IcExclamation = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" {...props}>
      <g fill="none" fillRule="evenodd">
        <circle cx="10" cy="10" r="7" stroke="#000"></circle>
        <circle cx="10" cy="14" r="1" fill="#000"></circle>
        <path
          fill="#000"
          d="M9.802 5h.396a.8.8 0 0 1 .797.86l-.425 5.611a.572.572 0 1 1-1.14 0l-.425-5.61A.8.8 0 0 1 9.802 5z"
        ></path>
      </g>
    </svg>
  );
};
