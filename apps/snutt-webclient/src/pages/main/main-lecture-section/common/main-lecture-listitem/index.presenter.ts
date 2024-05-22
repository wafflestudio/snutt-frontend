import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type MouseEvent, useState } from 'react';

import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenAuthContext } from '@/contexts/TokenAuthContext';
import { type BaseLecture } from '@/entities/lecture';
import { type Timetable } from '@/entities/timetable';
import { useErrorDialog } from '@/hooks/useErrorDialog';
import { useGuardContext } from '@/hooks/useGuardContext';
import { useYearSemester } from '@/hooks/useYearSemester';

type Props = {
  lecture: BaseLecture;
  openBookmarkTab: () => void;
  timetable:
    | {
        currentTimetableId: Timetable['_id'];
        isCurrentTimetableLecture: true;
        isHovered: boolean;
        setHovered: (isHovered: boolean) => void;
        openDetail: () => void;
      }
    | {
        currentTimetableId: Timetable['_id'];
        isCurrentTimetableLecture: false;
        isPreview: boolean;
        setPreview: (isPreview: boolean) => void;
      }
    | {
        currentTimetableId: null;
      };
};

type ViewModel = {
  wrapper: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
    isHoveredStyle: boolean;
    isClickableStyle: boolean;
  };
  header: {
    title: string;
    description: string;
    bookmark:
      | { isShow: false }
      | { isShow: true; icon: 'bookmark-fill' | 'bookmark-outline'; onClick: (e: MouseEvent) => void };
    button: { isShow: false } | { isShow: true; onClick: (e: MouseEvent) => void; text: string; color: 'blue' | 'red' };
  };
  content: {
    detail: { icon: 'label' | 'clock' | 'map'; text: string }[];
    link: { isShow: false } | { isShow: true; href: string; text: string };
  };
  remark: { isShow: false } | { isShow: true; text: string };
  deleteDialog: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onConfirm: () => void;
  };
  errorDialog: {
    isOpen: boolean;
    onClose: () => void;
    message: string | null;
  };
};

