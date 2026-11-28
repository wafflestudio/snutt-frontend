// @vitest-environment jsdom
import type { SnuttV2 } from '@sf/snutt-api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthTokens, setAuthTokens } from '@/api/client';
import { MorePanel } from '@/features/more/components/MorePanel';
import type { MorePage } from '@/shared/lib/more-page';
import { timetableSettings } from '@/shared/lib/timetable-settings';
import { problem } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

// SDK 팝업 · 카카오로의 이동은 브라우저 밖이라 가짜로 바꾼다
const { getPopupAccessToken, startKakaoAuth } = vi.hoisted(() => ({
  getPopupAccessToken: vi.fn(),
  startKakaoAuth: vi.fn(),
}));
vi.mock('@/shared/lib/social-auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/social-auth')>()),
  getPopupAccessToken,
  startKakaoAuth,
}));

const ME: SnuttV2.UserResponse = {
  id: 1,
  nickname: '고독한 초코와플',
  nicknameTag: '1234',
  email: 'waffle@snu.ac.kr',
  isEmailVerified: true,
  authProviders: ['LOCAL', 'KAKAO'],
  isAdmin: false,
};

const renderPanel = (page: MorePage) => {
  const onNavigate = vi.fn();
  const onCollapse = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MorePanel page={page} onNavigate={onNavigate} onCollapse={onCollapse} />
    </QueryClientProvider>,
  );
  return { onNavigate, onCollapse };
};

beforeEach(() => {
  localStorage.clear();
  timetableSettings.reset();
  document.documentElement.dataset.theme = 'light';
  setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
  server.use(http.get(api('/v2/users/me'), () => HttpResponse.json(ME)));
});

describe('더보기 목록', () => {
  it('내 닉네임을 보여 주고, 줄을 누르면 그 화면으로 간다', async () => {
    const { onNavigate, onCollapse } = renderPanel('menu');
    await userEvent.click(await screen.findByRole('button', { name: '고독한 초코와플#1234' }));
    expect(onNavigate).toHaveBeenLastCalledWith('account');
    await userEvent.click(screen.getByRole('button', { name: '알림' }));
    expect(onNavigate).toHaveBeenLastCalledWith('notifications');
    await userEvent.click(screen.getByRole('button', { name: '시간표 설정' }));
    expect(onNavigate).toHaveBeenLastCalledWith('timetable-settings');
    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
    expect(onCollapse).toHaveBeenCalled();
  });

  it('서비스 약관 · 개인정보처리방침은 서버 페이지를 새 탭으로 연다', () => {
    renderPanel('menu');
    expect(screen.getByRole('link', { name: '서비스 약관' })).toHaveAttribute(
      'href',
      'https://snutt-api.test/terms_of_service',
    );
    expect(screen.getByRole('link', { name: '개인정보처리방침' })).toHaveAttribute('target', '_blank');
  });

  it('로그아웃은 묻고 나서 토큰을 지운다', async () => {
    const logout = vi.fn(() => new HttpResponse(null, { status: 200 }));
    server.use(http.post(api('/v2/auth/logout'), logout));
    renderPanel('menu');

    await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));
    const dialog = await screen.findByRole('alertdialog', { name: '로그아웃 하시겠습니까?' });
    await userEvent.click(within(dialog).getByRole('button', { name: '확인' }));
    expect(getAuthTokens()).toBeNull();
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });
});

