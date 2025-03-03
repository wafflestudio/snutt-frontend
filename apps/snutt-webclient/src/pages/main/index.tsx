import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import { Layout } from '@/components/layout';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { YearSemesterContext } from '@/contexts/YearSemesterContext';
import { type CourseBook } from '@/entities/semester';
import { type FullTimetable, type Timetable } from '@/entities/timetable';
import { useGuardContext } from '@/hooks/useGuardContext';
import { LoadingPage } from '@/pages/loading';
import { BREAKPOINT } from '@/styles/constants';
import { type SearchService } from '@/usecases/searchService';

import { MainLectureCreateDialog } from './main-lecture-create-dialog';
import { MainLectureEditDialog } from './main-lecture-edit-dialog';
import { MainLectureSection } from './main-lecture-section';
import { MainSearchbar } from './main-searchbar';
import { MainTimetableSection } from './main-timetable-section';

export const Main = ({ courseBooks }: { courseBooks: CourseBook[] }) => {
  const { timetableService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);
  const { year, semester } = useGuardContext(YearSemesterContext);
  const [currentTimetableId, setCurrentTimetableId] = useState<string | null>(null);
  const [lectureTab, setLectureTab] = useState<'result' | 'current' | 'bookmark'>('current');

  const { data: timetablesAndCurrentTimetableId } = useQuery({
    queryKey: ['TimetableService', 'getTimetables', { token }] as const,
    queryFn: ({ queryKey }) => timetableService.getTimetables(queryKey[2]),
    select: (
      data,
    ): undefined | { isEmpty: true } | { isEmpty: false; timetables: Timetable[]; currentTimetableId: string } => {
      if (data.type === 'error') return undefined;
      const currentYearSemesterTimetables = data.data.filter((tt) => tt.year === year && tt.semester === semester);
      if (currentYearSemesterTimetables.length === 0) return { isEmpty: true };
      const fallbackId = currentYearSemesterTimetables.at(0)?._id;
      if (!fallbackId) throw new Error('cannot reach here');
      return {
        isEmpty: false,
        timetables: currentYearSemesterTimetables,
        currentTimetableId:
          currentYearSemesterTimetables.find((tt) => tt._id === currentTimetableId)?._id ?? fallbackId,
      };
    },
  });

  const { data: currentFullTimetable } = useCurrentFullTimetable(
    timetablesAndCurrentTimetableId && !timetablesAndCurrentTimetableId.isEmpty
      ? timetablesAndCurrentTimetableId.currentTimetableId
      : undefined,
  );

  if (!timetablesAndCurrentTimetableId) return <LoadingPage />;

  if (timetablesAndCurrentTimetableId.isEmpty)
    return (
      <MainWithCurrentYearSemesterTimetablesAndCurrentTimetable
        courseBooks={courseBooks}
        timetableData={{ isEmpty: true }}
        onChangeTimetable={setCurrentTimetableId}
        lectureTab={lectureTab}
        onChangeLectureTab={setLectureTab}
      />
    );

  if (!currentFullTimetable) return <LoadingPage />;

  return (
    <MainWithCurrentYearSemesterTimetablesAndCurrentTimetable
      courseBooks={courseBooks}
      timetableData={{
        isEmpty: false,
        timetables: timetablesAndCurrentTimetableId.timetables,
        currentTimetable: currentFullTimetable,
      }}
      onChangeTimetable={setCurrentTimetableId}
      lectureTab={lectureTab}
      onChangeLectureTab={setLectureTab}
    />
  );
};

