import { useState } from 'react';
import styled from 'styled-components';

import type { BaseLecture } from '@/entities/lecture';

import { MainLectureListItem } from '../../main-lecture-listitem';
import { MainCurrentLectureDeleteDialog } from './main-current-lecture-delete-dialog';

type Props = {
  timetableId?: string;
  lecture: BaseLecture;
  hoveredLectureId?: string | null;
  setHoveredLectureId?: (id: string | null) => void;
  onClickLecture?: (id: string) => void;
};

export const MainCurrentLectureListItem = ({
  lecture,
  timetableId,
  hoveredLectureId,
  setHoveredLectureId,
  onClickLecture,
}: Props) => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isHovered = hoveredLectureId === lecture._id;

  return (
    <LectureListItem
      data-testid="main-lecture-listitem"
      onMouseEnter={() => setHoveredLectureId?.(lecture._id)}
      onMouseLeave={() => setHoveredLectureId?.(null)}
      onClick={() => onClickLecture?.(lecture._id)}
      $hovered={isHovered}
      $clickable={!!onClickLecture}
    >
      <MainLectureListItem
        lecture={lecture}
        cta={
          <LectureButton
            $color="#ff0000"
            onClick={(e) => (e.stopPropagation(), setDeleteDialogOpen(true))}
            data-testid="main-lecture-listitem-delete"
          >
            삭제
          </LectureButton>
        }
      />
      <MainCurrentLectureDeleteDialog
        lecture={lecture}
        timetableId={timetableId}
        isOpen={isDeleteDialogOpen}
        close={() => setDeleteDialogOpen(false)}
      />
    </LectureListItem>
  );
};

const LectureListItem = styled.li<{ $hovered: boolean; $clickable: boolean }>`
  list-style-type: none;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background-color 0.1s;
  background-color: ${({ $hovered }) => ($hovered ? '#ddd' : '#fff')};
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
