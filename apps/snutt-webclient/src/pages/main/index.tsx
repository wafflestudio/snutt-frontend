import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import { Layout } from '@/components/layout';
import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenAuthContext } from '@/contexts/TokenAuthContext';
import { YearSemesterContext } from '@/contexts/YearSemesterContext';
import { type CourseBook } from '@/entities/semester';
import { useGuardContext } from '@/hooks/useGuardContext';
import { BREAKPOINT } from '@/styles/constants';
import { type SearchService } from '@/usecases/searchService';

import { MainLectureCreateDialog } from './main-lecture-create-dialog';
import { MainLectureEditDialog } from './main-lecture-edit-dialog';
import { MainLectureSection } from './main-lecture-section';
import { MainSearchbar } from './main-searchbar';
import { MainTimetableSection } from './main-timetable-section';

export const Main = ({ courseBooks }: { courseBooks: CourseBook[] }) => {
  const [hoveredLectureId, setHoveredLectureId] = useState<string | null>(null);
  const [previewLectureId, setPreviewLectureId] = useState<string | null>(null);
  const [dialogLectureId, setDialogLectureId] = useState<string | null>(null);
  const [isCreateLectureDialog, setCreateLectureDialog] = useState(false);
  const [lectureTab, setLectureTab] = useState<'result' | 'current' | 'bookmark'>('current');
  const [currentTimetableId, setCurrentTimetableId] = useState<string | null>(null);
  const { year, semester } = useGuardContext(YearSemesterContext);
  const { data: timetables } = useMyTimetables();

  const currentYearSemesterTimetables = timetables?.filter((tt) => tt.year === year && tt.semester === semester);
  const currentTimetable = currentTimetableId
    ? currentYearSemesterTimetables?.find((tt) => tt._id === currentTimetableId)
    : currentYearSemesterTimetables?.[0];

  const { data: currentFullTimetable } = useCurrentFullTimetable(currentTimetable?._id);

  const { mutate, data: searchResult, reset } = useSearchResult();
  const { data: bookmarkLectures } = useBookmarkLectures();

  const searchResultLectures = searchResult?.type === 'success' ? searchResult.data : undefined;
  const dialogLecture = currentFullTimetable?.lecture_list.find((tt) => tt._id === dialogLectureId);
  const previewLecture = [...(searchResultLectures ?? []), ...(bookmarkLectures ?? [])]?.find(
    (item) => item._id === previewLectureId,
  );

  const onClickLecture = (id: string) => setDialogLectureId(id);

  const onSearch = async (value: Parameters<SearchService['search']>[0]) => {
    setLectureTab('result');
    mutate(value);
  };

  return (
    <Layout
      headerChildren={
        <MainSearchbar
          onSearch={onSearch}
          currentFullTimetable={currentFullTimetable}
          resetSearchResult={reset}
          courseBooks={courseBooks}
        />
      }
    >
      <Wrapper>
        <LectureSection
          currentYearSemesterTimetables={currentYearSemesterTimetables}
          tab={lectureTab}
          changeTab={setLectureTab}
          previewLectureId={previewLectureId}
          currentFullTimetable={currentFullTimetable}
          hoveredLectureId={hoveredLectureId}
          setHoveredLectureId={setHoveredLectureId}
          onClickLecture={onClickLecture}
          searchResult={searchResultLectures}
          setPreviewLectureId={setPreviewLectureId}
          bookmarkLectures={bookmarkLectures}
        />
        <TimetableSection
          currentYearSemesterTimetables={currentYearSemesterTimetables}
          currentTimetable={currentTimetable}
          currentFullTimetable={currentFullTimetable}
          previewLecture={previewLecture}
          changeCurrentTimetable={(id) => setCurrentTimetableId(id)}
          hoveredLectureId={hoveredLectureId}
          setHoveredLectureId={setHoveredLectureId}
          onClickLecture={onClickLecture}
          setCurrentTimetable={(id) => setCurrentTimetableId(id)}
          openCreateLectureDialog={() => setCreateLectureDialog(true)}
        />
      </Wrapper>
      <MainLectureEditDialog
        timetableId={currentFullTimetable?._id}
        open={dialogLectureId !== null}
        onClose={() => setDialogLectureId(null)}
        lecture={dialogLecture}
      />
      <MainLectureCreateDialog
        open={isCreateLectureDialog}
        onClose={() => setCreateLectureDialog(false)}
        timetableId={currentFullTimetable?._id}
      />
    </Layout>
  );
};

const useMyTimetables = () => {
  const { timetableService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();

  return useQuery({
    queryKey: ['TimetableService', 'getTimetables', { token }] as const,
    queryFn: ({ queryKey }) => timetableService.getTimetables(queryKey[2]),
    select: (data) => (data?.type === 'success' ? data.data : undefined),
  });
};

const useCurrentFullTimetable = (id: string | undefined) => {
  const { timetableService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();

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
  const { searchService } = useGuardContext(serviceContext);
  return useMutation({
    mutationKey: ['search_query'],
    mutationFn: (value: Parameters<SearchService['search']>[0]) => searchService.search(value),
  });
};

const useBookmarkLectures = () => {
  const { bookmarkService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();
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
