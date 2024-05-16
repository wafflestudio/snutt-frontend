import type { SVGProps } from 'react';

export const IcClose = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" {...props}>
      <path
        fill="#000"
        fillRule="evenodd"
        d="M5.776 5.886L9.871 1.79a.49.49 0 0 0 0-.702.502.502 0 0 0-.702.001L5.075 5.184l-3.95-3.95a.49.49 0 0 0-.703-.001.502.502 0 0 0 0 .702l3.952 3.95L.306 9.955a.49.49 0 0 0-.001.702.502.502 0 0 0 .702-.001l4.068-4.068L9.287 10.8a.49.49 0 0 0 .702 0 .502.502 0 0 0-.001-.702L5.776 5.886z"
      />
    </svg>
  );
};
