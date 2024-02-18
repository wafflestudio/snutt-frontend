import { SVGProps } from 'react';

const SvgWrite = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="m13.284 48.707 3.52-10.94 7.421 7.42-10.94 3.52ZM18.64 35.926l19.28-19.28 7.497 7.498-19.28 19.28zM39.75 14.752l1.84-1.84a2.705 2.705 0 0 1 3.825 0l3.672 3.673a2.705 2.705 0 0 1 0 3.826l-1.839 1.839-7.498-7.498Z" />
    </svg>
  );
};

export default SvgWrite;
