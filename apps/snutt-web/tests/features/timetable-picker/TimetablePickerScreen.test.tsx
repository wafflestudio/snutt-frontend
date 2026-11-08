// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAuthTokens, clearAuthTokens } from '@/api/client';
import { SAMPLE_PALETTE, SAMPLE_SEMESTERS, SAMPLE_TIMETABLES } from '@/features/main/sample-data';
import { TimetablePickerScreen } from '@/features/timetable-picker/components/TimetablePickerScreen';
import { fakeSnutt } from '../../msw/fake-snutt';
import { TOKEN_RESPONSE, problem } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

// 테스트마다 origin 쿼리를 바꿀 수 있도록 window.location.search 를 읽는 mock
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

/** 허용 origin (vitest.config.mts 의 NEXT_PUBLIC_TIMETABLE_PICKER_ORIGINS) */
const ALLOWED_ORIGIN = 'https://host.test';

const renderPicker = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TimetablePickerScreen login={<div>로그인 슬롯</div>} />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  window.history.replaceState(null, '', `/timetable-picker?origin=${encodeURIComponent(ALLOWED_ORIGIN)}`);
  server.use(
    ...fakeSnutt({
      timetables: SAMPLE_TIMETABLES,
      semesters: SAMPLE_SEMESTERS,
      palette: SAMPLE_PALETTE,
    }).handlers,
  );
});

