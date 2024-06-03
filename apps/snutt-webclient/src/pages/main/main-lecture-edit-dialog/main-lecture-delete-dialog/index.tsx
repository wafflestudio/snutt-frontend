import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { type Lecture } from '@/entities/lecture';
import { type Timetable } from '@/entities/timetable';
import { useGuardContext } from '@/hooks/useGuardContext';

type Props = {
  open: boolean;
  onClose: () => void;
  timetableId: string;
  lectureId: string;
  closeEditModal: () => void;
};

export const MainLectureDeleteDialog = ({ open, onClose, timetableId, lectureId, closeEditModal }: Props) => {
  const { mutate } = useDeleteLecture(timetableId, lectureId);

  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Title>강의를 삭제하시겠습니까?</Dialog.Title>
      <Dialog.Actions>
        <Button data-testid="ml-edit-delete-cancel" size="small" color="gray" onClick={onClose}>
          취소
        </Button>
        <Button
          data-testid="ml-edit-delete-confirm"
          size="small"
          color="red"
          onClick={() =>
            mutate(undefined, {
              onSuccess: () => {
                onClose();
                closeEditModal();
              },
            })
          }
        >
          삭제
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const useDeleteLecture = (id: Timetable['_id'], lecture_id: Lecture['_id']) => {
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useMutation({
    mutationFn: () => timetableService.deleteLecture({ id, lecture_id, token }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
