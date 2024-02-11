import { SVGProps } from 'react';

const SvgPersonBlack = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 26c0-5.523 4.477-10 10-10h2c5.523 0 10 4.477 10 10v1H4v-1Z" />
      <circle cx={15} cy={9} r={5} />
    </svg>
  );
};

export default SvgPersonBlack;
