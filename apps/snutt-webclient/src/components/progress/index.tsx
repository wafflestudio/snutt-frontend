import { forwardRef, type HTMLAttributes } from 'react';
import styled from 'styled-components';

interface Props extends HTMLAttributes<HTMLDivElement> {
  progress: number; // 0 ~ 1
  children?: never;
}

export const Progress = forwardRef<HTMLDivElement, Props>(({ progress, ...props }, ref) => {
  return (
    <Outer data-testid="progress-outer" ref={ref} {...props}>
      <Inner data-testid="progress-inner" data-value={progress} $progress={progress} />
    </Outer>
  );
});

export const Outer = styled.div`
  overflow: hidden;
  height: 8px;
  border: 1px solid #1bd0c9;
  border-radius: 4px;
`;

const Inner = styled.div<{ $progress: number }>`
  height: 100%;
  background-color: #1bd0c9;
  transform: translateX(-${({ $progress }) => (1 - $progress) * 100}%);
  transition: transform 0.3s;
`;
