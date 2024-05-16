import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { ErrorDialog } from '@/components/error-dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import type { Color } from '@/entities/color';
import type { Lecture } from '@/entities/lecture';
import { useErrorDialog } from '@/hooks/useErrorDialog';
import { useGuardContext } from '@/hooks/useGuardContext';

import { type LectureEditForm, MainLectureEditForm } from '../main-lecture-edit-form';
import { MainLectureDeleteDialog } from './main-lecture-delete-dialog';

type Props = {
  open: boolean;
  onClose: () => void;
  lecture?: Lecture;
  timetableId?: string;
};

export const MainLectureEditDialog = ({ open, onClose, timetableId, lecture }: Props) => {
  const [draft, setDraft] = useState<Partial<LectureEditForm>>({});
  const { open: openErrorDialog, isOpen: isOpenErrorDialog, onClose: onCloseErrorDialog, message } = useErrorDialog();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { lectureService } = useGuardContext(serviceContext);

  const { mutate } = useUpdateLecture(timetableId, lecture?._id);

  const submit = () => {
    if (!lecture) return;

    const color =
      draft.colorIndex === 0
        ? { colorIndex: 0 as const, color: draft.color as Color }
        : draft.colorIndex
          ? { colorIndex: draft.colorIndex }
          : {};

    mutate(
      {
        class_time_json: draft.class_time_json?.map((t) => ({
          day: t.day,
          start_time: t.start_time,
          end_time: t.end_time,
          place: t.place,
        })),
        course_title: draft.course_title,
        credit: draft.credit,
        instructor: draft.instructor,
        remark: draft.remark,
        ...color,
      },
      {
        onSuccess: close,
        onError: (err) => {
          const message =
            err && typeof err === 'object' && 'errcode' in err && err.errcode === 12300
              ? '강의 시간이 서로 겹칩니다.'
              : '오류가 발생했습니다.';
          openErrorDialog(message);
        },
      },
    );
  };

  const close = () => {
    setDraft({});
    onClose();
  };

  return (
    <EditDialog open={open} onClose={close}>
      <Dialog.Title>강의 편집</Dialog.Title>
      {lecture && (
        <EditDialogContent data-testid="main-lecture-edit-dialog-content">
          <MainLectureEditForm
            defaultState={{
              ...lecture,
              // TODO: find a better way
              // 받아올 때 lecture 를 받아놔야 하나..
              class_time_json: lecture.class_time_json.map((ctj) => lectureService.appendInternalId(ctj)),
            }}
            draft={draft}
            setDraft={setDraft}
          />
        </EditDialogContent>
      )}
      <Actions>
        <Button
          data-testid="main-lecture-edit-dialog-delete"
          color="red"
          size="small"
          onClick={() => setDeleteDialogOpen(true)}
        >
          삭제
        </Button>
        <ActionsRight>
          <Button color="gray" size="small" data-testid="main-lecture-edit-dialog-cancel" onClick={close}>
            취소
          </Button>
          <Button size="small" data-testid="main-lecture-edit-dialog-submit" onClick={submit}>
            저장하기
          </Button>
        </ActionsRight>
      </Actions>
      <ErrorDialog isOpen={isOpenErrorDialog} onClose={onCloseErrorDialog} message={message} />
      <MainLectureDeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        timetableId={timetableId}
        lectureId={lecture?._id}
        closeEditModal={close}
      />
    </EditDialog>
  );
};

const useUpdateLecture = (id?: string, lectureId?: string) => {
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(serviceContext);

  return useMutation({
    mutationFn: (body: Parameters<typeof timetableService.updateLecture>[1]) => {
      if (!id) throw new Error('no id');
      if (!lectureId) throw new Error('no lectureId');
      return timetableService.updateLecture({ id, lecture_id: lectureId }, body);
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const EditDialog = styled(Dialog)`
  width: 550px;
  min-height: 550px;
  padding: 21px 35px;
  display: flex;
  flex-direction: column;
`;

const EditDialogContent = styled(Dialog.Content)`
  border-top: 2px solid #d5dbe0;
  border-bottom: 2px solid #d5dbe0;
  flex: 1;
`;

const Actions = styled(Dialog.Actions)`
  justify-content: space-between;
`;

const ActionsRight = styled.div`
  display: flex;
  gap: 4px;
`;
