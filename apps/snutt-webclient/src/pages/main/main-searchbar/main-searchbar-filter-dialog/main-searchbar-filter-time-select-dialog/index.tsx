import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import { DAY_LABEL_MAP, dayList } from '@/entities/time';
import { type CellStatus, type Position, timeMaskHours } from '@/entities/timeMask';
import { useGuardContext } from '@/hooks/useGuardContext';

import { MainSearchbarFilterTimeSelectCell } from './main-searchbar-filter-time-select-cell';

type Props = { open: boolean; onClose: () => void; onChangeBitMask: (bm: number[]) => void };

/**
 * @note 테스트코드가 붙어있지 않습니다. 수정할 때 주의해 주세요!
 */
export const MainSearchbarFilterTimeSelectDialog = ({ open, onClose, onChangeBitMask }: Props) => {
  const { timeMaskService, errorService } = useGuardContext(serviceContext);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [currentDrag, setCurrentDrag] = useState<Position | null>(null);
  const [cellStatus, setCellStatus] = useState<CellStatus>(
    timeMaskService.getInitialCellStatus(timeMaskHours.length * 2, dayList.length),
  );

  const onConfirm = () => {
    onChangeBitMask(timeMaskService.getBitMask(cellStatus));
    onClose();
  };

  const endDrag = () => {
    try {
      if (!dragStart || !currentDrag)
        return errorService.captureError(new Error('endDrag no dragStart no currentDrag'));
      setCellStatus(timeMaskService.getUpdatedCellStatus(cellStatus, dragStart, currentDrag));
    } catch (err) {
      // TODO: capture sentry
    } finally {
      setDragStart(null);
      setCurrentDrag(null);
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialog.Title>검색하고 싶은 시간들을 드래그하세요</StyledDialog.Title>
      <StyledDialog.Content>
        <Table>
          <thead>
            <tr>
              <th />
              {dayList.map((d) => (
                <Day key={d}>{DAY_LABEL_MAP[d]}</Day>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeMaskHours
              .flatMap((t) => [t, ''])
              .map((t, i) => (
                <tr key={i}>
                  <Time>{t}</Time>
                  {dayList.map((d, j) => (
                    <MainSearchbarFilterTimeSelectCell
                      i={i}
                      j={j}
                      key={j}
                      onDragStart={() => {
                        setDragStart({ i, j });
                        setCurrentDrag({ i, j });
                      }}
                      onDragEnter={() => setCurrentDrag({ i, j })}
                      onDragEnd={endDrag}
                      dragStart={dragStart}
                      currentDrag={currentDrag}
                      cellStatus={cellStatus}
                    />
                  ))}
                </tr>
              ))}
          </tbody>
        </Table>
      </StyledDialog.Content>
      <StyledDialog.Actions>
        <Button
          size="small"
          color="gray"
          data-testid="layout-searchbar-filter-time-select-dialog-cancel"
          onClick={onClose}
        >
          취소
        </Button>
        <Button size="small" onClick={onConfirm}>
          확인
        </Button>
      </StyledDialog.Actions>
    </StyledDialog>
  );
};

const StyledDialog = styled(Dialog)`
  width: 500px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Day = styled.th`
  height: 40px;
  padding: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgb(232, 235, 240);
  user-select: none;
`;

const Time = styled.td`
  text-align: right;
  font-size: 14px;
  opacity: 0.4;
  padding-right: 7px;
  height: 16px;
  user-select: none;
`;
