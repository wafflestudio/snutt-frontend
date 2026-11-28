// @vitest-environment jsdom
import type { SnuttV2 } from '@sf/snutt-api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClassTime } from '@/domain/lecture';
import { LectureMap } from '@/features/main/components/LectureMap';
import { api, server } from '../../msw/server';

// 네이버 지도 SDK 는 브라우저 밖이라 가짜로 바꾼다. 만든 지도 · 마커를 기록한다
const sdk = vi.hoisted(() => ({
  available: true,
  maps: [] as { center: unknown; destroyed: boolean; bounds: unknown }[],
  markers: [] as { title: string; label: string | null }[],
  fail: false,
}));
vi.mock('@/shared/lib/naver-map', () => ({
  isNaverMapAvailable: () => sdk.available,
  onNaverMapAuthFailure: () => () => {},
  loadNaverMaps: async () => {
    if (sdk.fail) throw new Error('load failed');
    return {
      LatLng: class {
        constructor(
          readonly latitude: number,
          readonly longitude: number,
        ) {}
      },
      LatLngBounds: class {
        constructor(
          readonly southWest: unknown,
          readonly northEast: unknown,
        ) {}
      },
      Point: class {},
      Map: class {
        record = { center: null as unknown, destroyed: false, bounds: null as unknown };
        constructor(_element: HTMLElement, options: { center: unknown }) {
          this.record.center = options.center;
          sdk.maps.push(this.record);
        }
        fitBounds(bounds: unknown) {
          this.record.bounds = bounds;
        }
        destroy() {
          this.record.destroyed = true;
        }
      },
      Marker: class {
        constructor(options: { title: string; icon: { content: HTMLElement } }) {
          sdk.markers.push({ title: options.title, label: options.icon.content.textContent });
        }
        setMap() {}
      },
    };
  },
}));

const BUILDINGS: SnuttV2.BuildingResponse[] = [
  {
    id: 1,
    buildingNumber: '301',
    buildingNameKor: '신공학관1',
    buildingNameEng: 'Engineering Building 1',
    campus: 'GWANAK',
    location: { latitude: 37.4498, longitude: 126.9525 },
  },
  { id: 2, buildingNumber: '999', buildingNameKor: '위치 모름', buildingNameEng: '', campus: 'GWANAK' },
];

const time = (place: string | null): ClassTime => ({ day: 0, startMinute: 540, endMinute: 600, place });

const renderMap = (classTimes: ClassTime[]) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <LectureMap classTimes={classTimes} />
    </QueryClientProvider>,
  );

beforeEach(() => {
  sdk.available = true;
  sdk.fail = false;
  sdk.maps.length = 0;
  sdk.markers.length = 0;
});
afterEach(() => vi.clearAllMocks());

describe('LectureMap', () => {
  it('강의 장소를 쉼표로 이어 건물을 묻고, 펼치면 위치를 아는 건물에만 마커를 둔다', async () => {
    const query = vi.fn();
    server.use(
      http.get(api('/v2/buildings'), ({ request }) => {
        query(new URL(request.url).searchParams.get('places'));
        return HttpResponse.json(BUILDINGS);
      }),
    );
    renderMap([time('301-118'), time('999-1'), time('301-118')]);

    const toggle = await screen.findByRole('button', { name: '지도에서 보기' });
    expect(query).toHaveBeenCalledWith('301-118,999-1');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    expect(screen.getByRole('region', { name: '강의실 지도' })).toBeInTheDocument();
    await waitFor(() => expect(sdk.markers).toEqual([{ title: '신공학관1', label: '301동' }]));
    expect(sdk.maps).toHaveLength(1);
    // 한 곳이면 맞추지 않고 그 건물을 가운데에 둔다
    expect(sdk.maps[0].bounds).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: '지도 접기' }));
    expect(screen.queryByRole('region', { name: '강의실 지도' })).not.toBeInTheDocument();
    expect(sdk.maps[0].destroyed).toBe(true);
  });

  it('여러 건물이면 모두 보이게 맞춘다', async () => {
    server.use(
      http.get(api('/v2/buildings'), () =>
        HttpResponse.json([
          BUILDINGS[0],
          { ...BUILDINGS[0], id: 3, buildingNumber: '83', location: { latitude: 37.46, longitude: 126.95 } },
        ]),
      ),
    );
    renderMap([time('301-118'), time('83-604')]);
    await userEvent.click(await screen.findByRole('button', { name: '지도에서 보기' }));
    await waitFor(() => expect(sdk.maps[0]?.bounds).not.toBeNull());
    expect(sdk.markers.map(({ label }) => label)).toEqual(['301동', '83동']);
  });

  it('위치를 아는 건물이 없으면 그리지 않는다', async () => {
    const query = vi.fn(() => HttpResponse.json([BUILDINGS[1]]));
    server.use(http.get(api('/v2/buildings'), query));
    const { container } = renderMap([time('999-1')]);
    await waitFor(() => expect(query).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('장소가 없거나 Client ID 가 없으면 건물을 묻지 않는다', () => {
    // 정하지 않은 요청은 MSW 가 실패시킨다
    const { container, unmount } = renderMap([time(null)]);
    expect(container).toBeEmptyDOMElement();
    unmount();

    sdk.available = false;
    expect(renderMap([time('301-118')]).container).toBeEmptyDOMElement();
  });

  it('SDK 를 불러오지 못하면 알린다', async () => {
    sdk.fail = true;
    server.use(http.get(api('/v2/buildings'), () => HttpResponse.json(BUILDINGS)));
    renderMap([time('301-118')]);
    await userEvent.click(await screen.findByRole('button', { name: '지도에서 보기' }));
    expect(await screen.findByText('지도를 불러오지 못했습니다')).toBeInTheDocument();
  });
});
