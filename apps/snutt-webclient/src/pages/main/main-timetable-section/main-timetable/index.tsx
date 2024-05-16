import { useQuery } from '@tanstack/react-query';
import styled, { css, keyframes } from 'styled-components';

import { Button } from '@/components/button';
import { serviceContext } from '@/contexts/ServiceContext';
import type { BaseLecture } from '@/entities/lecture';
import { DAY_LABEL_MAP } from '@/entities/time';
import type { FullTimetable } from '@/entities/timetable';
import { useGuardContext } from '@/hooks/useGuardContext';
import { rangeToArray } from '@/utils/rangeToArray';

type Props = {
  timetable: FullTimetable;
  className?: string;
  hoveredLectureId: string | null;
  setHoveredLectureId: (id: string | null) => void;
  onClickLecture: (id: string) => void;
  previewLecture?: BaseLecture;
  openCreateLectureDialog: () => void;
};

export const MainTimeTable = ({
  timetable,
  className,
  hoveredLectureId,
  setHoveredLectureId,
  onClickLecture,
  previewLecture,
  openCreateLectureDialog,
}: Props) => {
  const { data: colorList } = useColorList();
  const { lectureService, timetableViewService } = useGuardContext(serviceContext);

  const allClassTimes = timetable.lecture_list
    .flatMap((l) => l.class_time_json)
    .concat(...(previewLecture?.class_time_json ?? []));
  const days = rangeToArray(...timetableViewService.getDayRange(allClassTimes));
  const hours = rangeToArray(...timetableViewService.getHourRange(allClassTimes));
  const totalCredit = timetable.lecture_list.reduce((acc, cur) => acc + cur.credit, 0);

  return (
    <Wrapper
      className={className}
      $columnCount={days.length}
      $rowCount={hours.length * 12}
      data-testid="main-timetable"
    >
      {
        // 상단 월화수목금토일
        days.map((d, i) => (
          <DayLabel $colStart={i + 2} key={d} data-testid="main-timetable-day">
            {DAY_LABEL_MAP[d]}
          </DayLabel>
        ))
      }

      {
        // 좌측 시각 레이블 (ex: 8 ~ 22)
        hours.map((t, i) => (
          <Time data-testid="hour-label" $rowStart={i * 12 + 2} key={t}>
            {t}
          </Time>
        ))
      }

      {
        // 가운데 시간표 가로줄들
        hours.map((_, i) => (
          <TimeLine $rowStart={i * 12 + 2} key={_} />
        ))
      }

      {timetable.lecture_list.map((lecture) => {
        if (!colorList) return;

        const { bg: backgroundColor, fg: color } = lectureService.getLectureColor(lecture, colorList);
        const isHovered = lecture._id === hoveredLectureId;
        const isCustomLecture = lectureService.isCustomLecture(lecture);

        return lecture.class_time_json.map((time, i) => {
          const {
            col: [colStart, colEnd],
            row: [rowStart, rowEnd],
          } = timetableViewService.getGridPos(allClassTimes, time, isCustomLecture);

          return (
            <Item
              data-testid="main-timetable-lecture"
              $colStart={colStart}
              $colEnd={colEnd}
              $rowStart={rowStart}
              $rowEnd={rowEnd}
              $hovered={isHovered}
              key={lecture._id + i}
              style={{ backgroundColor, color }}
              onMouseEnter={() => setHoveredLectureId(lecture._id)}
              onMouseLeave={() => setHoveredLectureId(null)}
              onClick={() => onClickLecture(lecture._id)}
            >
              {lecture.course_title}
              <br />
              {time.place}
            </Item>
          );
        });
      })}

      {previewLecture?.class_time_json.map((time, i) => {
        const {
          col: [colStart, colEnd],
          row: [rowStart, rowEnd],
        } = timetableViewService.getGridPos(allClassTimes, time);

        return (
          <Item
            data-testid="main-timetable-preview-lecture"
            $colStart={colStart}
            $colEnd={colEnd}
            $rowStart={rowStart}
            $rowEnd={rowEnd}
            $isPreview
            key={previewLecture._id + i}
          >
            {previewLecture.course_title}
          </Item>
        );
      })}
      <AddLectureButton onClick={openCreateLectureDialog} data-testid="mt-add-custom-lecture">
        직접 추가하기
      </AddLectureButton>
      <TotalCredit data-testid="main-timetable-credit">{totalCredit}학점</TotalCredit>
    </Wrapper>
  );
};

const useColorList = () => {
  const { colorService } = useGuardContext(serviceContext);
  return useQuery({ queryKey: ['colors'], queryFn: () => colorService.getColorList(), staleTime: Infinity });
};

const Wrapper = styled.div<{ $columnCount: number; $rowCount: number }>`
  display: grid;
  grid-template-columns: 45px repeat(${({ $columnCount }) => $columnCount}, 1fr);
  grid-template-rows: 40px repeat(${({ $rowCount }) => $rowCount}, 3px) 1fr;

  height: 100%;
`;

const DayLabel = styled.div<{ $colStart: number }>`
  grid-column: ${({ $colStart }) => `${$colStart} / ${$colStart + 1}`};
  grid-row: 1 / 2;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgb(232, 235, 240);
`;

const Time = styled.div<{ $rowStart: number }>`
  grid-column: 1 / 2;
  grid-row: ${({ $rowStart }) => `${$rowStart} / ${$rowStart + 6}`};
  text-align: right;
  font-size: 14px;
  opacity: 0.4;
  padding-right: 7px;
`;

const TimeLine = styled.div<{ $rowStart: number }>`
  grid-column: 2 / -1;
  grid-row: ${({ $rowStart }) => `${$rowStart + 6} / ${$rowStart + 12}`};
  border-top: 1px solid rgb(248, 249, 250);
  border-bottom: 1px solid rgb(232, 235, 240);
`;

const flash = keyframes`
  from {
    opacity: 0.5;
  }
  to {
    opacity: 0.8;
  }
`;

const TotalCredit = styled.p`
  margin-top: 13px;
  grid-row-end: -1;
  grid-column-end: -1;
  text-align: center;
`;

const AddLectureButton = styled(Button).attrs({ variant: 'outlined', size: 'small' })`
  grid-column: 2 / -2;
  grid-row-end: -1;
  margin-top: 10px;
`;

const Item = styled.div<{
  $colStart: number;
  $colEnd: number;
  $rowStart: number;
  $rowEnd: number;
  $hovered?: boolean;
  $isPreview?: boolean;
}>`
  grid-column: ${({ $colStart, $colEnd }) => `${$colStart} / ${$colEnd}`};
  grid-row: ${({ $rowStart, $rowEnd }) => `${$rowStart} / ${$rowEnd}`};
  font-size: 10px;
  display: flex;
  flex-direction: column;
  padding: 4px 6px;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: filter 0.1s;
  filter: ${({ $hovered = false }) => ($hovered ? 'brightness(40%)' : 'none')};

  ${({ $isPreview = false }) =>
    $isPreview
      ? css`
          box-shadow: 0px 2px 4px #000;
          background-color: #ddd;
          animation: ${flash} 0.5s linear infinite alternate;
        `
      : 'none'};
`;
