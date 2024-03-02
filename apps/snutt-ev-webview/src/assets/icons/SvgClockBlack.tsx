import { SVGProps } from 'react';

export const SvgClockBlack = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="15px"
      height="15px"
      viewBox="0 0 15 15"
      version="1.1"
      {...props}
    >
      <g id="surface1">
        <path
          style={{
            fill: 'none',
            strokeWidth: 2,
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter',
            // stroke: colors.icon.outlined.stroke,
            strokeMiterlimit: 4,
          }}
          d="M 28 15 C 28 22.179688 22.179688 28 15 28 C 7.820312 28 2 22.179688 2 15 C 2 7.820312 7.820312 2 15 2 C 22.179688 2 28 7.820312 28 15 Z M 28 15 "
          transform="matrix(0.5,0,0,0.5,0,0)"
        />
        <path
          style={{
            fillRule: 'nonzero',
            // fill: colors.icon.outlined.stroke
          }}
          d="M 7 3 L 8 3 L 8 7.5 L 7 7.5 Z M 7 3 "
        />
        <path
          style={{
            fillRule: 'nonzero',
            // fill: colors.icon.outlined.stroke
          }}
          d="M 6.910156 7.367188 L 7.617188 6.660156 L 10.089844 9.132812 L 9.382812 9.839844 Z M 6.910156 7.367188 "
        />
      </g>
    </svg>
  );
};
