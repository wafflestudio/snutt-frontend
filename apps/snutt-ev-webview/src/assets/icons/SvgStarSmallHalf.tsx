import { SVGProps } from 'react';

const SvgStarSmallHalf = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M11.549.927c.3-.921 1.603-.921 1.902 0l2.08 6.401a1 1 0 0 0 .951.691h6.73c.97 0 1.372 1.24.588 1.81l-5.445 3.955a1 1 0 0 0-.363 1.118l2.08 6.402c.3.921-.755 1.687-1.539 1.118l-5.445-3.956a1 1 0 0 0-1.176 0l-5.445 3.956c-.784.57-1.838-.197-1.539-1.118l2.08-6.401a1 1 0 0 0-.363-1.119L1.2 9.828c-.784-.57-.381-1.809.587-1.809h6.731a1 1 0 0 0 .951-.69L11.55.926Z"
      fill="#2ECFC7"
    />
    <mask
      id="star_small_half_svg__a"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={25}
      height={23}
    >
      <path
        d="M11.549.927c.3-.921 1.603-.921 1.902 0l2.08 6.401a1 1 0 0 0 .951.691h6.73c.97 0 1.372 1.24.588 1.81l-5.445 3.955a1 1 0 0 0-.363 1.118l2.08 6.402c.3.921-.755 1.687-1.539 1.118l-5.445-3.956a1 1 0 0 0-1.176 0l-5.445 3.956c-.784.57-1.838-.197-1.539-1.118l2.08-6.401a1 1 0 0 0-.363-1.119L1.2 9.828c-.784-.57-.381-1.809.587-1.809h6.731a1 1 0 0 0 .951-.69L11.55.926Z"
        fill="#2ECFC7"
      />
    </mask>
    <g mask="url(#star_small_half_svg__a)">
      <path fill="#C4C4C4" d="M12.5-2h24.167v27.067H12.5z" />
    </g>
  </svg>
);

export default SvgStarSmallHalf;
