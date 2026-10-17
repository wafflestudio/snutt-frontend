// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MainScreen } from '@/features/main/components/MainScreen';
import { SAMPLE_COURSEBOOK, SAMPLE_PALETTE, SAMPLE_SEMESTERS, SAMPLE_TIMETABLES } from '@/features/main/sample-data';
import { fakeSnutt } from '../../msw/fake-snutt';
import { problem } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

// Next 라우터 대신 window.location 을 읽는다. pushState 로 URL 이 바뀌면 다시 그린다. (실제 Next 와 같은 동작)
vi.mock('next/navigation', async () => {
  const { useMemo, useSyncExternalStore } = await import('react');
  const subscribe = (onChange: () => void) => {
    window.addEventListener('test-navigate', onChange);
    return () => window.removeEventListener('test-navigate', onChange);
  };
  return {
    useSearchParams: () => {
      const search = useSyncExternalStore(subscribe, () => window.location.search);
      return useMemo(() => new URLSearchParams(search), [search]);
    },
  };
});

const originalPushState = window.history.pushState.bind(window.history);

beforeEach(() => {
  // 예시 시간표를 가진 가짜 서버. 처음 화면은 2026년 2학기의 기본 시간표(시간표 1)
  server.use(
    ...fakeSnutt({
      timetables: SAMPLE_TIMETABLES,
      semesters: SAMPLE_SEMESTERS,
      palette: SAMPLE_PALETTE,
      coursebook: SAMPLE_COURSEBOOK,
    }).handlers,
  );
  window.history.replaceState(null, '', '/');
  vi.spyOn(window.history, 'pushState').mockImplementation((...args) => {
    originalPushState(...args);
    window.dispatchEvent(new Event('test-navigate'));
  });
});

afterEach(() => vi.restoreAllMocks());

/** MainScreen 을 그리고, 학기 · 시간표를 다 받을 때까지 기다린다 */
const renderMain = async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MainScreen />
    </QueryClientProvider>,
  );
  await screen.findByRole('combobox', { name: '학기' });
};

const panel = (name: string) => screen.queryByRole('complementary', { name });
const tabList = (name: string) => within(screen.getByRole('tablist', { name }));
/** 시간표 탭 이름. 기본 시간표는 `시간표 1, 기본 시간표(15학점)` 처럼 읽힌다 */
const tabNames = (name: string) =>
  tabList(name)
    .queryAllByRole('tab')
    .map((tab) => tab.textContent);
const openTimetableMenu = async (item: string) => {
  await userEvent.click(screen.getByRole('button', { name: '시간표 메뉴' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: item }));
};

