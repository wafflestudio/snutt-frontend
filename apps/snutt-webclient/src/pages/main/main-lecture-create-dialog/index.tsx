import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { ErrorDialog } from '@/components/error-dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import type { Color } from '@/entities/color';
import { useErrorDialog } from '@/hooks/useErrorDialog';
import { useGuardContext } from '@/hooks/useGuardContext';

import { type LectureEditForm, MainLectureEditForm } from '../main-lecture-edit-form';

type Props = {
  open: boolean;
  onClose: () => void;
  timetableId: string | undefined;
};

export const MainLectureCreateDialog = ({ open, onClose, timetableId }: Props) => {
  const [draft, setDraft] = useState<Partial<LectureEditForm>>({});
  const { open: openErrorDialog, isOpen: isOpenErrorDialog, onClose: onCloseErrorDialog, message } = useErrorDialog();
  const { lectureService } = useGuardContext(serviceContext);

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
        class_time_json: draft.class_time_json?.map((t) => lectureService.removeInternalId(t)) ?? [],
        course_title: draft.course_title ?? '',
        credit: draft.credit ?? 0,
        instructor: draft.instructor ?? '',
        remark: draft.remark ?? '',
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

const useCreateLecture = (id?: string) => {
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(serviceContext);

  return useMutation({
    mutationFn: (body: Parameters<(typeof timetableService)['createLecture']>[1]) => {
      if (!id) throw new Error('no id');
      return timetableService.createLecture({ id }, body);
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
  justify-content: flex-end;
  gap: 4px;
`;