export const mainLectureListitemPresenter = {
  useViewModel: ({ lecture, timetable, openBookmarkTab }: Props): ViewModel => {
    const { lectureService } = useGuardContext(serviceContext);
    const { year, semester } = useYearSemester();

    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const addMutation = useAddLecture(timetable.currentTimetableId ?? undefined, lecture._id);
    const deleteMutation = useDeleteLecture(timetable.currentTimetableId ?? undefined, lecture._id);
    const addBookmarkMutation = useAddBookmark(lecture._id);
    const deleteBookmarkMutation = useDeleteBookmark(lecture._id);
    const { data: bookmarkLectures } = useBookmarkLectures();

    const { open, isOpen, onClose, message } = useErrorDialog();

    const department = [lecture.department, lecture.academic_year];
    const times = lectureService.getLectureTimeTexts(lecture);
    const places = lecture.class_time_json.map((t) => t.place);
    const detailUrl =
      lecture.course_number && year && semester
        ? lectureService.getLectureDetailUrl(lecture, { year, semester })
        : null;

    const isBookmarked = bookmarkLectures?.some((l) => l._id === lecture._id);

    return {
      wrapper: {
        onMouseEnter:
          timetable.currentTimetableId === null
            ? undefined
            : () => (timetable.isCurrentTimetableLecture ? timetable.setHovered : timetable.setPreview)(true),
        onMouseLeave:
          timetable.currentTimetableId === null
            ? undefined
            : () => (timetable.isCurrentTimetableLecture ? timetable.setHovered : timetable.setPreview)(false),
        onClick:
          timetable.currentTimetableId === null || !timetable.isCurrentTimetableLecture
            ? undefined
            : () => timetable.openDetail(),
        get isClickableStyle() {
          return !!this.onClick;
        },
        isHoveredStyle: !!timetable.currentTimetableId && !!timetable.isCurrentTimetableLecture && timetable.isHovered,
      },
      header: {
        title: lecture.course_title,
        description: `${lecture.instructor} / ${lecture.credit}학점`,
        bookmark:
          timetable.currentTimetableId === null || timetable.isCurrentTimetableLecture
            ? { isShow: false }
            : {
                isShow: true,
                icon: isBookmarked ? 'bookmark-fill' : 'bookmark-outline',
                onClick: (e) => {
                  e.stopPropagation();
                  if (isBookmarked) deleteBookmarkMutation.mutate();
                  else
                    addBookmarkMutation.mutate(undefined, {
                      onSuccess: (data) => data.type === 'success' && openBookmarkTab(),
                    });
                },
              },
        button: timetable.currentTimetableId
          ? timetable.isCurrentTimetableLecture
            ? {
                isShow: true,
                onClick: (e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                },
                text: '삭제',
                color: 'red',
              }
            : {
                isShow: true,
                onClick: (e) => {
                  e.stopPropagation();
                  addMutation.mutate(undefined, {
                    onSuccess: (data) => data.type === 'error' && open(data.message),
                  });
                },
                text: '추가',
                color: 'blue',
              }
          : { isShow: false },
      },
      content: {
        detail: [
          { icon: 'label', text: department.some(Boolean) ? department.join(', ') : emptyText },
          { icon: 'clock', text: times.some(Boolean) ? times.join(', ') : emptyText },
          { icon: 'map', text: places.some(Boolean) ? places.map((v) => v || '-').join(', ') : emptyText },
        ],
        link: detailUrl ? { isShow: true, href: detailUrl, text: '강의계획서' } : { isShow: false },
      },
      remark: lecture.remark ? { isShow: true, text: lecture.remark } : { isShow: false },
      deleteDialog: {
        title: `${lecture.course_title} 강의를 삭제하시겠습니까?`,
        onClose: () => setDeleteDialogOpen(false),
        isOpen: isDeleteDialogOpen,
        onConfirm: () =>
          deleteMutation.mutate(undefined, {
            onSuccess: (data) => data.type === 'success' && setDeleteDialogOpen(false),
          }),
      },
      errorDialog: {
        isOpen,
        onClose,
        message,
      },
    };
  },
};

const emptyText = '-';

const useDeleteLecture = (id?: string, lecture_id?: string) => {
  const queryClient = useQueryClient();
  const { timetableService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();

  return useMutation({
    mutationFn: () => {
      if (!id) throw new Error('no tt id');
      if (!lecture_id) throw new Error('no lecture_id');

      return timetableService.deleteLecture({ id, lecture_id, token });
    },
    onSuccess: (data) => data.type === 'success' && queryClient.invalidateQueries(),
  });
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
    onSuccess: (data) => data.type === 'success' && queryClient.invalidateQueries(),
  });
};

const useAddBookmark = (lectureId: string) => {
  const queryClient = useQueryClient();
  const { bookmarkService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();
  return useMutation({
    mutationFn: () => bookmarkService.addBookmark({ lectureId, token }),
    onSuccess: (data) => data.type === 'success' && queryClient.invalidateQueries(),
  });
};

const useDeleteBookmark = (lectureId: string) => {
  const queryClient = useQueryClient();
  const { bookmarkService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();
  return useMutation({
    mutationFn: () => bookmarkService.removeBookmark({ lectureId, token }),
    onSuccess: (data) => data.type === 'success' && queryClient.invalidateQueries(),
  });
};

const useBookmarkLectures = () => {
  const { bookmarkService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();
  const ys = useYearSemester();

  return useQuery({
    queryKey: ['BookmarkService', 'getBookmarkLectures', { token, ...ys }] as const,
    queryFn: ({ queryKey: [, , { year, semester, token }] }) => {
      if (!year || !semester) throw new Error('no year or semester');
      return bookmarkService.getBookmarkLectures({ year, semester, token });
    },
    enabled: !!ys.year && !!ys.semester,
    select: (data) => (data?.type === 'success' ? data.data : undefined),
  });
};