import type { FullTimetable, Timetable } from '@/entities/timetable';
import { MainLectureListitem } from '@/pages/main/main-lecture-section/common/main-lecture-listitem';

import { MainSectionEmptyWrapper } from '../../main-section-empty-wrapper';
import { MainLectureList } from '../common/main-lecture-list';

type Props = {
  timetableData: { isEmpty: true } | { isEmpty: false; timetables: Timetable[]; currentTimetable: FullTimetable };
  hoveredLectureId: string | null;
  setHoveredLectureId: (id: string | null) => void;
  onClickLecture: (id: string) => void;
  openBookmarkTab: () => void;
};

export const MainCurrentLectureTab = ({
  timetableData,
  onClickLecture,
  hoveredLectureId,
  openBookmarkTab,
  setHoveredLectureId,
}: Props) => {
  if (timetableData.isEmpty)
    return <MainSectionEmptyWrapper data-testid="ml-current-no-timetable">시간표가 없습니다.</MainSectionEmptyWrapper>;

  if (timetableData.currentTimetable.lecture_list.length === 0)
    return (
      <MainSectionEmptyWrapper data-testid="ml-current-no-lecture">추가된 강의가 없습니다.</MainSectionEmptyWrapper>
    );

  return (
    <MainLectureList>
      {timetableData.currentTimetable.lecture_list.map((l) => (
        <MainLectureListitem
          key={l._id}
          props={{
            lecture: l,
            openBookmarkTab,
            timetable: {
              currentTimetableId: timetableData.currentTimetable._id,
              isCurrentTimetableLecture: true,
              isHovered: hoveredLectureId === l._id,
              setHovered: (isHovered: boolean) => setHoveredLectureId(isHovered ? l._id : null),
              openDetail: () => onClickLecture(l._id),
            },
          }}
        />
      ))}
    </MainLectureList>
  );
};
