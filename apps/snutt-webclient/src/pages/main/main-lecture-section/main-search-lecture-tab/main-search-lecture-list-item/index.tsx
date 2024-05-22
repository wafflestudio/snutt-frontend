import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';

import { ErrorDialog } from '@/components/error-dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenAuthContext } from '@/contexts/TokenAuthContext';
import type { BaseLecture } from '@/entities/lecture';
import { useErrorDialog } from '@/hooks/useErrorDialog';
import { useGuardContext } from '@/hooks/useGuardContext';

import { MainLectureListItem } from '../../main-lecture-listitem';

type Props = {
  timetableId?: string;
  lecture: BaseLecture;
  setPreviewLectureId: (id: string | null) => void;
  previewLectureId: string | null;
};

export const MainSearchLectureListItem = ({ lecture, timetableId, setPreviewLectureId, previewLectureId }: Props) => {
  const { mutate } = useAddLecture(timetableId, lecture._id);

  const { open, isOpen, onClose, message } = useErrorDialog();

  return (
    <LectureListItem
      data-testid="main-lecture-listitem"
      onMouseEnter={() => setPreviewLectureId(lecture._id)}
      onMouseLeave={() => setPreviewLectureId(null)}
      $isPreview={previewLectureId === lecture._id}
    >
      <MainLectureListItem
        lecture={lecture}
        cta={
          <LectureButton
            disabled={!timetableId}
            $color="#0000ff"
            onClick={() => mutate(undefined, { onSuccess: (data) => data.type === 'error' && open(data.message) })}
          >
            추가
          </LectureButton>
        }
      />
      <ErrorDialog isOpen={isOpen} onClose={onClose} message={message} />
    </LectureListItem>
  );
};

const useAddLecture = (id?: string, lectureId?: string) => {
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();
  return useMutation({
    mutationFn: () => {
      if (!id) throw new Error('no id');
      if (!lectureId) throw new Error('no lectureId');

      return timetableService.addLecture({ id, lecture_id: lectureId, token });
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const LectureListItem = styled.li<{ $isPreview: boolean }>`
  list-style-type: none;
  transition: background-color 0.1s;
  background-color: ${({ $isPreview }) => ($isPreview ? '#ddd' : '#fff')};
`;

const LectureButton = styled.button<{ $color?: `#${string}` }>`
  border: none;
  background-color: transparent;
  color: ${({ $color = '#000000' }) => $color};
  opacity: 0.8;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 2px;
  text-decoration: none;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    color: #888;
    cursor: not-allowed;
  }
`;
