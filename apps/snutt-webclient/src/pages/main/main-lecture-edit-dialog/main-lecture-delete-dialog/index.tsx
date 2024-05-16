import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import { useGuardContext } from '@/hooks/useGuardContext';

type Props = {
  open: boolean;
  onClose: () => void;
  timetableId?: string;
  lectureId?: string;
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

const useDeleteLecture = (id?: string, lecture_id?: string) => {
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(serviceContext);

  return useMutation({
    mutationFn: () => {
      if (!id) throw new Error('no tt id');
      if (!lecture_id) throw new Error('no lecture_id');

      return timetableService.deleteLecture({ id, lecture_id });
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