describe('내 계정', () => {
  it('닉네임 · 이메일 · SNS 연동 상태를 보여 준다', async () => {
    const { onNavigate, onCollapse } = renderPanel('account');
    expect(await screen.findByText('고독한 초코와플#1234')).toBeInTheDocument();
    expect(screen.getByText('waffle@snu.ac.kr')).toBeInTheDocument();
    expect(screen.getByText('카카오 계정').parentElement).toHaveTextContent('연동됨');
    expect(screen.getByText('구글 계정').parentElement).toHaveTextContent('연동하기');
    // 애플은 웹 로그인이 없어 앱에서만 연동한다
    expect(screen.getByText('애플 계정').parentElement).toHaveTextContent('앱에서 연동할 수 있습니다');

    await userEvent.click(screen.getByRole('button', { name: '더보기로' }));
    expect(onNavigate).toHaveBeenCalledWith('menu');
    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
    expect(onCollapse).toHaveBeenCalled();
  });

  it('구글 팝업에서 받은 토큰으로 연동하고, 새 토큰을 저장한다', async () => {
    const body = vi.fn();
    getPopupAccessToken.mockResolvedValue('google-access');
    server.use(
      http.post(api('/v2/users/me/social/GOOGLE'), async ({ request }) => {
        body(await request.json());
        return HttpResponse.json({ authProviders: ['LOCAL', 'KAKAO', 'GOOGLE'], accessToken: 'new', refreshToken: 'new-r' });
      }),
    );
    renderPanel('account');
    await userEvent.click(await screen.findByRole('button', { name: '구글 계정 연동하기' }));

    expect(await screen.findByText('구글 계정을 연동했습니다')).toBeInTheDocument();
    expect(screen.getByText('구글 계정').parentElement).toHaveTextContent('연동됨');
    expect(body).toHaveBeenCalledWith({ token: 'google-access' });
    expect(getAuthTokens()).toEqual({ accessToken: 'new', refreshToken: 'new-r' });
  });

  it('카카오 연동은 이 화면으로 돌아오도록 카카오 화면으로 보낸다', async () => {
    server.use(http.get(api('/v2/users/me'), () => HttpResponse.json({ ...ME, authProviders: ['LOCAL'] })));
    window.history.replaceState(null, '', '/?panel=more&page=account');
    renderPanel('account');
    await userEvent.click(await screen.findByRole('button', { name: '카카오 계정 연동하기' }));
    expect(startKakaoAuth).toHaveBeenCalledWith({ purpose: 'link', next: '/?panel=more&page=account' });
  });

  it('해제는 묻고 나서 하고, 새 토큰을 저장한다', async () => {
    server.use(
      http.delete(api('/v2/users/me/social/KAKAO'), () =>
        HttpResponse.json({ authProviders: ['LOCAL'], accessToken: 'new', refreshToken: 'new-r' }),
      ),
    );
    renderPanel('account');
    await userEvent.click(await screen.findByRole('button', { name: '카카오 계정 연동 해제' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('카카오 계정 연동을 해제하시겠습니까?');
    await userEvent.click(within(dialog).getByRole('button', { name: '해제' }));

    expect(await screen.findByText('카카오 계정 연동을 해제했습니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '카카오 계정 연동하기' })).toBeInTheDocument();
    expect(getAuthTokens()).toEqual({ accessToken: 'new', refreshToken: 'new-r' });
  });

  it('서버가 해제를 거절하면 이유를 알린다', async () => {
    server.use(
      http.delete(api('/v2/users/me/social/KAKAO'), () =>
        HttpResponse.json(problem(400, 'cannot-unlink', '해제 실패', '마지막 로그인 방법은 해제할 수 없습니다'), {
          status: 400,
        }),
      ),
    );
    renderPanel('account');
    await userEvent.click(await screen.findByRole('button', { name: '카카오 계정 연동 해제' }));
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: '해제' }));
    expect(await screen.findByText('마지막 로그인 방법은 해제할 수 없습니다')).toBeInTheDocument();
    expect(screen.getByText('카카오 계정').parentElement).toHaveTextContent('연동됨');
  });

  it('아이디로 가입하지 않았으면 비밀번호 변경이 없다', async () => {
    server.use(http.get(api('/v2/users/me'), () => HttpResponse.json({ ...ME, authProviders: ['KAKAO'] })));
    renderPanel('account');
    await screen.findByText('고독한 초코와플#1234');
    expect(screen.queryByRole('button', { name: '비밀번호 변경' })).not.toBeInTheDocument();
  });

  it('닉네임을 바꾸면 서버가 붙인 태그와 함께 보여 준다', async () => {
    const patch = vi.fn((body: SnuttV2.UpdateUserRequest) => body);
    server.use(
      http.patch(api('/v2/users/me'), async ({ request }) => {
        const { nickname } = patch((await request.json()) as SnuttV2.UpdateUserRequest);
        return HttpResponse.json({ ...ME, nickname, nicknameTag: '5678' });
      }),
    );
    renderPanel('account');

    await userEvent.click(await screen.findByRole('button', { name: '닉네임 바꾸기' }));
    const field = screen.getByRole('textbox', { name: '닉네임' });
    await userEvent.clear(field);
    await userEvent.type(field, '  졸린 와플 ');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('졸린 와플#5678')).toBeInTheDocument();
    expect(patch).toHaveBeenCalledTimes(1);
    expect(patch).toHaveBeenCalledWith({ nickname: '졸린 와플' });
  });

  it('닉네임을 바꾸지 못하면 서버 메시지를 입력칸 아래에 쓴다', async () => {
    server.use(
      http.patch(api('/v2/users/me'), () =>
        HttpResponse.json(problem(400, 'invalid-nickname', 'Bad Request', '닉네임 형식이 올바르지 않습니다'), {
          status: 400,
        }),
      ),
    );
    renderPanel('account');
    await userEvent.click(await screen.findByRole('button', { name: '닉네임 바꾸기' }));
    await userEvent.type(screen.getByRole('textbox', { name: '닉네임' }), '!');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('닉네임 형식이 올바르지 않습니다')).toBeInTheDocument();
  });

  it('비밀번호 변경은 입력을 확인하고, 바꾸면 서버가 준 새 토큰을 저장한다', async () => {
    const change = vi.fn(() => HttpResponse.json({ accessToken: 'a2', refreshToken: 'r2' }));
    server.use(http.patch(api('/v2/users/me/password'), change));
    renderPanel('account');

    await userEvent.click(await screen.findByRole('button', { name: '비밀번호 변경' }));
    const dialog = await screen.findByRole('dialog', { name: '비밀번호 변경' });
    await userEvent.type(within(dialog).getByLabelText('새로운 비밀번호'), 'abc');
    await userEvent.type(within(dialog).getByLabelText('비밀번호 확인'), 'abd');
    await userEvent.click(within(dialog).getByRole('button', { name: '변경' }));
    expect(within(dialog).getByText('비밀번호를 확인해 주세요.')).toBeInTheDocument();
    expect(within(dialog).getByText('영문과 숫자 포함 6~20자 내외여야 합니다.')).toBeInTheDocument();
    expect(within(dialog).getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();

    await userEvent.type(within(dialog).getByLabelText('현재 비밀번호'), 'old1234');
    await userEvent.clear(within(dialog).getByLabelText('새로운 비밀번호'));
    await userEvent.type(within(dialog).getByLabelText('새로운 비밀번호'), 'new1234');
    await userEvent.clear(within(dialog).getByLabelText('비밀번호 확인'));
    await userEvent.type(within(dialog).getByLabelText('비밀번호 확인'), 'new1234');
    await userEvent.click(within(dialog).getByRole('button', { name: '변경' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: '비밀번호 변경' })).not.toBeInTheDocument());
    expect(getAuthTokens()).toEqual({ accessToken: 'a2', refreshToken: 'r2' });
    expect(await screen.findByRole('status')).toHaveTextContent('비밀번호를 바꿨습니다');
  });

  it('현재 비밀번호가 틀리면 그 칸 아래에 알린다', async () => {
    server.use(
      http.patch(api('/v2/users/me/password'), () =>
        HttpResponse.json(problem(403, 'password-mismatch', 'Forbidden', '비밀번호가 일치하지 않습니다'), {
          status: 403,
        }),
      ),
    );
    renderPanel('account');
    await userEvent.click(await screen.findByRole('button', { name: '비밀번호 변경' }));
    const dialog = await screen.findByRole('dialog', { name: '비밀번호 변경' });
    await userEvent.type(within(dialog).getByLabelText('현재 비밀번호'), 'wrong1');
    await userEvent.type(within(dialog).getByLabelText('새로운 비밀번호'), 'new1234');
    await userEvent.type(within(dialog).getByLabelText('비밀번호 확인'), 'new1234');
    await userEvent.click(within(dialog).getByRole('button', { name: '변경' }));
    expect(await within(dialog).findByText('비밀번호를 확인해 주세요.')).toBeInTheDocument();
    expect(getAuthTokens()).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('계정삭제는 묻고 나서 지우고 토큰을 지운다', async () => {
    const remove = vi.fn(() => new HttpResponse(null, { status: 200 }));
    server.use(http.delete(api('/v2/users/me'), remove));
    renderPanel('account');

    await userEvent.click(await screen.findByRole('button', { name: '계정삭제' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('정말 SNUTT 계정을 삭제하시겠습니까?');
    await userEvent.click(within(dialog).getByRole('button', { name: '취소' }));
    expect(remove).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: '계정삭제' }));
    await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: '삭제' }));
    await waitFor(() => expect(getAuthTokens()).toBeNull());
    expect(remove).toHaveBeenCalledTimes(1);
  });
});

