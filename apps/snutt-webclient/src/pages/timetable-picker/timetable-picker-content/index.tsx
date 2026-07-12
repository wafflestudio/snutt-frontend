import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Loader } from '@/components/loader';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { type Timetable } from '@/entities/timetable';
import { useFullTimetable } from '@/hooks/useFullTimetable';
import { useGuardContext } from '@/hooks/useGuardContext';
import { LoadingPage } from '@/pages/loading';
import { MainTimeTable } from '@/pages/main/main-timetable-section/main-timetable';

import { TimetablePickerGroupedList } from '../timetable-picker-grouped-list';

type Props = {
  targetOrigin: string | null;
};

export const TimetablePickerContent = ({ targetOrigin }: Props) => {
  const { timetableService, semesterService, timetablePickerService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  const { data: courseBooks } = useQuery({
    queryKey: ['SemesterService', 'getCourseBooks', { token }] as const,
    queryFn: ({ queryKey }) => semesterService.getCourseBooks(queryKey[2]),
    staleTime: Infinity,
  });

  const { data: allTimetables } = useQuery({
    queryKey: ['TimetableService', 'getTimetables', { token }] as const,
    queryFn: ({ queryKey }) => timetableService.getTimetables(queryKey[2]),
    select: (data) => (data.type === 'success' ? data.data : undefined),
  });

  const currentCourseBook = courseBooks?.[0];

  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);

  const effectiveSelectedId = useMemo(() => {
    if (!allTimetables || allTimetables.length === 0) return null;
    if (selectedTimetableId) return selectedTimetableId;

    if (currentCourseBook) {
      const currentYearSemesterTimetables = allTimetables.filter(
        (tt) => tt.year === currentCourseBook.year && tt.semester === currentCourseBook.semester,
      );
      if (currentYearSemesterTimetables.length > 0) {
        return currentYearSemesterTimetables[0]._id;
      }
    }

    return allTimetables[0]._id;
  }, [allTimetables, selectedTimetableId, currentCourseBook]);

  const { data: selectedFullTimetable, isLoading: isLoadingTimetable } = useFullTimetable(
    effectiveSelectedId ?? undefined,
  );

  const hasOpener = useMemo(() => window.opener !== null, []);

  if (!courseBooks || !allTimetables || !currentCourseBook) {
    return (
      <Wrapper>
        <LoadingContainer>
          <Loader />
        </LoadingContainer>
      </Wrapper>
    );
  }

  if (allTimetables.length === 0) {
    return (
      <Wrapper>
        <LeftPane>
          <EmptyMessage>시간표가 없습니다</EmptyMessage>
        </LeftPane>
        <RightPane>
          <EmptyMessage>시간표를 만들어주세요</EmptyMessage>
        </RightPane>
      </Wrapper>
    );
  }

  const onConfirm = () => {
    if (!selectedFullTimetable || !window.opener) return;
    timetablePickerService.sendTimetableToOpener({
      timetable: selectedFullTimetable,
      targetOrigin: targetOrigin!,
      opener: window.opener,
    });
    window.close();
  };

  return (
    <Wrapper>
      <LeftPane>
        <TimetablePickerGroupedList
          timetables={allTimetables}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedTimetableId}
          currentYearSemester={currentCourseBook}
        />
      </LeftPane>
      <RightPane>
        {selectedFullTimetable ? (
          <>
            <MainTimeTable
              timetable={selectedFullTimetable}
              hoveredLectureId={null}
              setHoveredLectureId={() => {}}
              onClickLecture={() => {}}
              openCreateLectureDialog={() => {}}
              readOnly
              style={{ opacity: isLoadingTimetable ? 0.6 : 1, transition: 'opacity 0.2s' }}
            />
            <ConfirmButton onClick={onConfirm} disabled={!hasOpener || isLoadingTimetable} data-testid="timetable-picker-confirm">
              확인
            </ConfirmButton>
          </>
        ) : (
          <LoadingContainer>
            <Loader />
          </LoadingContainer>
        )}
      </RightPane>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: rgb(247, 248, 249);
`;

const LeftPane = styled.div`
  width: 300px;
  border-right: 1px solid rgb(232, 235, 240);
  background-color: white;
  overflow-y: auto;
`;

const RightPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 16px;
  overflow-y: auto;
`;

const ConfirmButton = styled(Button)`
  align-self: flex-end;
  min-width: 100px;
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(0, 0, 0, 0.54);
  font-size: 14px;
  text-align: center;
  padding: 16px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
`;