const MainWithCurrentYearSemesterTimetablesAndCurrentTimetable = ({
  courseBooks,
  timetableData,
  onChangeTimetable,
  lectureTab,
  onChangeLectureTab,
}: {
  courseBooks: CourseBook[];
  timetableData:
    | { isEmpty: true }
    | {
        isEmpty: false;
        timetables: Timetable[];
        currentTimetable: FullTimetable;
      };
  onChangeTimetable: (timetableId: Timetable['_id'] | null) => void;
  lectureTab: 'result' | 'current' | 'bookmark';
  onChangeLectureTab: (tab: 'result' | 'current' | 'bookmark') => void;
}) => {
  const [hoveredLectureId, setHoveredLectureId] = useState<string | null>(null);
  const [previewLectureId, setPreviewLectureId] = useState<string | null>(null);
  const [dialogLectureId, setDialogLectureId] = useState<string | null>(null);
  const [isCreateLectureDialog, setCreateLectureDialog] = useState(false);

  const { mutate, data: searchResult, reset } = useSearchResult();
  const { data: bookmarkLectures } = useBookmarkLectures();

  const searchResultLectures = searchResult?.type === 'success' ? searchResult.data : undefined;
  const dialogLecture = timetableData.isEmpty
    ? null
    : timetableData.currentTimetable.lecture_list.find((tt) => tt._id === dialogLectureId);
  const previewLecture = [...(searchResultLectures ?? []), ...(bookmarkLectures ?? [])]?.find(
    (item) => item._id === previewLectureId,
  );

  const onClickLecture = (id: string) => setDialogLectureId(id);

  const onSearch = async (value: Parameters<SearchService['search']>[0]) => {
    onChangeLectureTab('result');
    mutate(value);
  };

  return (
    <Layout
      headerChildren={
        <MainSearchbar
          onSearch={onSearch}
          currentFullTimetable={timetableData.isEmpty ? null : timetableData.currentTimetable}
          resetSearchResult={reset}
          courseBooks={courseBooks}
        />
      }
    >
      <Wrapper>
        <LectureSection
          tab={lectureTab}
          changeTab={onChangeLectureTab}
          previewLectureId={previewLectureId}
          timetableData={timetableData}
          hoveredLectureId={hoveredLectureId}
          setHoveredLectureId={setHoveredLectureId}
          onClickLecture={onClickLecture}
          searchResult={searchResultLectures}
          setPreviewLectureId={setPreviewLectureId}
          bookmarkLectures={bookmarkLectures}
        />
        <TimetableSection
          timetableData={timetableData}
          previewLecture={previewLecture}
          changeCurrentTimetable={onChangeTimetable}
          hoveredLectureId={hoveredLectureId}
          setHoveredLectureId={setHoveredLectureId}
          onClickLecture={onClickLecture}
          openCreateLectureDialog={() => setCreateLectureDialog(true)}
        />
      </Wrapper>

      {!timetableData.isEmpty && dialogLecture && (
        <MainLectureEditDialog
          timetableId={timetableData.currentTimetable._id}
          open={dialogLectureId !== null}
          onClose={() => setDialogLectureId(null)}
          lecture={dialogLecture}
          timetableTheme={timetableData.currentTimetable.theme}
        />
      )}

      {!timetableData.isEmpty && (
        <MainLectureCreateDialog
          open={isCreateLectureDialog}
          onClose={() => setCreateLectureDialog(false)}
          timetableId={timetableData.currentTimetable._id}
          timetableTheme={timetableData.currentTimetable.theme}
        />
      )}
    </Layout>
  );
};

const useCurrentFullTimetable = (id: string | undefined) => {
  const { timetableService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useQuery({
    queryKey: ['TimetableService', 'getFullTimetable', { id, token }] as const,
    queryFn: ({ queryKey: [, , { id, token }] }) => {
      if (!id) throw new Error('no id');
      return timetableService.getFullTimetable({ id, token });
    },
    enabled: !!id,
    select: (data) => (data?.type === 'success' ? data.data : undefined),
  });
};

const useSearchResult = () => {
  const { searchService } = useGuardContext(ServiceContext);
  return useMutation({
    mutationKey: ['search_query'],
    mutationFn: (value: Parameters<SearchService['search']>[0]) => searchService.search(value),
  });
};

const useBookmarkLectures = () => {
  const { bookmarkService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);
  const ys = useGuardContext(YearSemesterContext);

  return useQuery({
    queryKey: ['BookmarkService', 'getBookmarkLectures', { token, ...ys }] as const,
    queryFn: ({ queryKey }) => bookmarkService.getBookmarkLectures(queryKey[2]),
    select: (data) => (data?.type === 'success' ? data.data : undefined),
  });
};

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
`;

const sectionStyle = css`
  width: 50%;
  margin: 0 auto;

  @media (max-width: ${BREAKPOINT}px) {
    width: 100%;
    max-width: 700px;
  }
`;

const LectureSection = styled(MainLectureSection)`
  ${sectionStyle};
  position: relative;

  @media (max-width: ${BREAKPOINT}px) {
    height: 400px;
  }
`;

const TimetableSection = styled(MainTimetableSection)`
  ${sectionStyle};
  min-height: 680px;
  @media (max-width: ${BREAKPOINT}px) {
    margin-bottom: 30px;
  }
`;
