import { useIsMutating } from '@tanstack/react-query';

import { Loader } from '@/components/loader';
import type { SearchResultLecture } from '@/entities/search';
import type { FullTimetable } from '@/entities/timetable';
import { MainLectureListitem } from '@/pages/main/main-lecture-section/common/main-lecture-listitem';

import { MainSectionEmptyWrapper } from '../../main-section-empty-wrapper';
import { MainLectureList } from '../common/main-lecture-list';

type Props = {
  searchResult?: SearchResultLecture[];
  currentTimetable: { id: FullTimetable['_id']; lectureIds: FullTimetable['lecture_list'][number]['_id'][] } | null;
  previewLectureId: string | null;
  setPreviewLectureId: (id: string | null) => void;
  hoveredLectureId: string | null;
  setHoveredLectureId: (id: string | null) => void;
  onClickLecture: (id: string) => void;
  openBookmarkTab: () => void;
};

export const MainSearchLectureTab = ({
  searchResult,
  currentTimetable,
  setPreviewLectureId,
  previewLectureId,
  hoveredLectureId,
  setHoveredLectureId,
  onClickLecture,
  openBookmarkTab,
}: Props) => {
  const isSearchResultMutating = useIsMutating({ mutationKey: ['search_query'] });

  if (isSearchResultMutating)
    return (
      <MainSectionEmptyWrapper>
        <Loader data-testid="ml-search-loader" />
      </MainSectionEmptyWrapper>
    );

  if (!searchResult) return <MainSectionEmptyWrapper>강의를 검색하세요</MainSectionEmptyWrapper>;

  if (searchResult.length === 0) return <MainSectionEmptyWrapper>검색 결과가 없습니다.</MainSectionEmptyWrapper>;

  return (
    <MainLectureList>
      {searchResult?.map((l) => (
        <MainLectureListitem
          key={l._id}
          props={{
            lecture: l,
            openBookmarkTab,
            timetable: currentTimetable
              ? currentTimetable.lectureIds.includes(l._id)
                ? {
                    currentTimetableId: currentTimetable.id,
                    isCurrentTimetableLecture: true,
                    isHovered: hoveredLectureId === l._id,
                    setHovered: (isHovered: boolean) => setHoveredLectureId(isHovered ? l._id : null),
                    openDetail: () => onClickLecture(l._id),
                  }
                : {
                    currentTimetableId: currentTimetable.id,
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
