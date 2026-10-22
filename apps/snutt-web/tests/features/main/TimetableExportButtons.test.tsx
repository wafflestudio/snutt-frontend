// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toBlob } from 'html-to-image';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimetableExportButtons } from '@/features/main/components/TimetableActions';

// jsdom 은 화면을 그리지 못하므로 이미지 라이브러리는 만든 셈 치고 빈 PNG 를 돌려준다
vi.mock('html-to-image', () => ({ toBlob: vi.fn() }));

const png = new Blob(['png'], { type: 'image/png' });

/** jsdom 에 없는 Web Share API 를 붙인다 */
const stubShare = (share: (data: ShareData) => Promise<void>) => {
  Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
  Object.defineProperty(navigator, 'share', { configurable: true, value: vi.fn(share) });
};

let target: HTMLElement;

beforeEach(() => {
  vi.mocked(toBlob).mockResolvedValue(png);
  target = document.createElement('div');
  target.textContent = '월 화 수';
  document.body.append(target);
  URL.createObjectURL = vi.fn(() => 'blob:timetable');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  target.remove();
  // stubShare 로 붙인 것을 지운다
  Reflect.deleteProperty(navigator, 'canShare');
  Reflect.deleteProperty(navigator, 'share');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderButtons = (title = '시간표 1') => render(<TimetableExportButtons title={title} getTarget={() => target} />);

describe('TimetableExportButtons', () => {
  it('다운로드는 그리드를 PNG 로 만들어 `<시간표 이름>.png` 로 내려받는다', async () => {
    const clicked: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this);
    });
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: '다운로드' }));

    await waitFor(() => expect(clicked).toHaveLength(1));
    expect(clicked[0].download).toBe('시간표 1.png');
    expect(clicked[0].href).toBe('blob:timetable');
    expect(toBlob).toHaveBeenCalledWith(target, expect.objectContaining({ pixelRatio: 2 }));
    expect(URL.createObjectURL).toHaveBeenCalledWith(png);
  });

  it('공유는 파일을 공유할 수 있으면 운영체제 공유 창에 PNG 파일을 보낸다', async () => {
    stubShare(async () => {});
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: '공유' }));

    await waitFor(() => expect(navigator.share).toHaveBeenCalled());
    const [data] = vi.mocked(navigator.share).mock.calls[0];
    expect(data?.title).toBe('시간표 1');
    expect(data?.files?.[0].name).toBe('시간표 1.png');
    expect(data?.files?.[0].type).toBe('image/png');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('공유 창을 닫으면 아무 알림도 띄우지 않는다', async () => {
    stubShare(async () => {
      throw new DOMException('닫음', 'AbortError');
    });
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: '공유' }));

    await waitFor(() => expect(navigator.share).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: '공유' })).toBeEnabled());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('파일을 공유할 수 없는 브라우저면 이미지를 클립보드에 복사하고 알린다', async () => {
    const write = vi.fn(async () => {});
    vi.stubGlobal(
      'ClipboardItem',
      class {
        constructor(readonly items: Record<string, Promise<Blob>>) {}
      },
    );
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'write').mockImplementation(write);
    renderButtons();

    await user.click(screen.getByRole('button', { name: '공유' }));

    expect(await screen.findByRole('alertdialog', { name: '시간표 이미지를 복사했습니다' })).toBeInTheDocument();
    const [[[item]]] = write.mock.calls as unknown as [[[{ items: Record<string, Promise<Blob>> }]]];
    await expect(item.items['image/png']).resolves.toBe(png);
  });

  it('이미지를 만들지 못하면 알린다', async () => {
    vi.mocked(toBlob).mockRejectedValue(new Error('그리기 실패'));
    renderButtons();

    await userEvent.click(screen.getByRole('button', { name: '다운로드' }));

    expect(await screen.findByRole('alertdialog', { name: '시간표 이미지를 만들지 못했습니다' })).toBeInTheDocument();
  });
});