describe('알림', () => {
  const notification = (id: number, extra: Partial<SnuttV2.NotificationResponse> = {}) => ({
    id,
    title: `알림 ${id}`,
    message: `내용 ${id}`,
    type: 1 as const,
    // 2026-08-27 10:28 (KST)
    createdAt: Date.UTC(2026, 7, 27, 1, 28),
    ...extra,
  });

  it('알림을 최근 것부터 날짜와 함께 보여 준다. 목록을 열었다고 서버에 알린다', async () => {
    const queries: URLSearchParams[] = [];
    server.use(
      http.get(api('/v2/notifications'), ({ request }) => {
        queries.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          content: [notification(1, { title: '친구 요청 수락', type: 5 }), notification(2)],
          size: 2,
          last: true,
        });
      }),
    );
    renderPanel('notifications');

    expect(await screen.findByText('친구 요청 수락')).toBeInTheDocument();
    expect(screen.getByText('알림 2')).toBeInTheDocument();
    expect(screen.getAllByText('2026. 8. 27. 오전 10:28')).toHaveLength(2);
    expect(queries[0].get('explicit')).toBe('true');
  });

  it('알림이 없으면 안내한다', async () => {
    server.use(http.get(api('/v2/notifications'), () => HttpResponse.json({ content: [], size: 0, last: true })));
    renderPanel('notifications');
    expect(await screen.findByText('알림이 없습니다')).toBeInTheDocument();
  });
});

