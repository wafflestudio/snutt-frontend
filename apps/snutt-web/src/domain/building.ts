/** 서울대 캠퍼스 */
export type Campus = 'gwanak' | 'yeongeon' | 'pyeongchang';

export type GeoPoint = { latitude: number; longitude: number };

/** 강의실이 있는 건물 (`GET /v2/buildings`). 강의 상세의 지도에 표시한다 */
export type Building = {
  id: string;
  /** `301`, `43-1` 처럼 강의 장소(`301-118`)의 앞부분 */
  number: string;
  nameKor: string;
  nameEng: string;
  campus: Campus;
  /** 위치를 모르면 null. 지도에 표시하지 않는다 */
  location: GeoPoint | null;
};

/** 지도에 보낼 장소 목록: 비어 있지 않은 장소를 한 번씩, 정렬해서 (같은 강의는 같은 요청이 되도록) */
export const getLecturePlaces = (classTimes: readonly { place: string | null }[]) =>
  [...new Set(classTimes.flatMap(({ place }) => (place?.trim() ? [place.trim()] : [])))].sort();

/** 지도에 표시할 수 있는 건물(위치가 있는 것)만 */
export const getMappableBuildings = (buildings: readonly Building[]) =>
  buildings.filter((building): building is Building & { location: GeoPoint } => building.location !== null);

/** 마커 글자 (Figma `50동`) */
export const getBuildingLabel = (building: Pick<Building, 'number'>) => `${building.number}동`;
