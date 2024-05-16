import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import type { FullTimetable } from '@/entities/timetable';
import { useGuardContext } from '@/hooks/useGuardContext';

type Props = {
  isOpen: boolean;
  close: () => void;
  timetable?: FullTimetable;
};

export const MainRenameTimetableDialog = ({ isOpen, close, timetable }: Props) => {
  const [draft, setDraft] = useState<string>();

  const { mutate: rename } = useRenameTimetable(timetable?._id);

  const onClose = () => {
    setDraft(undefined);
    close();
  };

  return (
    <StyledDialog open={isOpen} onClose={onClose}>
      <Dialog.Title>시간표 이름을 변경합니다</Dialog.Title>

      <Dialog.Content>
        <Text>변경할 이름을 아래에 입력해 주세요.</Text>
        <Input
          data-testid="mt-tt-change-name-input"
          value={draft ?? timetable?.title ?? ''}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={timetable?.title}
        />
      </Dialog.Content>

      <Dialog.Actions>
        <Button size="small" color="gray" onClick={onClose}>
          취소
        </Button>
        <Button
          size="small"
          data-testid="mt-tt-change-name-submit"
          onClick={() => {
            if (draft === undefined) return;
            rename(draft, { onSuccess: onClose });
          }}
          disabled={draft === undefined || draft === timetable?.title}
        >
          확인
        </Button>
      </Dialog.Actions>
    </StyledDialog>
  );
};

const useRenameTimetable = (id?: string) => {
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(serviceContext);

  return useMutation({
    mutationFn: (title: string) => {
      if (!id) throw new Error('no tt');
      return timetableService.renameTimetable(id, title);
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const Input = styled.input`
  width: 100%;
  height: 40px;
  outline: none;
  padding-inline: 12px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
`;

const StyledDialog = styled(Dialog)`
  width: 300px;
`;

const Text = styled(Dialog.ContentText)`
  font-size: 12px;
`;
