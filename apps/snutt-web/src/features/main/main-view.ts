import type { TimetableId } from '@/domain/timetable';

/**
 * 메인 화면의 레이아웃 상태. URL search params 와 동기화한다. (docs/snutt-web-dev-plan.md 설계 포인트 2)
 * 패널과 비교는 동시에 열리므로 서로 독립된 두 필드로 둔다.
 */
export type MainView = {
  /** null 이면 패널을 접은 상태 */
  panel: PanelView | null;
  /** 비교 중이면 오른쪽 시간표 */
  compare: { right: TimetableId } | null;
};

export type PanelTab = 'search' | 'lectures' | 'bookmark';

export type LectureDetail = { lectureId: string; view: 'info' | 'review'; editing: boolean };

export type PanelView =
  /** 검색 · 강의 목록 · 관심강좌 탭. detail 이 있으면 목록 옆에 강의 상세를 연다 */
  | { type: 'list'; tab: PanelTab; detail: LectureDetail | null }
  /** 직접 추가 폼. 목록 자리를 대신한다 */
  | { type: 'custom-form' };

export const DEFAULT_PANEL: PanelView = { type: 'list', tab: 'search', detail: null };
export const DEFAULT_MAIN_VIEW: MainView = { panel: DEFAULT_PANEL, compare: null };

/*
 * URL 형식. 기본값은 쓰지 않아서 처음 화면의 URL 은 `/` 이다.
 *   panel=closed | custom   (없으면 목록)
 *   tab=lectures | bookmark (없으면 검색)
 *   lecture=<id> &view=review &edit=1   (강의 상세)
 *   compare=<timetableId>
 */
const PANEL_TABS: readonly PanelTab[] = ['search', 'lectures', 'bookmark'];

const isPanelTab = (value: string | null): value is PanelTab => PANEL_TABS.includes(value as PanelTab);

/** 잘못된 값은 기본값으로 읽는다. 사용자가 URL 을 고쳐도 화면이 깨지지 않게 한다. */
export const parseMainView = (params: Pick<URLSearchParams, 'get'>): MainView => {
  const compareId = params.get('compare');
  return { panel: parsePanel(params), compare: compareId ? { right: compareId } : null };
};

const parsePanel = (params: Pick<URLSearchParams, 'get'>): PanelView | null => {
  const panel = params.get('panel');
  if (panel === 'closed') return null;
  if (panel === 'custom') return { type: 'custom-form' };

  const tab = params.get('tab');
  const lectureId = params.get('lecture');
  return {
    type: 'list',
    tab: isPanelTab(tab) ? tab : 'search',
    detail: lectureId
      ? { lectureId, view: params.get('view') === 'review' ? 'review' : 'info', editing: params.get('edit') === '1' }
      : null,
  };
};

export const toSearchParams = ({ panel, compare }: MainView): URLSearchParams => {
  const params = new URLSearchParams();

  if (panel === null) params.set('panel', 'closed');
  else if (panel.type === 'custom-form') params.set('panel', 'custom');
  else {
    if (panel.tab !== 'search') params.set('tab', panel.tab);
    if (panel.detail) {
      params.set('lecture', panel.detail.lectureId);
      if (panel.detail.view === 'review') params.set('view', 'review');
      if (panel.detail.editing) params.set('edit', '1');
    }
  }

  if (compare) params.set('compare', compare.right);
  return params;
};
