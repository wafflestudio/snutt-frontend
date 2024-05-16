import styled from 'styled-components';

import { serviceContext } from '@/contexts/ServiceContext';
import type { Position } from '@/entities/timeMask';
import { useGuardContext } from '@/hooks/useGuardContext';

type Props = {
  dragStart: Position | null;
  currentDrag: Position | null;
  cellStatus: boolean[][];
  i: number;
  j: number;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
};

export const MainSearchbarFilterTimeSelectCell = ({
  dragStart,
  currentDrag,
  cellStatus,
  onDragStart,
  onDragEnter,
  onDragEnd,
  i,
  j,
}: Props) => {
  const { timeMaskService } = useGuardContext(serviceContext);
  const isDragging = dragStart !== null;
  const dragMode = dragStart && timeMaskService.getDragMode(cellStatus, dragStart);
  const isInArea = dragStart && currentDrag && timeMaskService.checkIsInArea({ i, j }, dragStart, currentDrag);

  return (
    <Cell
      $isOddRow={i % 2 === 1}
      $selected={cellStatus[i][j]}
      $dragging={isInArea ? dragMode : null}
      onMouseEnter={() => isDragging && onDragEnter()}
      onMouseUp={onDragEnd}
      // 화면 밖에서 mouseUp 했을 때를 대응해주기 위해 !isDragging 조건 추가
      // https://github.com/wafflestudio/snutt-webclient-v2/pull/39
      onMouseDown={() => !isDragging && onDragStart()}
    />
  );
};

const Cell = styled.td<{ $isOddRow: boolean; $selected: boolean; $dragging: 'add' | 'remove' | null }>`
  height: 16px;

  &:not(:first-of-type) {
    border-top: ${({ $isOddRow }) => (!$isOddRow ? '1px solid #ebeef2' : '1px solid rgba(235, 238, 242, 0.3)')};
    border-bottom: ${({ $isOddRow }) => ($isOddRow ? '1px solid #ebeef2' : '1px solid rgba(235, 238, 242, 0.3)')};
  }

  &:nth-of-type(2) {
    border-left: 1px solid #ebeef2;
  }

  &:last-of-type {
    border-right: 1px solid #ebeef2;
  }

  background-color: ${({ $selected, $dragging }) =>
    ({ null: $selected ? '#fac42d' : 'transparent', add: '#f8b20b !important', remove: '#4f48c4 !important' })[
      `${$dragging}`
    ]};

  &:hover {
    background-color: ${({ $selected }) => ($selected ? '#f8b20b' : '#faedc5')};
  }
`;
