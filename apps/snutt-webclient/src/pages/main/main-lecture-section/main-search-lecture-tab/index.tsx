import { useIsMutating } from '@tanstack/react-query';

import { Loader } from '@/components/loader';
import type { SearchResultLecture } from '@/entities/search';
import type { FullTimetable } from '@/entities/timetable';

import { MainSectionEmptyWrapper } from '../../main-section-empty-wrapper';
import { MainLectureList } from '../main-lecture-list';
import { MainSearchLectureListItem } from './main-search-lecture-list-item';

type Props = {
  searchResult?: SearchResultLecture[];
  currentFullTimetable?: FullTimetable;
  previewLectureId: string | null;
  setPreviewLectureId: (id: string | null) => void;
};

export const MainSearchLectureTab = ({
  searchResult,
  currentFullTimetable,
  setPreviewLectureId,
  previewLectureId,
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
        <MainSearchLectureListItem
          timetableId={currentFullTimetable?._id}
          previewLectureId={previewLectureId}
          lecture={l}
          key={l._id}
          setPreviewLectureId={setPreviewLectureId}
        />
      ))}
    </MainLectureList>
  );
};
