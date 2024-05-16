import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { HourMinutePickDialog } from '@/components/hour-minute-pick-dialog';
import { IcClose } from '@/components/icons/ic-close';
import { serviceContext } from '@/contexts/ServiceContext';
import type { WithInternalId } from '@/entities/id';
import type { ClassTime } from '@/entities/lecture';
import { type Day, DAY_LABEL_MAP, type HourMinute24 } from '@/entities/time';
import { useGuardContext } from '@/hooks/useGuardContext';

type Props = {
  lectureTime: WithInternalId<ClassTime>[];
  onChangeLectureTime: (lectureTime: WithInternalId<ClassTime>[]) => void;
};

export const MainLectureEditFormTime = ({ lectureTime, onChangeLectureTime }: Props) => {
  const [openTimeDialog, setOpenTimeDialog] = useState<{
    id: string;
    type: 'start' | 'end';
    defaultTime: HourMinute24;
  } | null>(null);
  const { lectureService, hourMinuteService, timetableViewService } = useGuardContext(serviceContext);
  const handleAddTime = () => onChangeLectureTime([...lectureTime, lectureService.getEmptyClassTime()]);

  const handleDeleteLectureTime = (__id__: string) =>
    onChangeLectureTime(lectureTime.filter((t) => t.__id__ !== __id__));

  return (
    <Wrapper>
      {lectureTime.map((lt, i) => {
        const id = lt.__id__;

        const onChangeDay = (day: Day) =>
          onChangeLectureTime(lectureTime.map((_lt, _i) => (_i === i ? { ..._lt, day } : _lt)));

        const onChangeStartTime = (start_time: string) =>
          onChangeLectureTime(lectureTime.map((_lt, _i) => (_i === i ? { ..._lt, start_time } : _lt)));

        const onChangeEndTime = (end_time: string) =>
          onChangeLectureTime(lectureTime.map((_lt, _i) => (_i === i ? { ..._lt, end_time } : _lt)));

        const onChangeStartEndTime = (start_time: string, end_time: string) =>
          onChangeLectureTime(lectureTime.map((_lt, _i) => (_i === i ? { ..._lt, start_time, end_time } : _lt)));

        const onChangePlace = (place: string) =>
          onChangeLectureTime(lectureTime.map((_lt, _i) => (_i === i ? { ..._lt, place } : _lt)));

        return (
          <TimeItem key={id} data-testid="main-lecture-edit-form-time">
            <Select value={lt.day} onChange={(e) => onChangeDay(Number(e.target.value) as Day)}>
              {([0, 1, 2, 3, 4, 5, 6] as const).map((item) => (
                <option key={item} value={item}>
                  {DAY_LABEL_MAP[item]}
                </option>
              ))}
            </Select>

            <Input
              readOnly
              value={lt.start_time}
              onClick={() =>
                setOpenTimeDialog({ id, type: 'start', defaultTime: timetableViewService.parseTime(lt.start_time) })
              }
            />

            <Input
              readOnly
              value={lt.end_time}
              onClick={() =>
                setOpenTimeDialog({ id, type: 'end', defaultTime: timetableViewService.parseTime(lt.end_time) })
              }
            />

            <Input style={{ width: 'auto' }} value={lt.place} onChange={(e) => onChangePlace(e.target.value)} />

            <CloseIcon
              data-testid="main-lecture-edit-form-delete-time"
              onClick={() => handleDeleteLectureTime(lt.__id__)}
            />
            <HourMinutePickDialog
              isOpen={openTimeDialog?.id === id}
              onClose={() => setOpenTimeDialog(null)}
              onSubmit={
                openTimeDialog?.type === 'start'
                  ? (hour, minute) => {
                      // 시작 시간 바꿨는데 끝 시간 보다 같거나 뒤면 끝시간을 시작시간 + 5분 으로
                      if (!hourMinuteService.isAfter(timetableViewService.parseTime(lt.end_time), { hour, minute })) {
                        const start = timetableViewService.formatTime({ hour, minute });
                        const end = timetableViewService.formatTime(hourMinuteService.addMinute({ hour, minute }, 5));
                        onChangeStartEndTime(start, end);
                      } else onChangeStartTime(timetableViewService.formatTime({ hour, minute }));
                    }
                  : (hour, minute) => onChangeEndTime(timetableViewService.formatTime({ hour, minute }))
              }
              defaultHourMinute={openTimeDialog?.defaultTime}
              range={
                openTimeDialog?.type === 'start'
                  ? { start: { hour: 0, minute: 0 }, end: { hour: 23, minute: 50 } }
                  : {
                      start: hourMinuteService.addMinute(timetableViewService.parseTime(lt.start_time), 5),
                      end: { hour: 23, minute: 55 },
                    }
              }
            />
          </TimeItem>
        );
      })}
      <AddButton data-testid="main-lecture-edit-form-add-time" onClick={handleAddTime}>
        시간 추가
      </AddButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TimeItem = styled.div`
  display: flex;
  gap: 4px;
  height: 30px;
  align-items: center;
`;

const Select = styled.select`
  width: 60px;
  outline: none;
  height: 100%;
`;

const Input = styled.input`
  width: 60px;
  outline: none;
  height: 100%;
`;

const CloseIcon = styled(IcClose)`
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const AddButton = styled(Button).attrs({ variant: 'outlined', color: 'gray', size: 'small' })``;
