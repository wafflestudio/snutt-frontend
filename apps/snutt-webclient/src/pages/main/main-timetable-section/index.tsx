import { useState } from 'react';
import styled from 'styled-components';

import { IcClose } from '@/components/icons/ic-close';
import { IcPlus } from '@/components/icons/ic-plus';
import { Tabs } from '@/components/tabs';
import type { BaseLecture } from '@/entities/lecture';
import type { FullTimetable, Timetable } from '@/entities/timetable';

import { MainCreateTimetableDialog } from './main-create-timetable-dialog';
import { MainDeleteTimetableDialog } from './main-delete-timetable-dialog';
import { MainNoTimetable } from './main-no-timetable';
import { MainRenameTimetableDialog } from './main-rename-timetable-dialog';
import { MainTimeTable } from './main-timetable';

type Props = {
  className?: string;
  currentYearSemesterTimetables: Timetable[] | undefined;
  currentFullTimetable: FullTimetable | undefined;
  currentTimetable: Timetable | undefined;
  changeCurrentTimetable: (id: string) => void;
  hoveredLectureId: string | null;
  setHoveredLectureId: (id: string | null) => void;
  onClickLecture: (id: string) => void;
  setCurrentTimetable: (id: string | null) => void;
  previewLecture?: BaseLecture;
  openCreateLectureDialog: () => void;
};

export const MainTimetableSection = ({
  className,
  currentTimetable,
  currentFullTimetable,
  currentYearSemesterTimetables,
  changeCurrentTimetable,
  hoveredLectureId,
  setHoveredLectureId,
  onClickLecture,
  previewLecture,
  setCurrentTimetable,
  openCreateLectureDialog,
}: Props) => {
  const [isCreateTimetableDialogOpen, setCreateTimetableDialogOpen] = useState(false);
  const [deleteTimetableDialogId, setDeleteTimetableDialogId] = useState<string | null>(null);
  const [renameTimetableDialogId, setRenameTimetableDialogId] = useState<string | null>(null);

  const onClickCreate = () => setCreateTimetableDialogOpen(true);

  return (
    <Wrapper className={className}>
      <TTTabs value={currentTimetable?._id}>
        {currentYearSemesterTimetables?.map(({ _id: id, title }) => {
          const isActive = id === currentTimetable?._id;
          return (
            <TTTab
              data-testid="mt-tab"
              data-id={id}
              value={id}
              aria-selected={isActive}
              key={id}
              onClick={() => changeCurrentTimetable(id)}
            >
              <span onClick={() => isActive && setRenameTimetableDialogId(id)}>{title}</span>
              <CloseIcon data-testid="mt-tab-delete" onClick={() => isActive && setDeleteTimetableDialogId(id)} />
            </TTTab>
          );
        })}
        <AddIcon data-testid="mt-create-timetable" onClick={onClickCreate} />
      </TTTabs>
      <Content>
        {currentYearSemesterTimetables &&
          (currentYearSemesterTimetables.length > 0 ? (
            currentFullTimetable && (
              <MainTimeTable
                timetable={currentFullTimetable}
                previewLecture={previewLecture}
                hoveredLectureId={hoveredLectureId}
                setHoveredLectureId={setHoveredLectureId}
                onClickLecture={onClickLecture}
                openCreateLectureDialog={openCreateLectureDialog}
              />
            )
          ) : (
            <NoTimetable onClickCreate={() => setCreateTimetableDialogOpen(true)} />
          ))}
      </Content>
      <MainCreateTimetableDialog
        isOpen={isCreateTimetableDialogOpen}
        close={() => setCreateTimetableDialogOpen(false)}
        setCurrentTimetable={setCurrentTimetable}
      />
      <MainDeleteTimetableDialog
        isOpen={deleteTimetableDialogId !== null}
        close={() => setDeleteTimetableDialogId(null)}
        timetable={currentFullTimetable}
        onDelete={() => setCurrentTimetable(null)}
      />
      <MainRenameTimetableDialog
        isOpen={renameTimetableDialogId !== null}
        close={() => setRenameTimetableDialogId(null)}
        timetable={currentFullTimetable}
      />
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 20px 15px 0;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  background-color: #ffffff;
  flex: 1;
`;

const CloseIcon = styled(IcClose)`
  margin-left: 4px;
  opacity: 0.6;
  transition: opacity 0.1s;

  &:hover {
    opacity: 1;
  }
`;

const AddIcon = styled(IcPlus)`
  margin: 0 10px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.1s;
  height: 32px;

  &:hover {
    opacity: 1;
  }
`;

const NoTimetable = styled(MainNoTimetable)`
  height: 100%;
`;

const TTTabs = styled(Tabs)`
  // 시간표가 많을 경우 다음 줄로 넘어가도록 해서 사용자 경험 개선
  flex-wrap: wrap;
`;

const TTTab = styled(Tabs.Tab)`
  // 시간표 이름이 영어 한 단어로 엄청 길 경우를 대응
  word-break: break-all;
`;
