import { Loader } from '@/components/loader';
import { type BaseLecture } from '@/entities/lecture';
import type { FullTimetable } from '@/entities/timetable';
import { MainLectureListitem } from '@/pages/main/main-lecture-section/common/main-lecture-listitem';

import { MainSectionEmptyWrapper } from '../../main-section-empty-wrapper';
import { MainLectureList } from '../main-lecture-list';

type Props = {
  lectures: BaseLecture[] | undefined;
  currentFullTimetable?: FullTimetable;
  previewLectureId: string | null;
  setPreviewLectureId: (id: string | null) => void;
  hoveredLectureId: string | null;
  setHoveredLectureId: (id: string | null) => void;
  onClickLecture: (id: string) => void;
  openBookmarkTab: () => void;
};

export const MainBookmarkLectureTab = ({
  lectures,
  currentFullTimetable,
  hoveredLectureId,
  onClickLecture,
  previewLectureId,
  setHoveredLectureId,
  setPreviewLectureId,
  openBookmarkTab,
}: Props) => {
  if (lectures === undefined)
    return (
      <MainSectionEmptyWrapper>
        <Loader data-testid="ml-search-loader" />
      </MainSectionEmptyWrapper>
    );

  if (lectures.length === 0) return <MainSectionEmptyWrapper>관심 강좌가 없습니다.</MainSectionEmptyWrapper>;

  return (
    <MainLectureList>
      {lectures?.map((l) => (
        <MainLectureListitem
          key={l._id}
          props={{
            lecture: l,
            openBookmarkTab,
            timetable: currentFullTimetable
              ? currentFullTimetable.lecture_list.some((ll) => ll._id === l._id)
                ? {
                    currentTimetableId: currentFullTimetable._id,
                    isCurrentTimetableLecture: true,
                    isHovered: hoveredLectureId === l._id,
                    setHovered: (isHovered: boolean) => setHoveredLectureId(isHovered ? l._id : null),
                    openDetail: () => onClickLecture(l._id),
                  }
                : {
                    currentTimetableId: currentFullTimetable._id,
                    isCurrentTimetableLecture: false,
                    isPreview: previewLectureId === l._id,
                    setPreview: (isPreview: boolean) => setPreviewLectureId(isPreview ? l._id : null),
                  }
              : { currentTimetableId: null },
          }}
        />
      ))}
    </MainLectureList>
  );
};
