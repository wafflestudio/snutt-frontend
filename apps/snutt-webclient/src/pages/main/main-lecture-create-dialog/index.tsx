import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { ErrorDialog } from '@/components/error-dialog';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import type { Color } from '@/entities/color';
import { type FullTimetable } from '@/entities/timetable';
import { useErrorDialog } from '@/hooks/useErrorDialog';
import { useGuardContext } from '@/hooks/useGuardContext';

import { type LectureEditForm, MainLectureEditForm } from '../main-lecture-edit-form';

type Props = { open: boolean; onClose: () => void; timetableId: FullTimetable['_id'] };

export const MainLectureCreateDialog = ({ open, onClose, timetableId }: Props) => {
  const [draft, setDraft] = useState<Partial<LectureEditForm>>({});
  const { open: openErrorDialog, isOpen: isOpenErrorDialog, onClose: onCloseErrorDialog, message } = useErrorDialog();
  const { lectureService } = useGuardContext(ServiceContext);

  const { mutate } = useCreateLecture(timetableId);

  const submit = () => {
    if (!draft.course_title) return openErrorDialog('강의명을 입력해 주세요');
    if (draft.color === undefined || draft.colorIndex === undefined) return openErrorDialog('강의 색을 지정해 주세요');

    const color =
      draft.colorIndex === 0
        ? { colorIndex: 0 as const, color: draft.color as Color }
        : { colorIndex: draft.colorIndex };

    mutate(
      {
        data: {
          class_time_json: draft.class_time_json?.map((t) => lectureService.removeInternalId(t)) ?? [],
          course_title: draft.course_title ?? '',
          credit: draft.credit ?? 0,
          instructor: draft.instructor ?? '',
          remark: draft.remark ?? '',
          ...color,
        },
      },
      { onSuccess: (data) => (data.type === 'error' ? openErrorDialog(data.message) : close()) },
    );
  };

  const close = () => {
    setDraft({});
    onClose();
  };

  return (
    <EditDialog open={open} onClose={close}>
      <Dialog.Title>강의 생성</Dialog.Title>

      <EditDialogContent data-testid="main-lecture-create-dialog-content">
        <MainLectureEditForm draft={draft} setDraft={setDraft} />
      </EditDialogContent>

      <Actions>
        <Button color="gray" size="small" data-testid="main-lecture-create-dialog-cancel" onClick={close}>
          취소
        </Button>
        <Button size="small" data-testid="main-lecture-create-dialog-submit" onClick={submit}>
          저장하기
        </Button>
      </Actions>
      <ErrorDialog isOpen={isOpenErrorDialog} onClose={onCloseErrorDialog} message={message} />
    </EditDialog>
  );
};

const useCreateLecture = (timetableId: FullTimetable['_id']) => {
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useMutation({
    mutationFn: (body: Omit<Parameters<(typeof timetableService)['createLecture']>[0], 'token' | 'id'>) =>
      timetableService.createLecture({ ...body, token, id: timetableId }),
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
  justify-content: flex-end;
  gap: 4px;
`;
