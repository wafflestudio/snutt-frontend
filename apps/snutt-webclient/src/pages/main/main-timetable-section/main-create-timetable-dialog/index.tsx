import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenAuthContext } from '@/contexts/TokenAuthContext';
import { YearSemesterContext } from '@/contexts/YearSemesterContext';
import { useGuardContext } from '@/hooks/useGuardContext';

type Props = {
  isOpen: boolean;
  close: () => void;
  setCurrentTimetable: (id: string) => void;
};

export const MainCreateTimetableDialog = ({ isOpen, close, setCurrentTimetable }: Props) => {
  const [title, setTitle] = useState('');

  const {
    mutate: create,
    data,
    reset,
  } = useCreateTimetable((createdId) => {
    setCurrentTimetable(createdId);
    onClose();
  });

  const errorMessage = data?.type === 'error' ? data.message : null;

  const onClose = () => {
    setTitle('');
    close();
    reset();
  };

  return (
    <StyledDialog open={isOpen} onClose={onClose}>
      <Dialog.Title>시간표 제목을 입력하세요</Dialog.Title>
      <Dialog.Content>
        <Input data-testid="mt-create-timetable-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <ErrorMessage data-testid="mt-create-timetable-error">{errorMessage}</ErrorMessage>
      </Dialog.Content>
      <Dialog.Actions>
        <Button color="gray" size="small" data-testid="mt-create-timetable-cancel" onClick={onClose}>
          취소
        </Button>
        <Button size="small" data-testid="mt-create-timetable-confirm" disabled={!title} onClick={() => create(title)}>
          확인
        </Button>
      </Dialog.Actions>
    </StyledDialog>
  );
};

const useCreateTimetable = (onSuccess: (createdId: string) => void) => {
  const { year, semester } = useGuardContext(YearSemesterContext);
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();

  return useMutation({
    mutationFn: (title: string) => timetableService.createTimetable({ year, semester, title, token }),
    onSuccess: (data, title) => {
      if (data.type === 'error') return;
      const createdTimetableId = data.data.find(
        (item) => item.title === title && item.year === year && item.semester === semester,
      )?._id;
      if (createdTimetableId) onSuccess(createdTimetableId);
      queryClient.invalidateQueries();
    },
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

const ErrorMessage = styled.p`
  height: 20px;
  color: #ff0000;
  opacity: 0.8;
  margin: 4px 0;
  font-size: 14px;
`;

const StyledDialog = styled(Dialog)`
  width: 300px;
`;
