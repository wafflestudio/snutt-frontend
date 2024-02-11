import { SVGProps } from 'react';

const SvgTagBlack = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx={22} cy={8} r={2} strokeWidth={2} />
      <path
        d="M27.5 13.92 13.927 27.503a1.69 1.69 0 0 1-2.396-.002L2.5 18.431l-.706.702.706-.703a1.717 1.717 0 0 1 .002-2.422L16.015 2.496A1.692 1.692 0 0 1 17.212 2h9.09C27.236 2 28 2.761 28 3.709v9c0 .455-.18.89-.5 1.21l.707.708-.708-.707Z"
        strokeWidth={2}
      />
    </svg>
  );
};

export default SvgTagBlack;
