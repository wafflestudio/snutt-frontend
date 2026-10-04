import { describe, expect, it } from 'vitest';
import { DEFAULT_MAIN_VIEW, type MainView, parseMainView, toSearchParams } from '@/features/main/main-view';

const parse = (query: string) => parseMainView(new URLSearchParams(query));

describe('parseMainView', () => {
  it('URL 이 비어 있으면 검색 탭 목록을 연다', () => {
    expect(parse('')).toEqual(DEFAULT_MAIN_VIEW);
  });

  it('panel=closed 면 패널을 접는다', () => {
    expect(parse('panel=closed').panel).toBeNull();
  });

  it('접은 상태에서는 남아 있는 탭 · 강의 상세를 무시한다', () => {
    expect(parse('panel=closed&tab=lectures&lecture=l1').panel).toBeNull();
  });

  it('panel=custom 이면 직접 추가', () => {
    expect(parse('panel=custom').panel).toEqual({ type: 'custom-form' });
  });

  it('탭과 강의 상세를 읽는다', () => {
    expect(parse('tab=bookmark&lecture=l1&view=review').panel).toEqual({
      type: 'list',
      tab: 'bookmark',
      detail: { lectureId: 'l1', view: 'review', editing: false },
    });
    expect(parse('lecture=l1&edit=1').panel).toMatchObject({ detail: { view: 'info', editing: true } });
  });

  it('잘못된 값은 기본값으로 읽는다', () => {
    expect(parse('panel=wrong&tab=wrong&view=wrong&edit=yes').panel).toEqual({
      type: 'list',
      tab: 'search',
      detail: null,
    });
  });

  it('compare 가 있으면 오른쪽 시간표를 연다', () => {
    expect(parse('compare=t2').compare).toEqual({ right: 't2' });
    expect(parse('compare=').compare).toBeNull();
  });
});

describe('toSearchParams', () => {
  it('기본값은 URL 에 쓰지 않는다', () => {
    expect(toSearchParams(DEFAULT_MAIN_VIEW).toString()).toBe('');
  });

  const views: [string, MainView][] = [
    ['접힘 + 비교', { panel: null, compare: { right: 't2' } }],
    ['직접 추가', { panel: { type: 'custom-form' }, compare: null }],
    [
      '관심강좌 + 강의평',
      {
        panel: { type: 'list', tab: 'bookmark', detail: { lectureId: 'l1', view: 'review', editing: false } },
        compare: null,
      },
    ],
    [
      '강의 상세 편집',
      {
        panel: { type: 'list', tab: 'lectures', detail: { lectureId: 'l1', view: 'info', editing: true } },
        compare: { right: 't3' },
      },
    ],
  ];

  it.each(views)('%s: URL 로 바꿨다가 다시 읽으면 같다', (_, view) => {
    expect(parseMainView(toSearchParams(view))).toEqual(view);
  });
});