describe('MainScreen', () => {
  it('처음에는 검색 탭 목록과 시간표를 보여 준다', async () => {
    await renderMain();
    expect(panel('강의 목록')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '검색', selected: true })).toBeInTheDocument();
    expect(screen.getAllByText('월')).toHaveLength(1);
  });

  it('패널을 접으면 시간표만 남는다 (펼치기는 좌측 바의 검색)', async () => {
    await renderMain();
    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
    expect(window.location.search).toBe('?panel=closed');
    expect(panel('강의 목록')).not.toBeInTheDocument();
  });

  it('직접 추가는 목록 자리를 대신하고, 취소하면 목록으로 돌아온다', async () => {
    await renderMain();
    await userEvent.click(screen.getByRole('button', { name: '직접 추가' }));
    expect(panel('직접 추가')).toBeInTheDocument();
    expect(panel('강의 목록')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(panel('강의 목록')).toBeInTheDocument();
  });

  it('직접 추가한 강의는 고른 시간표에 들어가고, 패널은 목록으로 돌아온다', async () => {
    await renderMain();
    await userEvent.click(screen.getByRole('button', { name: '직접 추가' }));
    await userEvent.type(screen.getByLabelText('강의명'), '스터디');

    // 처음 시간(월 9:00 ~ 10:00)은 시간표 1 의 경영전략과 겹친다
    await userEvent.click(screen.getByRole('button', { name: '추가' }));
    expect(screen.getByRole('alert')).toHaveTextContent('‘경영전략’ 강의와 시간이 겹칩니다');

    await userEvent.click(screen.getByRole('combobox', { name: '요일' }));
    await userEvent.click(await screen.findByRole('option', { name: '토' }));
    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(await screen.findByText('스터디')).toBeInTheDocument();
    expect(panel('강의 목록')).toBeInTheDocument();
    expect(screen.getByText('토')).toBeInTheDocument(); // 토요일 강의가 생겨 그리드가 토요일까지 늘어난다
    expect(tabNames('시간표')[0]).toBe('시간표 1, 기본 시간표(15학점)'); // 학점이 없는 강의
  });

  it('시간표 비교를 열면 시간표가 두 개가 되고, 패널은 그대로다', async () => {
    await renderMain();
    await userEvent.click(screen.getByRole('button', { name: '시간표 비교' }));
    expect(screen.getAllByText('월')).toHaveLength(2);
    expect(panel('강의 목록')).toBeInTheDocument();
    // 비교 중 왼쪽 헤더에는 탭 · + · ··· 만 있다 (Figma `top` 의 `메인 시간표`)
    expect(screen.queryByRole('button', { name: '직접 추가' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '비교 종료' }));
    expect(screen.getAllByText('월')).toHaveLength(1);
    expect(screen.getByRole('button', { name: '직접 추가' })).toBeInTheDocument();
  });

  it('로그인하지 않았으면 시간표 대신 로그인이 필요하다고 알린다', async () => {
    server.use(
      http.get(api('/v2/timetables'), () =>
        HttpResponse.json(problem(401, 'missing-access-token', '로그인 실패', '다시 로그인해 주세요'), { status: 401 }),
      ),
    );
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MainScreen />
      </QueryClientProvider>,
    );
    expect(await screen.findByText('로그인이 필요합니다')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: '학기' })).not.toBeInTheDocument();
  });

  it('서버가 거절하면 서버 메시지를 알리고, 직접 추가 폼은 입력을 그대로 둔다', async () => {
    server.use(
      http.post(api('/v2/timetables/:timetableId/lectures/custom'), () =>
        HttpResponse.json(problem(400, 'invalid-lecture', '잘못된 강의', '강의 정보를 확인해 주세요'), { status: 400 }),
      ),
    );
    await renderMain();
    await userEvent.click(screen.getByRole('button', { name: '직접 추가' }));
    await userEvent.type(screen.getByLabelText('강의명'), '스터디');
    await userEvent.click(screen.getByRole('combobox', { name: '요일' }));
    await userEvent.click(await screen.findByRole('option', { name: '토' }));
    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    const notice = await screen.findByRole('alertdialog', { name: '강의 정보를 확인해 주세요' });
    await userEvent.click(within(notice).getByRole('button', { name: '확인' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(panel('직접 추가')).toBeInTheDocument();
    expect(screen.getByLabelText('강의명')).toHaveValue('스터디');
  });

  describe('검색', () => {
    const result = (title: string) => within(screen.getByRole('article', { name: title }));
    /** 시간표의 강의 블록 (요일마다 하나씩 있어서 첫 블록만 본다) */
    const block = (title: string) => screen.queryAllByRole('button', { name: new RegExp(`^${title},`) })[0] ?? null;
    const resultNames = () => screen.queryAllByRole('article').map((cell) => cell.getAttribute('aria-label'));

    it('검색어가 없으면 학기의 강의를 모두 보여 주고, 담긴 강의에는 빼기 버튼이 있다', async () => {
      await renderMain();
      expect(await screen.findAllByRole('article')).toHaveLength(3);
      expect(result('경영전략').getByRole('button', { name: '시간표에서 빼기' })).toBeInTheDocument();
      expect(result('운영관리').getByRole('button', { name: '시간표에 담기' })).toBeInTheDocument();
      // 한 줄의 정보 (Figma `cell`)
      expect(result('경영전략').getByText('김민준 / 3학점')).toBeInTheDocument();
      expect(result('경영전략').getByLabelText('평점 4.2, 강의평 12개')).toBeInTheDocument();
      expect(result('마케팅원론').getByText('월(10:00~11:15), 수(10:00~11:15)')).toBeInTheDocument();
      expect(result('마케팅원론').getByText('058-331, 058-120')).toBeInTheDocument();
      expect(result('운영관리').getByLabelText('강의평 없음')).toBeInTheDocument();
    });

    it('강의명 · 교수명으로 찾고, 없으면 없다고 알린다', async () => {
      await renderMain();
      await screen.findAllByRole('article');
      await userEvent.type(screen.getByRole('searchbox', { name: '강의 검색' }), '박지호');
      // 300ms 뒤에 검색하고, 그동안은 이전 결과를 그대로 보여 준다
      expect(resultNames()).toHaveLength(3);
      await waitFor(() => expect(resultNames()).toEqual(['마케팅원론']));

      await userEvent.clear(screen.getByRole('searchbox', { name: '강의 검색' }));
      await userEvent.type(screen.getByRole('searchbox', { name: '강의 검색' }), '없는 강의');
      expect(await screen.findByText('검색 결과가 없습니다')).toBeInTheDocument();
    });

    it('담으면 고른 시간표에 들어가고, 빼면 시간표에서 빠진다', async () => {
      await renderMain();
      await screen.findAllByRole('article');
      await userEvent.click(result('운영관리').getByRole('button', { name: '시간표에 담기' }));

      await waitFor(() => expect(block('운영관리')).toBeInTheDocument());
      expect(tabNames('시간표')[0]).toBe('시간표 1, 기본 시간표(18학점)');

      await userEvent.click(result('운영관리').getByRole('button', { name: '시간표에서 빼기' }));
      await waitFor(() => expect(block('운영관리')).not.toBeInTheDocument());
      expect(tabNames('시간표')[0]).toBe('시간표 1, 기본 시간표(15학점)');
    });

    it('시간이 겹치면 덮어쓸지 묻고, 확인하면 겹치는 강의를 빼고 넣는다', async () => {
      await renderMain();
      await screen.findAllByRole('article');
      await userEvent.click(result('마케팅원론').getByRole('button', { name: '시간표에 담기' }));

      const confirm = await screen.findByRole('alertdialog', {
        name: "'경영전략' 강의와 시간이 겹칩니다.\n강의를 덮어씌우겠습니까?",
      });
      await userEvent.click(within(confirm).getByRole('button', { name: '취소' }));
      expect(block('마케팅원론')).not.toBeInTheDocument();
      expect(block('경영전략')).toBeInTheDocument();

      await userEvent.click(result('마케팅원론').getByRole('button', { name: '시간표에 담기' }));
      await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: '확인' }));
      await waitFor(() => expect(block('마케팅원론')).toBeInTheDocument());
      expect(block('경영전략')).not.toBeInTheDocument();
    });

    it('결과에 커서를 올리면 시간표에 그 자리를 미리 보여 주고, 벗어나면 지운다', async () => {
      await renderMain();
      await screen.findAllByRole('article');
      const cell = screen.getByRole('article', { name: '마케팅원론' });
      expect(screen.getAllByText('마케팅원론')).toHaveLength(1); // 검색 결과의 강의명

      await userEvent.hover(cell);
      // 월 · 수 두 자리. 강의명과 장소를 쓴다
      expect(screen.getAllByText('마케팅원론')).toHaveLength(3);
      expect(screen.getByText('058-120', { selector: '[data-preview-block] *' })).toBeInTheDocument();

      await userEvent.unhover(cell);
      expect(screen.getAllByText('마케팅원론')).toHaveLength(1);

      // 키보드로 결과 안의 버튼에 가도 보여 준다
      act(() => result('마케팅원론').getByRole('button', { name: '관심강좌' }).focus());
      await waitFor(() => expect(screen.getAllByText('마케팅원론')).toHaveLength(3));
    });

    it('관심강좌를 켜고 끈다', async () => {
      await renderMain();
      await screen.findAllByRole('article');
      const bookmark = () => result('운영관리').getByRole('button', { name: '관심강좌' });
      expect(bookmark()).toHaveAttribute('aria-pressed', 'false');

      await userEvent.click(bookmark());
      await waitFor(() => expect(bookmark()).toHaveAttribute('aria-pressed', 'true'));
      await userEvent.click(bookmark());
      await waitFor(() => expect(bookmark()).toHaveAttribute('aria-pressed', 'false'));
    });

    it('목록 끝에 닿으면 다음 쪽을 받는다', async () => {
      // 한 쪽(30개)보다 많은 강의. 목록 끝이 보이는 것은 IntersectionObserver 를 흉내 내 바로 알린다
      const many = Array.from({ length: 35 }, (_, index) => ({
        ...SAMPLE_COURSEBOOK[2],
        id: String(2000 + index),
        title: `강의 ${index + 1}`,
      }));
      server.use(
        ...fakeSnutt({
          timetables: SAMPLE_TIMETABLES,
          semesters: SAMPLE_SEMESTERS,
          palette: SAMPLE_PALETTE,
          coursebook: many,
        }).handlers,
      );
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(private readonly onChange: IntersectionObserverCallback) {}
          observe() {
            this.onChange([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
          }
          disconnect() {}
        },
      );

      await renderMain();
      await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(35));
      vi.unstubAllGlobals();
    });
  });

  describe('강의 상세', () => {
    const block = (title: string) => screen.getByRole('button', { name: new RegExp(`^${title},`) });

    it('시간표의 강의를 누르면 목록 옆에 강의 상세를 열고, `<` 로 닫는다', async () => {
      await renderMain();
      await userEvent.click(block('경영전략'));
      expect(window.location.search).toBe('?lecture=1-1');
      expect(panel('강의 목록')).toBeInTheDocument();
      expect(within(panel('강의 상세')!).getByRole('heading', { name: '경영전략' })).toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: '강의평' }));
      expect(window.location.search).toBe('?lecture=1-1&view=review');

      await userEvent.click(screen.getByRole('button', { name: '목록으로' }));
      expect(panel('강의 상세')).not.toBeInTheDocument();
      expect(window.location.search).toBe('');
    });

    it('강의 상세가 열리면 헤더의 직접 추가 · 시간표 비교는 아이콘만 남는다', async () => {
      await renderMain();
      expect(screen.getByRole('button', { name: '직접 추가' })).toHaveTextContent('직접 추가');

      await userEvent.click(block('경영전략'));
      expect(screen.getByRole('button', { name: '직접 추가' })).toHaveTextContent('');
      expect(screen.getByRole('button', { name: '시간표 비교' })).toHaveTextContent('');
    });

    describe('검색 결과의 셀', () => {
      const result = (title: string) => within(screen.getByRole('article', { name: title }));
      const detail = () => within(panel('강의 상세')!);

      it('시간표에 없는 강의는 담기가 있는 상세를 열고, 담으면 시간표 강의의 상세로 바뀐다', async () => {
        await renderMain();
        await screen.findAllByRole('article');
        // 강의명이 아닌 곳을 눌러도 연다
        await userEvent.click(result('운영관리').getByLabelText('강의평 없음'));
        expect(window.location.search).toMatch(/^\?course=/);
        expect(detail().getByRole('heading', { name: '운영관리' })).toBeInTheDocument();
        expect(detail().queryByRole('combobox', { name: '색상' })).not.toBeInTheDocument();

        await userEvent.click(detail().getByRole('button', { name: '시간표에 담기' }));
        expect(await detail().findByRole('combobox', { name: '색상' })).toBeInTheDocument();
        expect(detail().getByRole('button', { name: '삭제' })).toBeInTheDocument();
      });

      it('담을 때 시간이 겹치면 덮어쓸지 묻는다', async () => {
        await renderMain();
        await screen.findAllByRole('article');
        await userEvent.click(result('마케팅원론').getByText('058-331, 058-120'));
        await userEvent.click(detail().getByRole('button', { name: '시간표에 담기' }));

        const confirm = await screen.findByRole('alertdialog', {
          name: "'경영전략' 강의와 시간이 겹칩니다.\n강의를 덮어씌우겠습니까?",
        });
        await userEvent.click(within(confirm).getByRole('button', { name: '확인' }));
        expect(await detail().findByRole('combobox', { name: '색상' })).toBeInTheDocument();
      });

      it('담긴 강의는 시간표 강의의 상세를 열고, 셀 안의 버튼을 누를 때는 열지 않는다', async () => {
        await renderMain();
        await screen.findAllByRole('article');
        await userEvent.click(result('운영관리').getByRole('button', { name: '관심강좌' }));
        expect(panel('강의 상세')).not.toBeInTheDocument();

        // 키보드로는 강의명 버튼으로 연다
        await userEvent.click(result('경영전략').getByRole('button', { name: '경영전략' }));
        expect(window.location.search).toBe('?lecture=1-1');
        expect(detail().getByRole('combobox', { name: '색상' })).toBeInTheDocument();
      });

      it('URL 의 수강편람 강의는 받아 둔 것이 없으면(새로 고침) 열지 않는다', async () => {
        window.history.replaceState(null, '', '/?course=none');
        await renderMain();
        expect(panel('강의 상세')).not.toBeInTheDocument();
      });
    });

    it('URL 의 강의가 고른 시간표에 없으면 상세를 열지 않는다', async () => {
      window.history.replaceState(null, '', '/?lecture=none');
      await renderMain();
      expect(panel('강의 목록')).toBeInTheDocument();
      expect(panel('강의 상세')).not.toBeInTheDocument();
    });

    it('색을 바꾸면 블록 색이 바뀌고, 삭제하면 블록과 학점이 빠지고 상세가 닫힌다', async () => {
      await renderMain();
      await userEvent.click(block('경영전략'));

      await userEvent.click(screen.getByRole('combobox', { name: '색상' }));
      await userEvent.click(await screen.findByRole('option', { name: '색상7' }));
      await waitFor(() => expect(block('경영전략')).toHaveStyle({ backgroundColor: SAMPLE_PALETTE[6].bg }));

      await userEvent.click(within(panel('강의 상세')!).getByRole('button', { name: '삭제' }));
      await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: '삭제' }));
      await waitFor(() => expect(screen.queryByRole('button', { name: /^경영전략,/ })).not.toBeInTheDocument());
      expect(tabNames('시간표')[0]).toBe('시간표 1, 기본 시간표(12학점)');
      expect(panel('강의 상세')).not.toBeInTheDocument();
    });

    it('강의편집에서 고쳐 저장하면 서버에 반영되어 블록이 바뀌고, 상세로 돌아온다', async () => {
      await renderMain();
      await userEvent.click(block('경영전략'));
      await userEvent.click(within(panel('강의 상세')!).getByRole('button', { name: '강의편집' }));
      expect(window.location.search).toBe('?lecture=1-1&edit=1');

      const title = screen.getByRole('textbox', { name: '강의명' });
      await userEvent.clear(title);
      await userEvent.type(title, '경영전략 세미나');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => expect(block('경영전략 세미나')).toBeInTheDocument());
      expect(window.location.search).toBe('?lecture=1-1');
      expect(within(panel('강의 상세')!).getByRole('button', { name: '강의편집' })).toBeInTheDocument();
    });

    it('편집한 시간이 다른 강의와 겹치면 덮어쓸지 묻고, 확인하면 겹치는 강의를 빼고 저장한다', async () => {
      await renderMain();
      await userEvent.click(block('경영전략'));
      await userEvent.click(within(panel('강의 상세')!).getByRole('button', { name: '강의편집' }));

      // 월 → 목 으로 옮기면 공공커뮤니케이션 미디어(목 9:00 ~ 11:45)와 겹친다
      await userEvent.click(screen.getByRole('combobox', { name: '요일' }));
      await userEvent.click(await screen.findByRole('option', { name: '목' }));
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      const dialog = await screen.findByRole('alertdialog');
      expect(dialog).toHaveTextContent("'공공커뮤니케이션 미디어' 강의와 시간이 겹칩니다.");
      await userEvent.click(within(dialog).getByRole('button', { name: '확인' }));

      await waitFor(() =>
        expect(screen.queryByRole('button', { name: /^공공커뮤니케이션 미디어,/ })).not.toBeInTheDocument(),
      );
      expect(window.location.search).toBe('?lecture=1-1');
    });

    it('비교하는 오른쪽 시간표의 강의는 누를 수 없다', async () => {
      await renderMain();
      await userEvent.click(screen.getByRole('button', { name: '시간표 비교' }));
      expect(await screen.findAllByText('자료구조')).toHaveLength(2);
      expect(screen.queryByRole('button', { name: /^자료구조,/ })).not.toBeInTheDocument();
    });
  });

  describe('시간표 탭', () => {
    it('학기의 기본 시간표를 먼저 보여 주고, 고른 탭에만 학점을 쓴다', async () => {
      await renderMain();
      expect(tabNames('시간표')).toEqual(['시간표 1, 기본 시간표(15학점)', '시간표 2', '시간표 3']);
      expect(screen.getByRole('button', { name: /^경영전략,/ })).toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: '시간표 2' }));
      expect(tabNames('시간표')).toEqual(['시간표 1, 기본 시간표', '시간표 2(9학점)', '시간표 3']);
      expect(await screen.findAllByText('자료구조')).toHaveLength(2); // 월 · 수 블록
      expect(screen.queryByRole('button', { name: /^경영전략,/ })).not.toBeInTheDocument();
    });

    it('+ 로 이름을 정해 새 시간표를 만들면 그 시간표를 고른다', async () => {
      await renderMain();
      await userEvent.click(screen.getByRole('button', { name: '새 시간표' }));
      expect(await screen.findByRole('textbox', { name: '새 시간표 이름' })).toHaveValue('시간표 4');

      await userEvent.click(screen.getByRole('button', { name: '만들기' }));
      expect(await screen.findByRole('tab', { name: '시간표 4(0학점)', selected: true })).toBeInTheDocument();
    });

    it('··· 메뉴로 이름을 바꾸고, 기본 시간표로 지정하고, 삭제한다', async () => {
      await renderMain();
      await userEvent.click(screen.getByRole('tab', { name: '시간표 2' }));

      await openTimetableMenu('이름 변경');
      await userEvent.clear(await screen.findByRole('textbox', { name: '시간표 이름 변경' }));
      await userEvent.keyboard('전공{Enter}');
      await waitFor(() => expect(tabNames('시간표')).toEqual(['시간표 1, 기본 시간표', '전공(9학점)', '시간표 3']));

      await openTimetableMenu('기본 시간표로 지정');
      await waitFor(() => expect(tabNames('시간표')).toEqual(['시간표 1', '전공, 기본 시간표(9학점)', '시간표 3']));

      await openTimetableMenu('삭제');
      expect(await screen.findByText('‘전공’ 시간표를 삭제하시겠습니까?')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: '삭제' }));
      // 기본 시간표가 없으면 첫 시간표를 고른다
      await waitFor(() => expect(tabNames('시간표')).toEqual(['시간표 1(15학점)', '시간표 3']));
    });

    it('기본 시간표를 해제할 수 있다', async () => {
      await renderMain();
      await openTimetableMenu('기본 시간표 해제');
      await waitFor(() => expect(tabNames('시간표')).toEqual(['시간표 1(15학점)', '시간표 2', '시간표 3']));
    });
  });

  describe('학기 선택', () => {
    it('학기를 바꾸면 그 학기의 시간표를 보여 준다', async () => {
      await renderMain();
      const semester = screen.getByRole('combobox', { name: '학기' });
      expect(semester).toHaveTextContent('2026년 2학기');

      await userEvent.click(semester);
      await userEvent.click(await screen.findByRole('option', { name: '2026년 1학기' }));
      expect(tabNames('시간표')).toEqual(['나의 시간표, 기본 시간표(5학점)']);
    });

    it('여름 · 겨울학기도 고를 수 있고, 시간표가 없는 학기에는 + 만 있다', async () => {
      await renderMain();
      await userEvent.click(screen.getByRole('combobox', { name: '학기' }));
      await userEvent.click(await screen.findByRole('option', { name: '2026년 여름학기' }));

      expect(screen.queryByRole('tablist', { name: '시간표' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '시간표 메뉴' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '새 시간표' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '시간표 비교' })).toBeDisabled();
    });
  });

  it('비교하는 쪽에는 왼쪽에서 고른 시간표가 없고, 왼쪽에서 그 시간표를 고르면 다른 시간표로 바뀐다', async () => {
    await renderMain();
    await userEvent.click(screen.getByRole('button', { name: '시간표 비교' }));
    expect(tabNames('비교할 시간표')).toEqual(['시간표 2(9학점)', '시간표 3']);
    // 시간표 2 는 10시부터지만 시간표 1 에 맞춰 두 그리드 모두 9시부터 그린다
    expect(screen.getAllByText('9')).toHaveLength(2);

    await userEvent.click(tabList('시간표').getByRole('tab', { name: '시간표 2' }));
    expect(tabNames('비교할 시간표')).toEqual(['시간표 1, 기본 시간표(15학점)', '시간표 3']);
  });
});
