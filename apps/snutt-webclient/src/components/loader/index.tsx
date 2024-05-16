import { forwardRef, type HTMLProps } from 'react';
import styled, { keyframes } from 'styled-components';

interface Props extends HTMLProps<HTMLSpanElement> {}

const SIZE = 44;
const STROKE_WIDTH = 3.6;

export const Loader = forwardRef<HTMLSpanElement, Props>(({ as, ...props }, ref) => {
  return (
    // TODO: ref 타입에러
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Wrapper ref={ref} {...props}>
      <svg viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}>
        <Circle cx={SIZE} cy={SIZE} r={(SIZE - STROKE_WIDTH) / 2} fill="none" strokeWidth={STROKE_WIDTH} />
      </svg>
    </Wrapper>
  );
});

const circularRotateKeyframe = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const circularDashKeyframe = keyframes`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }
  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`;

const Wrapper = styled.span`
  width: ${SIZE - 4}px;
  height: ${SIZE - 4}px;
  animation: ${circularRotateKeyframe} 1.4s linear infinite;
`;

const Circle = styled.circle`
  stroke: currentColor;
  stroke-dasharray: 80px, 200px;
  stroke-dashoffset: 0;
  animation: ${circularDashKeyframe} 1.4s ease-in-out infinite;
`;
