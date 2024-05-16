import type { SVGProps } from 'react';

export const IcCalendar = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" {...props}>
      <g fill="none" fillRule="evenodd" transform="translate(2 3)">
        <rect width="15.2" height="11.667" x="0.4" y="2.333" stroke="#000" rx="0.8"></rect>
        <rect width="12" height="1" x="2" y="4.667" fill="#000" rx="0.5"></rect>
        <path
          stroke="#000"
          strokeWidth="0.8"
          d="M2.4 1.545H3v-.456a.3.3 0 0 0-.6 0v.456zM7.7 1.544h.6V1.09a.3.3 0 1 0-.6 0v.455zM13 1.544h.6V1.09a.3.3 0 0 0-.6 0v.455z"
        ></path>
      </g>
    </svg>
  );
};
