import { create } from 'zustand';
import type { Lecture } from '@/domain/lecture';

type PreviewState = {
  /** 검색 결과에서 커서를 올린(또는 포커스가 간) 강의. 시간표에 그 자리를 미리 보여 준다 (5-2) */
  lecture: Lecture | null;
  show: (lecture: Lecture) => void;
  /** 그 강의를 보여 주는 중일 때만 지운다. 다른 강의로 옮겨 간 뒤 늦게 온 leave 가 새 미리보기를 지우지 않게 한다 */
  hide: (lecture: Lecture) => void;
  clear: () => void;
};

/**
 * 검색 패널과 시간표 그리드가 함께 보는 미리보기 상태. 커서가 움직일 때마다 바뀌므로
 * 메인 화면 전체가 아니라 이것을 읽는 미리보기 레이어만 다시 그린다. (CLAUDE.md "상태 관리")
 */
export const usePreviewStore = create<PreviewState>()((set) => ({
  lecture: null,
  show: (lecture) => set({ lecture }),
  hide: (lecture) => set((state) => (state.lecture?.id === lecture.id ? { lecture: null } : state)),
  clear: () => set({ lecture: null }),
}));
