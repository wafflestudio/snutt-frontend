'use client';

import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';
import { buildingQueries } from '@/api/buildings';
import { type Building, type GeoPoint, getBuildingLabel, getLecturePlaces, getMappableBuildings } from '@/domain/building';
import type { ClassTime } from '@/domain/lecture';
import { isNaverMapAvailable, loadNaverMaps, type NaverMaps, onNaverMapAuthFailure } from '@/shared/lib/naver-map';
import { IconChevronDown, IconLocationFill } from '@/shared/ui/icons';

type MappableBuilding = Building & { location: GeoPoint };

/**
 * `시간 및 장소` 아래의 강의실 지도 (Figma `강의 상세 패널_색상 선택`). `지도에서 보기` 를 누르면 펼치고 `지도 접기` 로 접는다.
 * 강의 장소의 건물 중 위치를 아는 것이 없으면(장소가 없거나 서버가 모르는 건물) 아무것도 그리지 않는다.
 * Figma 의 지도는 예시 이미지라 마커 · 버튼 모양은 네이버 지도 위에 임시로 맞췄다 (디자인 문의 4-34)
 */
export function LectureMap({ classTimes }: { classTimes: readonly ClassTime[] }) {
  const places = getLecturePlaces(classTimes);
  // Client ID 가 없는 환경(테스트 등)이나 장소가 없는 강의는 건물을 묻지 않는다
  if (!isNaverMapAvailable() || places.length === 0) return null;
  return <FoldableMap places={places} />;
}

function FoldableMap({ places }: { places: readonly string[] }) {
  const buildings = useQuery(buildingQueries.byPlaces(places));
  const [open, setOpen] = useState(false);
  const mapId = useId();

  const mappable = getMappableBuildings(buildings.data ?? []);
  if (mappable.length === 0) return null;

  return (
    // Figma: 지도 높이 285, 둥글기 20, 지도와 접기 줄 사이 5. 접기 줄은 높이 48(위아래 12), 글자 14/Regular Text/alternative
    <div className="flex flex-col gap-1.25">
      {open && <NaverMapView id={mapId} buildings={mappable} />}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? mapId : undefined}
        onClick={() => setOpen(!open)}
        className="flex h-12 items-center justify-center gap-1 rounded-md text-14-regular text-alternative focus-visible:outline-2 focus-visible:outline-snutt-mint"
      >
        {!open && <IconLocationFill className="size-4 text-snutt-red" />}
        {open ? '지도 접기' : '지도에서 보기'}
        <IconChevronDown className={clsx('size-4', open && 'rotate-180')} />
      </button>
    </div>
  );
}

/** 건물마다 마커를 둔다. 한 곳이면 그 건물을 가운데에, 여러 곳이면 모두 보이게 맞춘다 */
function NaverMapView({ id, buildings }: { id: string; buildings: readonly MappableBuilding[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  // 같은 건물 목록이면 지도를 다시 만들지 않는다
  const key = buildings.map((building) => building.id).join(',');

  useEffect(() => {
    let destroyed = false;
    let destroy = () => {};
    const stopListening = onNaverMapAuthFailure(() => setFailed(true));

    loadNaverMaps()
      .then((maps) => {
        if (destroyed || !container.current) return;
        destroy = drawMap(maps, container.current, buildings);
      })
      .catch(() => !destroyed && setFailed(true));

    return () => {
      destroyed = true;
      stopListening();
      destroy();
    };
    // buildings 는 key 가 같으면 같은 내용이다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div
      id={id}
      role="region"
      aria-label="강의실 지도"
      className="relative h-71.25 overflow-hidden rounded-[20px] bg-light-field"
    >
      <div ref={container} className="size-full" />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center text-14-regular text-alternative">
          지도를 불러오지 못했습니다
        </p>
      )}
    </div>
  );
}

const drawMap = (maps: NaverMaps, element: HTMLElement, buildings: readonly MappableBuilding[]) => {
  const toLatLng = ({ location }: MappableBuilding) => new maps.LatLng(location.latitude, location.longitude);
  const map = new maps.Map(element, {
    center: toLatLng(buildings[0]),
    zoom: 17,
    scaleControl: false,
    mapDataControl: false,
    logoControlOptions: { position: 1 },
  });
  for (const building of buildings)
    new maps.Marker({
      map,
      position: toLatLng(building),
      title: building.nameKor,
      icon: { content: createMarker(building), anchor: new maps.Point(0, 0) },
    });

  if (buildings.length > 1) {
    const latitudes = buildings.map(({ location }) => location.latitude);
    const longitudes = buildings.map(({ location }) => location.longitude);
    map.fitBounds(
      new maps.LatLngBounds(
        new maps.LatLng(Math.min(...latitudes), Math.min(...longitudes)),
        new maps.LatLng(Math.max(...latitudes), Math.max(...longitudes)),
      ),
      { top: 48, right: 48, bottom: 48, left: 48 },
    );
  }
  return () => map.destroy();
};

/** 마커: 점(Figma 는 검은 핀) 아래에 `50동`. 지도는 다크 테마에서도 밝아서, 토큰 색이 뒤집혀도 보이게 테두리를 둔다. 서버 값은 글자로만 넣는다 */
const createMarker = (building: Building) => {
  const marker = document.createElement('div');
  marker.className = 'flex -translate-x-1/2 -translate-y-2.5 flex-col items-center gap-0.5';
  const dot = document.createElement('span');
  dot.className = 'size-5 rounded-full border-4 border-line-border bg-icon-on-item shadow-md';
  const label = document.createElement('span');
  label.className = 'rounded-full bg-normal px-1.5 text-12-medium whitespace-nowrap text-normal shadow-sm';
  label.textContent = getBuildingLabel(building);
  marker.append(dot, label);
  return marker;
};