describe('색상 모드', () => {
  it('고른 모드로 바꾸고 좌측 바 테마 버튼과 같은 곳에 저장한다', async () => {
    renderPanel('color-mode');
    expect(screen.getByRole('radio', { name: '라이트 모드' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: '다크 모드' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('snutt-theme')).toBe('dark');
  });
});

describe('시간표 설정', () => {
  it('켜고 끈 것을 이 브라우저에 저장한다. 꽉찬 시간표는 아직 누를 수 없다', async () => {
    renderPanel('timetable-settings');
    const lectureNumber = screen.getByRole('switch', { name: '분반 정보' });
    expect(lectureNumber).not.toBeChecked();
    await userEvent.click(lectureNumber);
    expect(lectureNumber).toBeChecked();
    await userEvent.click(screen.getByRole('switch', { name: '자동 맞춤' }));

    expect(JSON.parse(localStorage.getItem('snutt-web:timetable-settings') ?? '{}')).toMatchObject({
      autoFit: true,
      display: { title: true, place: true, lectureNumber: true, instructor: false },
    });
    expect(screen.getByRole('switch', { name: '꽉찬 시간표' })).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('개발자 괴롭히기', () => {
  it('문의내용을 써야 보낼 수 있고, 이메일은 내 계정의 이메일로 채워 둔다', async () => {
    const send = vi.fn((body: SnuttV2.FeedbackPostRequest) => body);
    server.use(
      http.post(api('/v2/feedback'), async ({ request }) => {
        send((await request.json()) as SnuttV2.FeedbackPostRequest);
        return new HttpResponse(null, { status: 200 });
      }),
    );
    renderPanel('feedback');

    expect(await screen.findByDisplayValue('waffle@snu.ac.kr')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: '전송' });
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox', { name: '문의내용' }), '  버그가 있어요 ');
    await userEvent.click(submit);

    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    expect(send).toHaveBeenCalledWith({ email: 'waffle@snu.ac.kr', message: '버그가 있어요' });
    expect(await screen.findByRole('status')).toHaveTextContent('보냈습니다');
    expect(screen.getByRole('textbox', { name: '문의내용' })).toHaveValue('');
  });
});
