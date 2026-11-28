import { describe, expect, it } from 'vitest';
import { type Building, getBuildingLabel, getLecturePlaces, getMappableBuildings } from '@/domain/building';

const building = (id: string, location: Building['location']): Building => ({
  id,
  number: id,
  nameKor: `${id}동`,
  nameEng: id,
  campus: 'gwanak',
  location,
});

describe('getLecturePlaces', () => {
  it('비어 있지 않은 장소를 한 번씩 정렬해서 돌려준다', () => {
    expect(
      getLecturePlaces([{ place: '83-604' }, { place: '301-118' }, { place: '83-604' }, { place: null }, { place: ' ' }]),
    ).toEqual(['301-118', '83-604']);
  });

  it('장소가 없으면 빈 목록', () => {
    expect(getLecturePlaces([])).toEqual([]);
  });
});

describe('getMappableBuildings', () => {
  it('위치를 아는 건물만 남긴다', () => {
    const known = building('301', { latitude: 37.45, longitude: 126.95 });
    expect(getMappableBuildings([known, building('999', null)])).toEqual([known]);
  });
});

it('마커 글자는 `<건물 번호>동`', () => {
  expect(getBuildingLabel({ number: '43-1' })).toBe('43-1동');
});