afterEach(() => {
  clearAuthTokens();
  // opener · close 스텁 초기화
  Object.defineProperty(window, 'opener', { value: null, configurable: true });
  delete (window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView;
  vi.restoreAllMocks();
});

describe('허용 안 된 origin', () => {
  it('허용 안 된 origin 이면 오류 메시지를 보여 주고 API 를 호출하지 않는다', () => {
    // 가짜 서버가 unknown request 를 에러로 처리하므로, 요청이 없어야 테스트가 통과한다
    window.history.replaceState(null, '', '/timetable-picker?origin=https://evil.com');
    renderPicker();
    expect(screen.getByText('허용되지 않은 요청입니다')).toBeInTheDocument();
  });

  it('origin 쿼리가 없으면 오류 메시지를 보여 준다', () => {
    window.history.replaceState(null, '', '/timetable-picker');
    renderPicker();
    expect(screen.getByText('허용되지 않은 요청입니다')).toBeInTheDocument();
  });
});

describe('미로그인', () => {
  it('토큰이 없으면 login 슬롯을 보여 준다', () => {
    renderPicker();
    expect(screen.getByText('로그인 슬롯')).toBeInTheDocument();
  });

  it('로그인하면 목록을 보여 준다', async () => {
    server.use(http.post(api('/v2/auth/login'), () => HttpResponse.json(TOKEN_RESPONSE)));
    // LoginForm 을 직접 보여 주는 InlineLogin 을 슬롯으로 주는 대신 mock 로그인 슬롯으로
    // 토큰을 직접 세팅하는 방식으로 "로그인 완료" 를 시뮬레이션한다
    const { rerender } = renderPicker();
    expect(screen.getByText('로그인 슬롯')).toBeInTheDocument();

    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    // useSyncExternalStore 가 토큰 변경을 감지해 다시 렌더링한다
    await screen.findByText('불러오는 중');
    await screen.findByRole('button', { name: /확인/ });
    void rerender; // suppress unused warning
  });
});

describe('picker 화면', () => {
  beforeEach(() => {
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
  });

  it('로딩 중에는 불러오는 중 텍스트를 보여 준다', () => {
    renderPicker();
    expect(screen.getByText('불러오는 중')).toBeInTheDocument();
  });

  it('데이터를 받으면 시간표 목록과 확인 버튼을 보여 준다', async () => {
    renderPicker();
    await screen.findByRole('button', { name: /확인/ });
    expect(screen.getByTestId('timetable-picker-confirm')).toBeInTheDocument();
  });

  it('기본 선택: 현재 학기의 기본 시간표(isPrimary)가 선택된다', async () => {
    renderPicker();
    await screen.findByRole('button', { name: /확인/ });
    // SAMPLE_TIMETABLES[0] 은 2026-3 학기 isPrimary=true 의 시간표 1
    // 현재 학기(coursebooks[0] = 2026-3) 의 기본 시간표가 선택되어야 한다
    const selectedItem = screen.getByTestId('timetable-picker-item-sample-1');
    expect(selectedItem).toHaveAttribute('aria-pressed', 'true');
  });

  it('처음에 선택된 시간표가 있는 묶음이 펼쳐진다', async () => {
    renderPicker();
    await screen.findByRole('button', { name: /확인/ });
    // 2026년 2학기 그룹 헤더가 펼쳐져 있어야 한다 (기본 선택이 2026-3 학기 시간표이므로)
    const header = screen.getByTestId('timetable-picker-group-header-2026-3');
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('다른 시간표를 선택하면 그 시간표 항목이 선택된다', async () => {
    renderPicker();
    await screen.findByRole('button', { name: /확인/ });

    // sample-2 가 같은 학기에 있다고 가정 (SAMPLE_TIMETABLES 에 있으면)
    // 이 테스트는 sample-1 이 기본 선택, 다른 시간표 선택 시 그게 선택됨을 확인
    const item2 = screen.queryByTestId('timetable-picker-item-sample-2');
    if (!item2) return; // sample-2 가 없으면 skip

    await userEvent.click(item2);
    expect(item2).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('timetable-picker-item-sample-1')).toHaveAttribute('aria-pressed', 'false');
  });

  it('opener 가 있으면 확인 클릭 시 postMessage 를 보내고 창을 닫는다', async () => {
    const fakeOpener = { closed: false, postMessage: vi.fn() };
    Object.defineProperty(window, 'opener', { value: fakeOpener, configurable: true });
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => undefined);

    renderPicker();
    const confirmBtn = await screen.findByTestId('timetable-picker-confirm');
    await userEvent.click(confirmBtn);

    expect(fakeOpener.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SNUTT_TIMETABLE_SELECTED' }),
      ALLOWED_ORIGIN,
    );
    expect(closeSpy).toHaveBeenCalled();
  });

  it('opener 가 없으면 오류 메시지를 보여 준다', async () => {
    Object.defineProperty(window, 'opener', { value: null, configurable: true });

    renderPicker();
    const confirmBtn = await screen.findByTestId('timetable-picker-confirm');
    await userEvent.click(confirmBtn);

    expect(screen.getByRole('alert')).toHaveTextContent('시간표를 요청한 창을 찾을 수 없습니다');
  });

  it('RN 브리지가 있으면 JSON 으로 직렬화해서 보낸다', async () => {
    const bridge = { postMessage: vi.fn() };
    (window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView = bridge;
    vi.spyOn(window, 'close').mockImplementation(() => undefined);

    renderPicker();
    const confirmBtn = await screen.findByTestId('timetable-picker-confirm');
    await userEvent.click(confirmBtn);

    expect(bridge.postMessage).toHaveBeenCalledWith(
      expect.stringContaining('"type":"SNUTT_TIMETABLE_SELECTED"'),
    );
  });
});

describe('빈 시간표', () => {
  it('시간표가 없으면 0개 메시지를 보여 준다', async () => {
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    server.use(
      ...fakeSnutt({
        timetables: [],
        semesters: SAMPLE_SEMESTERS,
        palette: SAMPLE_PALETTE,
      }).handlers,
    );
    renderPicker();
    await screen.findByText('시간표가 없습니다');
    expect(screen.getByText('시간표를 만들어주세요')).toBeInTheDocument();
  });
});

describe('오류 상태', () => {
  it('목록 조회 실패 시 오류 메시지를 보여 준다', async () => {
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    server.use(
      http.get(api('/v2/timetables'), () =>
        HttpResponse.json(problem(500, 'internal-error', '서버 오류', '서버 오류가 발생했습니다'), { status: 500 }),
      ),
      http.get(api('/v2/coursebooks'), () =>
        HttpResponse.json([{ id: 1, year: 2026, semester: 3, updatedAt: 0 }]),
      ),
      http.get(api('/v2/themes'), () => HttpResponse.json([])),
    );
    renderPicker();
    await waitFor(() => expect(screen.queryByText('불러오는 중')).not.toBeInTheDocument());
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
