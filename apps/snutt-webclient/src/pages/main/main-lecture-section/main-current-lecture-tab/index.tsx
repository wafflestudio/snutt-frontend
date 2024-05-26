import { Loader } from '@/components/loader';
import type { FullTimetable, Timetable } from '@/entities/timetable';
import { MainLectureListitem } from '@/pages/main/main-lecture-section/common/main-lecture-listitem';

import { MainSectionEmptyWrapper } from '../../main-section-empty-wrapper';
import { MainLectureList } from '../common/main-lecture-list';

type Props = {
  currentYearSemesterTimetables?: Timetable[];
  currentFullTimetable: FullTimetable | undefined;
  hoveredLectureId: string | null;
  setHoveredLectureId: (id: string | null) => void;
  onClickLecture: (id: string) => void;
  openBookmarkTab: () => void;
};

export const MainCurrentLectureTab = ({
  currentYearSemesterTimetables,
  currentFullTimetable,
  onClickLecture,
  hoveredLectureId,
  openBookmarkTab,
  setHoveredLectureId,
}: Props) => {
  if (currentYearSemesterTimetables && currentYearSemesterTimetables.length === 0)
    return <MainSectionEmptyWrapper data-testid="ml-current-no-timetable">시간표가 없습니다.</MainSectionEmptyWrapper>;

  if (!currentFullTimetable || !currentYearSemesterTimetables)
    return (
      <MainSectionEmptyWrapper>
        <Loader />
      </MainSectionEmptyWrapper>
    );

  if (currentFullTimetable.lecture_list.length === 0)
    return (
      <MainSectionEmptyWrapper data-testid="ml-current-no-lecture">추가된 강의가 없습니다.</MainSectionEmptyWrapper>
    );

  return (
    <MainLectureList>
      {currentFullTimetable.lecture_list.map((l) => (
        <MainLectureListitem
          key={l._id}
          props={{
            lecture: l,
            openBookmarkTab,
            timetable: currentFullTimetable
              ? {
                  currentTimetableId: currentFullTimetable._id,
                  isCurrentTimetableLecture: true,
                  isHovered: hoveredLectureId === l._id,
                  setHovered: (isHovered: boolean) => setHoveredLectureId(isHovered ? l._id : null),
                  openDetail: () => onClickLecture(l._id),
                }
              : { currentTimetableId: null },
          }}
        />
      ))}
    </MainLectureList>
  );
};
